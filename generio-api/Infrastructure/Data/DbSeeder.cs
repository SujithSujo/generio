using Generio.Api.Domain.Entities;
using Generio.Api.Infrastructure.Auth;
using Microsoft.EntityFrameworkCore;

namespace Generio.Api.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(GenerioDbContext db, IConfiguration config, ILogger logger)
    {
        await db.Database.MigrateAsync();

        await SeedPermissionsAsync(db);
        var roles = await SeedRolesAsync(db);
        await SeedRolePermissionsAsync(db, roles);
        await SeedSiteSettingsAsync(db);
        await SeedAdminAsync(db, config, roles["SuperAdministrator"], logger);
        await ContentSeeder.SeedAsync(db, logger);

        await db.SaveChangesAsync();
    }

    private static async Task SeedPermissionsAsync(GenerioDbContext db)
    {
        var existing = await db.Permissions.Select(p => p.Code).ToListAsync();
        foreach (var (code, name, group) in PermissionCodes.All)
        {
            if (existing.Contains(code))
            {
                continue;
            }

            db.Permissions.Add(new Permission
            {
                Id = Guid.NewGuid(),
                Code = code,
                Name = name,
                GroupName = group,
                Description = name
            });
        }

        await db.SaveChangesAsync();
    }

    private static async Task<Dictionary<string, Role>> SeedRolesAsync(GenerioDbContext db)
    {
        var definitions = new (string Name, string Description)[]
        {
            ("SuperAdministrator", "Full system access"),
            ("ContentAdministrator", "Manage content and media"),
            ("MarketingUser", "Manage campaigns and SEO"),
            ("EnquiryManager", "Manage enquiries"),
            ("Translator", "Manage translations"),
            ("Viewer", "Read-only CMS access")
        };

        foreach (var (name, description) in definitions)
        {
            if (!await db.Roles.AnyAsync(r => r.Name == name))
            {
                db.Roles.Add(new Role
                {
                    Id = Guid.NewGuid(),
                    Name = name,
                    Description = description
                });
            }
        }

        await db.SaveChangesAsync();
        return await db.Roles.ToDictionaryAsync(r => r.Name);
    }

    private static async Task SeedRolePermissionsAsync(GenerioDbContext db, Dictionary<string, Role> roles)
    {
        var permissions = await db.Permissions.ToDictionaryAsync(p => p.Code);
        var existing = await db.RolePermissions
            .Select(rp => new { rp.RoleId, rp.PermissionId })
            .ToListAsync();

        void Grant(string roleName, params string[] codes)
        {
            if (!roles.TryGetValue(roleName, out var role))
            {
                return;
            }

            foreach (var code in codes)
            {
                if (!permissions.TryGetValue(code, out var permission))
                {
                    continue;
                }

                if (existing.Any(e => e.RoleId == role.Id && e.PermissionId == permission.Id))
                {
                    continue;
                }

                db.RolePermissions.Add(new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = permission.Id
                });
            }
        }

        Grant("SuperAdministrator", PermissionCodes.All.Select(p => p.Code).ToArray());
        Grant("ContentAdministrator",
            PermissionCodes.DashboardView,
            PermissionCodes.SettingsView,
            PermissionCodes.UsersView,
            PermissionCodes.PagesView, PermissionCodes.PagesEdit,
            PermissionCodes.ServicesView, PermissionCodes.ServicesEdit,
            PermissionCodes.IndustriesView, PermissionCodes.IndustriesEdit,
            PermissionCodes.MarketsView, PermissionCodes.MarketsEdit,
            PermissionCodes.PartnersView, PermissionCodes.PartnersEdit,
            PermissionCodes.StoriesView, PermissionCodes.StoriesEdit,
            PermissionCodes.MediaView, PermissionCodes.MediaEdit,
            PermissionCodes.SeoView, PermissionCodes.SeoEdit);
        Grant("MarketingUser",
            PermissionCodes.DashboardView,
            PermissionCodes.SettingsView,
            PermissionCodes.PagesView, PermissionCodes.PagesEdit,
            PermissionCodes.ServicesView,
            PermissionCodes.StoriesView, PermissionCodes.StoriesEdit,
            PermissionCodes.SeoView, PermissionCodes.SeoEdit,
            PermissionCodes.MediaView);
        Grant("EnquiryManager",
            PermissionCodes.DashboardView,
            PermissionCodes.EnquiriesView,
            PermissionCodes.EnquiriesEdit);
        Grant("Translator", PermissionCodes.DashboardView, PermissionCodes.PagesView);
        Grant("Viewer",
            PermissionCodes.DashboardView,
            PermissionCodes.SettingsView,
            PermissionCodes.UsersView,
            PermissionCodes.RolesView,
            PermissionCodes.AuditView,
            PermissionCodes.PagesView,
            PermissionCodes.ServicesView,
            PermissionCodes.IndustriesView,
            PermissionCodes.MarketsView,
            PermissionCodes.PartnersView,
            PermissionCodes.StoriesView,
            PermissionCodes.EnquiriesView,
            PermissionCodes.MediaView,
            PermissionCodes.SeoView);

        await db.SaveChangesAsync();
    }

    private static async Task SeedSiteSettingsAsync(GenerioDbContext db)
    {
        var defaults = new Dictionary<string, (string Value, string Description)>
        {
            ["company.name"] = ("Generio Trading FZCO", "Legal / trading name"),
            ["company.tagline"] = ("Your Gateway to Emerging Markets", "Primary tagline"),
            ["company.email"] = ("info@generiogroup.com", "Public contact email"),
            ["company.phone"] = ("+971 50 110 6237", "Public phone"),
            ["company.whatsapp"] = ("+971 50 110 6237", "WhatsApp number"),
            ["company.address"] = ("Dubai, United Arab Emirates", "Head office"),
            ["site.primaryCtaLabel"] = ("Contact Us", "Header primary CTA label"),
            ["site.primaryCtaUrl"] = ("/contact", "Header primary CTA URL")
        };

        var existingKeys = await db.SiteSettings.Select(s => s.Key).ToListAsync();
        foreach (var (key, (value, description)) in defaults)
        {
            if (existingKeys.Contains(key))
            {
                continue;
            }

            db.SiteSettings.Add(new SiteSetting
            {
                Id = Guid.NewGuid(),
                Key = key,
                Value = value,
                Description = description,
                UpdatedAt = DateTime.UtcNow
            });
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedAdminAsync(
        GenerioDbContext db,
        IConfiguration config,
        Role superAdminRole,
        ILogger logger)
    {
        var adminEmail = (config["Seed:AdminEmail"] ?? "admin@generiogroup.com").Trim().ToLowerInvariant();
        var adminPassword = config["Seed:AdminPassword"] ?? "ChangeMe!Generio1";

        var admin = await db.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Email == adminEmail);
        if (admin is not null)
        {
            return;
        }

        admin = new User
        {
            Id = Guid.NewGuid(),
            Email = adminEmail,
            FullName = "Generio Super Admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        db.Users.Add(admin);
        db.UserRoles.Add(new UserRole { UserId = admin.Id, RoleId = superAdminRole.Id });
        logger.LogInformation("Seeded Super Admin user {Email}", adminEmail);
    }
}
