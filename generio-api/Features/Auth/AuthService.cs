using Generio.Api.Configuration;
using Generio.Api.Domain.Entities;
using Generio.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Generio.Api.Features.Auth;

public record LoginRequest(string Email, string Password);
public record RefreshRequest(string RefreshToken);
public record AuthResponse(string AccessToken, string RefreshToken, DateTime AccessTokenExpiresAt, UserSummary User);
public record UserSummary(Guid Id, string Email, string FullName, IReadOnlyList<string> Roles, IReadOnlyList<string> Permissions);

public class AuthService(GenerioDbContext db, JwtTokenService tokens, IOptions<JwtOptions> jwtOptions)
{
    private readonly JwtOptions _jwt = jwtOptions.Value;

    public async Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await LoadUserAsync(email, ct);

        if (user is null || !user.IsActive)
        {
            return null;
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return null;
        }

        user.LastLoginAt = DateTime.UtcNow;
        return await IssueTokensAsync(user, ct);
    }

    public async Task<AuthResponse?> RefreshAsync(RefreshRequest request, CancellationToken ct = default)
    {
        var hash = JwtTokenService.HashToken(request.RefreshToken);
        var existing = await db.RefreshTokens
            .Include(t => t.User)
            .ThenInclude(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.RolePermissions)
            .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(t => t.TokenHash == hash, ct);

        if (existing is null || !existing.IsActive || !existing.User.IsActive)
        {
            return null;
        }

        existing.RevokedAt = DateTime.UtcNow;
        var response = await IssueTokensAsync(existing.User, ct);
        existing.ReplacedByTokenHash = JwtTokenService.HashToken(response.RefreshToken);
        await db.SaveChangesAsync(ct);
        return response;
    }

    public async Task<bool> LogoutAsync(string refreshToken, CancellationToken ct = default)
    {
        var hash = JwtTokenService.HashToken(refreshToken);
        var existing = await db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash, ct);
        if (existing is null)
        {
            return false;
        }

        existing.RevokedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return true;
    }

    private async Task<User?> LoadUserAsync(string email, CancellationToken ct) =>
        await db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.RolePermissions)
            .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Email == email, ct);

    private async Task<AuthResponse> IssueTokensAsync(User user, CancellationToken ct)
    {
        var roles = user.UserRoles.Select(ur => ur.Role.Name).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions.Select(rp => rp.Permission.Code))
            .Distinct()
            .ToList();

        if (roles.Contains("SuperAdministrator"))
        {
            permissions = await db.Permissions.Select(p => p.Code).ToListAsync(ct);
        }

        var accessToken = tokens.CreateAccessToken(user, roles, permissions);
        var refresh = tokens.CreateRefreshToken();
        var accessExpires = DateTime.UtcNow.AddMinutes(_jwt.AccessTokenMinutes);

        db.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = refresh.TokenHash,
            ExpiresAt = refresh.ExpiresAt,
            CreatedAt = DateTime.UtcNow
        });

        await db.SaveChangesAsync(ct);

        return new AuthResponse(
            accessToken,
            refresh.RawToken,
            accessExpires,
            new UserSummary(user.Id, user.Email, user.FullName, roles, permissions));
    }
}
