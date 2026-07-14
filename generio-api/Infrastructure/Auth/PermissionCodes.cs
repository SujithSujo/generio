using System.Security.Claims;

namespace Generio.Api.Infrastructure.Auth;

public static class PermissionCodes
{
    public const string DashboardView = "Dashboard.View";
    public const string SettingsView = "Settings.View";
    public const string SettingsEdit = "Settings.Edit";
    public const string UsersView = "Users.View";
    public const string UsersCreate = "Users.Create";
    public const string UsersEdit = "Users.Edit";
    public const string RolesView = "Roles.View";
    public const string RolesEdit = "Roles.Edit";
    public const string AuditView = "Audit.View";

    public const string PagesView = "Pages.View";
    public const string PagesEdit = "Pages.Edit";
    public const string ServicesView = "Services.View";
    public const string ServicesEdit = "Services.Edit";
    public const string IndustriesView = "Industries.View";
    public const string IndustriesEdit = "Industries.Edit";
    public const string MarketsView = "Markets.View";
    public const string MarketsEdit = "Markets.Edit";
    public const string PartnersView = "Partners.View";
    public const string PartnersEdit = "Partners.Edit";
    public const string StoriesView = "Stories.View";
    public const string StoriesEdit = "Stories.Edit";
    public const string EnquiriesView = "Enquiries.View";
    public const string EnquiriesEdit = "Enquiries.Edit";
    public const string MediaView = "Media.View";
    public const string MediaEdit = "Media.Edit";
    public const string SeoView = "Seo.View";
    public const string SeoEdit = "Seo.Edit";

    public static readonly IReadOnlyList<(string Code, string Name, string Group)> All =
    [
        (DashboardView, "View dashboard", "Dashboard"),
        (SettingsView, "View site settings", "Settings"),
        (SettingsEdit, "Edit site settings", "Settings"),
        (UsersView, "View users", "Users"),
        (UsersCreate, "Create users", "Users"),
        (UsersEdit, "Edit users", "Users"),
        (RolesView, "View roles", "Roles"),
        (RolesEdit, "Edit role permissions", "Roles"),
        (AuditView, "View audit logs", "Audit"),
        (PagesView, "View pages", "Pages"),
        (PagesEdit, "Edit pages", "Pages"),
        (ServicesView, "View services", "Services"),
        (ServicesEdit, "Edit services", "Services"),
        (IndustriesView, "View industries", "Industries"),
        (IndustriesEdit, "Edit industries", "Industries"),
        (MarketsView, "View markets", "Markets"),
        (MarketsEdit, "Edit markets", "Markets"),
        (PartnersView, "View partners", "Partners"),
        (PartnersEdit, "Edit partners", "Partners"),
        (StoriesView, "View success stories", "Stories"),
        (StoriesEdit, "Edit success stories", "Stories"),
        (EnquiriesView, "View enquiries", "Enquiries"),
        (EnquiriesEdit, "Manage enquiries", "Enquiries"),
        (MediaView, "View media", "Media"),
        (MediaEdit, "Manage media metadata", "Media"),
        (SeoView, "View SEO metadata", "SEO"),
        (SeoEdit, "Edit SEO metadata", "SEO")
    ];
}

public static class ClaimsPrincipalExtensions
{
    public static Guid? GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
        return Guid.TryParse(value, out var id) ? id : null;
    }

    public static string? GetEmail(this ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.Email) ?? user.FindFirstValue("email");

    public static bool HasPermission(this ClaimsPrincipal user, string permission) =>
        user.IsInRole("SuperAdministrator") ||
        user.HasClaim("permission", permission);
}
