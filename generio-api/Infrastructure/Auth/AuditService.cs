using Generio.Api.Domain.Entities;
using Generio.Api.Infrastructure.Data;

namespace Generio.Api.Infrastructure.Auth;

public class AuditService(GenerioDbContext db, IHttpContextAccessor httpContextAccessor)
{
    public async Task WriteAsync(
        string action,
        string entityType,
        string? entityId = null,
        string? details = null,
        Guid? userId = null,
        string? userEmail = null,
        CancellationToken ct = default)
    {
        var http = httpContextAccessor.HttpContext;
        var user = http?.User;

        db.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId ?? user?.GetUserId(),
            UserEmail = userEmail ?? user?.GetEmail(),
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            IpAddress = http?.Connection.RemoteIpAddress?.ToString(),
            CreatedAt = DateTime.UtcNow
        });

        await db.SaveChangesAsync(ct);
    }
}
