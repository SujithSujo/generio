using Generio.Api.Infrastructure.Auth;
using Generio.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Generio.Api.Features.Admin;

public static class AdminEndpoints
{
    public static RouteGroupBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin").WithTags("Admin").RequireAuthorization();

        group.MapGet("/dashboard", async (GenerioDbContext db, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.DashboardView))
            {
                return Results.Forbid();
            }

            return Results.Ok(new
            {
                users = await db.Users.CountAsync(),
                roles = await db.Roles.CountAsync(),
                permissions = await db.Permissions.CountAsync(),
                auditLogs = await db.AuditLogs.CountAsync(),
                settings = await db.SiteSettings.CountAsync(),
                pages = await db.Pages.CountAsync(),
                services = await db.Services.CountAsync(s => s.IsActive),
                industries = await db.Industries.CountAsync(i => i.IsActive),
                marketRegions = await db.MarketRegions.CountAsync(r => r.IsActive),
                partners = await db.Partners.CountAsync(p => p.IsActive),
                successStories = await db.SuccessStories.CountAsync(s => s.IsPublished),
                enquiries = await db.ContactEnquiries.CountAsync(),
                newEnquiries = await db.ContactEnquiries.CountAsync(e => e.Status == Domain.Enums.EnquiryStatus.New),
                recentAudit = await db.AuditLogs
                    .OrderByDescending(a => a.CreatedAt)
                    .Take(8)
                    .Select(a => new
                    {
                        a.Id,
                        a.Action,
                        a.EntityType,
                        a.UserEmail,
                        a.CreatedAt
                    })
                    .ToListAsync()
            });
        });

        group.MapGet("/settings", async (GenerioDbContext db, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.SettingsView))
            {
                return Results.Forbid();
            }

            var settings = await db.SiteSettings
                .OrderBy(s => s.Key)
                .Select(s => new
                {
                    s.Id,
                    s.Key,
                    s.Value,
                    s.Description,
                    s.UpdatedAt
                })
                .ToListAsync();

            return Results.Ok(settings);
        });

        group.MapPut("/settings", async (UpdateSettingsRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.SettingsEdit))
            {
                return Results.Forbid();
            }

            if (request.Settings is null || request.Settings.Count == 0)
            {
                return Results.BadRequest(new { message = "Settings payload is required." });
            }

            var keys = request.Settings.Select(s => s.Key).ToList();
            var existing = await db.SiteSettings.Where(s => keys.Contains(s.Key)).ToListAsync();

            foreach (var item in request.Settings)
            {
                var setting = existing.FirstOrDefault(s => s.Key == item.Key);
                if (setting is null)
                {
                    continue;
                }

                setting.Value = item.Value ?? string.Empty;
                setting.UpdatedAt = DateTime.UtcNow;
                setting.UpdatedByUserId = http.User.GetUserId();
            }

            await db.SaveChangesAsync();
            await audit.WriteAsync("Update", "SiteSettings", details: $"Updated keys: {string.Join(", ", keys)}");

            return Results.Ok(await db.SiteSettings.OrderBy(s => s.Key).ToListAsync());
        });

        group.MapGet("/users", async (GenerioDbContext db, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.UsersView))
            {
                return Results.Forbid();
            }

            var users = await db.Users
                .OrderBy(u => u.Email)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.FullName,
                    u.IsActive,
                    u.CreatedAt,
                    u.LastLoginAt,
                    roles = u.UserRoles.Select(ur => ur.Role.Name).ToArray()
                })
                .ToListAsync();

            return Results.Ok(users);
        });

        group.MapGet("/roles", async (GenerioDbContext db, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.RolesView))
            {
                return Results.Forbid();
            }

            var roles = await db.Roles
                .OrderBy(r => r.Name)
                .Select(r => new
                {
                    r.Id,
                    r.Name,
                    r.Description,
                    permissions = r.RolePermissions.Select(rp => rp.Permission.Code).OrderBy(c => c).ToArray(),
                    userCount = r.UserRoles.Count
                })
                .ToListAsync();

            return Results.Ok(roles);
        });

        group.MapGet("/permissions", async (GenerioDbContext db, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.RolesView))
            {
                return Results.Forbid();
            }

            var permissions = await db.Permissions
                .OrderBy(p => p.GroupName)
                .ThenBy(p => p.Code)
                .Select(p => new
                {
                    p.Id,
                    p.Code,
                    p.Name,
                    p.GroupName,
                    p.Description
                })
                .ToListAsync();

            return Results.Ok(permissions);
        });

        group.MapGet("/audit-logs", async (GenerioDbContext db, HttpContext http, int take = 50) =>
        {
            if (!http.User.HasPermission(PermissionCodes.AuditView))
            {
                return Results.Forbid();
            }

            take = Math.Clamp(take, 1, 200);
            var logs = await db.AuditLogs
                .OrderByDescending(a => a.CreatedAt)
                .Take(take)
                .Select(a => new
                {
                    a.Id,
                    a.UserEmail,
                    a.Action,
                    a.EntityType,
                    a.EntityId,
                    a.Details,
                    a.IpAddress,
                    a.CreatedAt
                })
                .ToListAsync();

            return Results.Ok(logs);
        });

        return group;
    }
}

public record SettingItem(string Key, string? Value);
public record UpdateSettingsRequest(List<SettingItem> Settings);
