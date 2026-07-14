using FluentValidation;
using Generio.Api.Infrastructure.Auth;

namespace Generio.Api.Features.Auth;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/login", async (LoginRequest request, AuthService auth, AuditService audit, IValidator<LoginRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
            {
                return Results.ValidationProblem(validation.ToDictionary());
            }

            var result = await auth.LoginAsync(request);
            if (result is null)
            {
                return Results.Unauthorized();
            }

            await audit.WriteAsync(
                "Login",
                "User",
                result.User.Id.ToString(),
                $"User {result.User.Email} logged in",
                result.User.Id,
                result.User.Email);
            return Results.Ok(result);
        });

        group.MapPost("/refresh", async (RefreshRequest request, AuthService auth, IValidator<RefreshRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
            {
                return Results.ValidationProblem(validation.ToDictionary());
            }

            var result = await auth.RefreshAsync(request);
            return result is null ? Results.Unauthorized() : Results.Ok(result);
        });

        group.MapPost("/logout", async (RefreshRequest request, AuthService auth, AuditService audit) =>
        {
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                return Results.BadRequest(new { message = "RefreshToken is required." });
            }

            await auth.LogoutAsync(request.RefreshToken);
            await audit.WriteAsync("Logout", "User", details: "Refresh token revoked");
            return Results.NoContent();
        });

        group.MapGet("/me", (HttpContext http) =>
        {
            if (http.User.Identity?.IsAuthenticated != true)
            {
                return Results.Unauthorized();
            }

            return Results.Ok(new
            {
                id = http.User.GetUserId(),
                email = http.User.GetEmail(),
                name = http.User.Identity?.Name,
                roles = http.User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToArray(),
                permissions = http.User.FindAll("permission").Select(c => c.Value).ToArray()
            });
        }).RequireAuthorization();

        return group;
    }
}

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
    }
}

public class RefreshRequestValidator : AbstractValidator<RefreshRequest>
{
    public RefreshRequestValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}
