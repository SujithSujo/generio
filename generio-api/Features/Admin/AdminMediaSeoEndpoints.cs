using Generio.Api.Configuration;
using Generio.Api.Domain.Entities;
using Generio.Api.Infrastructure;
using Generio.Api.Infrastructure.Auth;
using Generio.Api.Infrastructure.Data;
using Generio.Api.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;

namespace Generio.Api.Features.Admin;

public static class AdminMediaSeoEndpoints
{
    public static RouteGroupBuilder MapAdminMediaSeoEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin").WithTags("AdminMediaSeo").RequireAuthorization();

        group.MapPost("/media/upload", UploadMedia).DisableAntiforgery();
        MapRedirects(group);
        return group;
    }

    private static async Task<IResult> UploadMedia(
        HttpRequest request,
        GenerioDbContext db,
        AuditService audit,
        IMediaStorage storage,
        HttpContext http)
    {
        if (!http.User.HasPermission(PermissionCodes.MediaEdit)) return Results.Forbid();
        if (!request.HasFormContentType) return Results.BadRequest(new { message = "Expected multipart form upload." });

        var form = await request.ReadFormAsync();
        var file = form.Files.GetFile("file");
        if (file is null || file.Length == 0) return Results.BadRequest(new { message = "File is required." });

        const long maxBytes = 15 * 1024 * 1024;
        if (file.Length > maxBytes) return Results.BadRequest(new { message = "File exceeds 15 MB limit." });

        var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
            "application/pdf", "video/mp4"
        };
        var mime = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType;
        if (!allowed.Contains(mime))
        {
            return Results.BadRequest(new { message = $"MIME type '{mime}' is not allowed." });
        }

        await using var stream = file.OpenReadStream();
        StoredMediaResult stored;
        try
        {
            stored = await storage.SaveAsync(stream, file.FileName, mime);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }

        var altText = form["altText"].ToString();
        var item = new MediaFile
        {
            Id = Guid.NewGuid(),
            FileName = stored.FileName,
            OriginalFileName = Path.GetFileName(file.FileName),
            MimeType = stored.MimeType,
            StorageProvider = storage.ProviderName,
            StoragePath = stored.StoragePath,
            PublicUrl = stored.PublicUrl,
            AltText = string.IsNullOrWhiteSpace(altText) ? null : altText.Trim(),
            Width = stored.Width,
            Height = stored.Height,
            FileSize = stored.FileSize,
            UploadedByUserId = http.User.GetUserId(),
            CreatedAt = DateTime.UtcNow
        };
        db.MediaFiles.Add(item);
        await db.SaveChangesAsync();
        await audit.WriteAsync("Upload", "MediaFile", item.Id.ToString(), item.OriginalFileName);
        return Results.Created($"/api/admin/media/{item.Id}", item);
    }

    private static void MapRedirects(RouteGroupBuilder group)
    {
        group.MapGet("/redirects", async (GenerioDbContext db, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.SeoView)) return Results.Forbid();
            return Results.Ok(await db.RedirectRules.OrderBy(r => r.FromPath).ToListAsync());
        });

        group.MapPost("/redirects", async (UpsertRedirectRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.SeoEdit)) return Results.Forbid();
            var from = NormalizePath(request.FromPath);
            if (await db.RedirectRules.AnyAsync(r => r.FromPath == from))
            {
                return Results.Conflict(new { message = "From path already exists." });
            }

            var item = new RedirectRule
            {
                Id = Guid.NewGuid(),
                FromPath = from,
                ToUrl = request.ToUrl.Trim(),
                IsPermanent = request.IsPermanent,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.RedirectRules.Add(item);
            await db.SaveChangesAsync();
            await audit.WriteAsync("Create", "RedirectRule", item.Id.ToString(), item.FromPath);
            return Results.Created($"/api/admin/redirects/{item.Id}", item);
        });

        group.MapPut("/redirects/{id:guid}", async (Guid id, UpsertRedirectRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.SeoEdit)) return Results.Forbid();
            var item = await db.RedirectRules.FirstOrDefaultAsync(r => r.Id == id);
            if (item is null) return Results.NotFound();

            var from = NormalizePath(request.FromPath);
            if (await db.RedirectRules.AnyAsync(r => r.FromPath == from && r.Id != id))
            {
                return Results.Conflict(new { message = "From path already exists." });
            }

            item.FromPath = from;
            item.ToUrl = request.ToUrl.Trim();
            item.IsPermanent = request.IsPermanent;
            item.IsActive = request.IsActive;
            item.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            await audit.WriteAsync("Update", "RedirectRule", item.Id.ToString(), item.FromPath);
            return Results.Ok(item);
        });

        group.MapDelete("/redirects/{id:guid}", async (Guid id, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.SeoEdit)) return Results.Forbid();
            var item = await db.RedirectRules.FirstOrDefaultAsync(r => r.Id == id);
            if (item is null) return Results.NotFound();
            db.RedirectRules.Remove(item);
            await db.SaveChangesAsync();
            await audit.WriteAsync("Delete", "RedirectRule", id.ToString());
            return Results.NoContent();
        });
    }

    private static string NormalizePath(string path)
    {
        var value = path.Trim();
        if (!value.StartsWith('/')) value = "/" + value;
        return value.TrimEnd('/').ToLowerInvariant() switch
        {
            "" => "/",
            var p => p
        };
    }
}

public record UpsertRedirectRequest(string FromPath, string ToUrl, bool IsPermanent, bool IsActive);

public static class MediaStorageRegistration
{
    public static IServiceCollection AddGenerioMediaStorage(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<StorageOptions>(configuration.GetSection(StorageOptions.SectionName));
        var provider = configuration.GetSection(StorageOptions.SectionName).GetValue<string>("Provider") ?? "Local";

        if (provider.Equals("Local", StringComparison.OrdinalIgnoreCase))
        {
            services.AddSingleton<IMediaStorage, LocalMediaStorage>();
        }
        else
        {
            services.AddSingleton<IMediaStorage>(_ => new UnconfiguredCloudMediaStorage(provider));
        }

        return services;
    }

    public static IApplicationBuilder UseGenerioMediaFiles(this IApplicationBuilder app)
    {
        var env = app.ApplicationServices.GetRequiredService<IWebHostEnvironment>();
        var options = app.ApplicationServices.GetRequiredService<IOptions<StorageOptions>>().Value;
        if (!options.Provider.Equals("Local", StringComparison.OrdinalIgnoreCase))
        {
            return app;
        }

        var root = Path.IsPathRooted(options.LocalRootPath)
            ? options.LocalRootPath
            : Path.Combine(env.ContentRootPath, options.LocalRootPath.Replace('/', Path.DirectorySeparatorChar));
        Directory.CreateDirectory(root);

        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(root),
            RequestPath = "/media"
        });

        return app;
    }
}
