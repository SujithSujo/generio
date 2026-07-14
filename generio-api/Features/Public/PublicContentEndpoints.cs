using FluentValidation;
using Generio.Api.Configuration;
using Generio.Api.Domain.Entities;
using Generio.Api.Domain.Enums;
using Generio.Api.Infrastructure.Data;
using Generio.Api.Infrastructure.Notifications;
using Generio.Api.Infrastructure.Security;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Generio.Api.Features.Public;

public static class PublicContentEndpoints
{
    public static RouteGroupBuilder MapPublicContentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/public").WithTags("Public");

        group.MapGet("/site-settings", async (GenerioDbContext db) =>
        {
            var settings = await db.SiteSettings
                .OrderBy(s => s.Key)
                .Select(s => new { s.Key, s.Value })
                .ToListAsync();
            return Results.Ok(settings);
        });

        group.MapGet("/pages", async (GenerioDbContext db) =>
        {
            var pages = await db.Pages
                .Where(p => p.IsPublished)
                .OrderBy(p => p.Name)
                .Select(p => new { p.Id, p.Name, p.Slug, p.Title, p.PageType })
                .ToListAsync();
            return Results.Ok(pages);
        });

        group.MapGet("/pages/{slug}", async (string slug, GenerioDbContext db) =>
        {
            var page = await db.Pages
                .Include(p => p.Sections.Where(s => s.IsVisible).OrderBy(s => s.DisplayOrder))
                .FirstOrDefaultAsync(p => p.Slug == slug && p.IsPublished);

            if (page is null)
            {
                return Results.NotFound();
            }

            var seo = await db.SeoMetadata.FirstOrDefaultAsync(s =>
                s.EntityType == "Page" && s.EntityId == page.Id && s.LanguageCode == "en");

            string? ogImageUrl = null;
            if (seo?.OpenGraphImageId is Guid ogId)
            {
                ogImageUrl = await db.MediaFiles
                    .Where(m => m.Id == ogId && !m.IsDeleted)
                    .Select(m => m.PublicUrl)
                    .FirstOrDefaultAsync();
            }

            return Results.Ok(new
            {
                page.Id,
                page.Name,
                page.Slug,
                page.Title,
                page.PageType,
                sections = page.Sections.Select(s => new
                {
                    s.Id,
                    s.SectionType,
                    s.Title,
                    s.Subtitle,
                    s.Description,
                    s.ContentJson,
                    s.BackgroundImageId,
                    s.DisplayOrder
                }),
                seo = seo is null ? null : new
                {
                    seo.SeoTitle,
                    seo.MetaDescription,
                    seo.CanonicalUrl,
                    seo.OpenGraphTitle,
                    seo.OpenGraphDescription,
                    seo.OpenGraphImageId,
                    openGraphImageUrl = ogImageUrl,
                    seo.RobotsIndex,
                    seo.RobotsFollow,
                    seo.StructuredDataJson
                }
            });
        });

        group.MapGet("/services", async (GenerioDbContext db) =>
        {
            var items = await db.Services
                .Where(s => s.IsActive)
                .OrderBy(s => s.DisplayOrder)
                .Select(s => new
                {
                    s.Id,
                    s.Title,
                    s.Slug,
                    s.ShortDescription,
                    s.BulletPointsJson,
                    s.Icon,
                    s.FeaturedImageId,
                    s.IsFeatured,
                    s.DisplayOrder
                })
                .ToListAsync();
            return Results.Ok(items);
        });

        group.MapGet("/services/{slug}", async (string slug, GenerioDbContext db) =>
        {
            var item = await db.Services.FirstOrDefaultAsync(s => s.Slug == slug && s.IsActive);
            return item is null ? Results.NotFound() : Results.Ok(item);
        });

        group.MapGet("/industries", async (GenerioDbContext db) =>
        {
            var items = await db.Industries
                .Where(i => i.IsActive)
                .OrderBy(i => i.DisplayOrder)
                .ToListAsync();
            return Results.Ok(items);
        });

        group.MapGet("/markets", async (GenerioDbContext db) =>
        {
            var regions = await db.MarketRegions
                .Where(r => r.IsActive)
                .OrderBy(r => r.DisplayOrder)
                .Select(r => new
                {
                    r.Id,
                    r.Name,
                    r.Slug,
                    r.Description,
                    r.HighlightColor,
                    r.BoundaryJson,
                    r.CentroidLat,
                    r.CentroidLng,
                    r.DisplayOrder,
                    countries = r.Countries
                        .Where(c => c.IsActive)
                        .OrderBy(c => c.DisplayOrder)
                        .Select(c => new
                        {
                            c.Id,
                            c.Name,
                            c.IsoCode,
                            c.Latitude,
                            c.Longitude,
                            c.ShortDescription,
                            c.DisplayOrder
                        })
                        .ToList()
                })
                .ToListAsync();
            return Results.Ok(regions);
        });

        group.MapGet("/partners", async (GenerioDbContext db) =>
        {
            var items = await db.Partners
                .Where(p => p.IsActive)
                .OrderBy(p => p.DisplayOrder)
                .ToListAsync();
            return Results.Ok(items);
        });

        group.MapGet("/success-stories", async (GenerioDbContext db) =>
        {
            var items = await db.SuccessStories
                .Where(s => s.IsActive && s.IsPublished)
                .OrderBy(s => s.DisplayOrder)
                .ToListAsync();
            return Results.Ok(items);
        });

        group.MapGet("/seo/{entityType}/{entityId:guid}", async (string entityType, Guid entityId, GenerioDbContext db) =>
        {
            var seo = await db.SeoMetadata.FirstOrDefaultAsync(s =>
                s.EntityType == entityType && s.EntityId == entityId && s.LanguageCode == "en");
            return seo is null ? Results.NotFound() : Results.Ok(seo);
        });

        group.MapGet("/media/{id:guid}", async (Guid id, GenerioDbContext db) =>
        {
            var item = await db.MediaFiles.FirstOrDefaultAsync(m => m.Id == id && !m.IsDeleted);
            return item is null
                ? Results.NotFound()
                : Results.Ok(new
                {
                    item.Id,
                    item.OriginalFileName,
                    item.MimeType,
                    item.PublicUrl,
                    item.AltText,
                    item.Width,
                    item.Height
                });
        });

        group.MapGet("/redirects", async (GenerioDbContext db) =>
        {
            var items = await db.RedirectRules
                .Where(r => r.IsActive)
                .Select(r => new { r.FromPath, r.ToUrl, r.IsPermanent })
                .ToListAsync();
            return Results.Ok(items);
        });

        group.MapGet("/sitemap", async (GenerioDbContext db, IConfiguration config) =>
        {
            var siteBase = (config.GetSection("Site")["PublicBaseUrl"] ?? "http://localhost:3000").TrimEnd('/');

            var pageRows = await db.Pages
                .Where(p => p.IsPublished)
                .Select(p => new { p.Slug, p.UpdatedAt })
                .ToListAsync();
            var serviceRows = await db.Services
                .Where(s => s.IsActive)
                .Select(s => new { s.Slug, s.UpdatedAt })
                .ToListAsync();

            var urls = pageRows
                .Select(p =>
                {
                    var isHome = p.Slug.Equals("home", StringComparison.OrdinalIgnoreCase);
                    return new
                    {
                        loc = isHome ? $"{siteBase}/" : $"{siteBase}/{p.Slug}",
                        lastmod = p.UpdatedAt,
                        priority = isHome ? 1.0 : 0.7
                    };
                })
                .Concat(serviceRows.Select(s => new
                {
                    loc = $"{siteBase}/services/{s.Slug}",
                    lastmod = s.UpdatedAt,
                    priority = 0.6
                }))
                .OrderByDescending(u => u.priority)
                .ThenBy(u => u.loc)
                .ToList();

            return Results.Ok(new { urls });
        });

        group.MapGet("/contact-config", (IOptions<CaptchaOptions> captcha) =>
        {
            var opts = captcha.Value;
            return Results.Ok(new
            {
                captchaEnabled = opts.Enabled,
                captchaProvider = opts.Provider,
                captchaSiteKey = opts.SiteKey,
                enquiryTypes = Enum.GetNames<EnquiryType>()
            });
        });

        group.MapPost("/enquiries", async (
            CreateEnquiryRequest request,
            GenerioDbContext db,
            HttpContext http,
            IValidator<CreateEnquiryRequest> validator,
            ICaptchaVerifier captcha,
            IEnquiryNotifier notifier) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
            {
                return Results.ValidationProblem(validation.ToDictionary());
            }

            // Honeypot — bots fill hidden "website" field.
            var isHoneypot = !string.IsNullOrWhiteSpace(request.Website);
            var remoteIp = http.Connection.RemoteIpAddress?.ToString();

            if (!isHoneypot)
            {
                var captchaOk = await captcha.VerifyAsync(request.CaptchaToken, remoteIp);
                if (!captchaOk)
                {
                    return Results.BadRequest(new { message = "CAPTCHA verification failed." });
                }
            }

            if (request.ServiceId is not null &&
                !await db.Services.AnyAsync(s => s.Id == request.ServiceId && s.IsActive))
            {
                return Results.BadRequest(new { message = "Invalid service." });
            }

            if (!Enum.TryParse<EnquiryType>(request.EnquiryType, true, out var enquiryType))
            {
                return Results.BadRequest(new { message = "Invalid enquiry type." });
            }

            var enquiry = new ContactEnquiry
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                Company = request.Company?.Trim(),
                Email = request.Email.Trim().ToLowerInvariant(),
                Phone = request.Phone?.Trim(),
                EnquiryType = enquiryType,
                Subject = request.Subject.Trim(),
                Message = request.Message.Trim(),
                ServiceId = request.ServiceId,
                Status = isHoneypot ? EnquiryStatus.Spam : EnquiryStatus.New,
                SubmittedAt = DateTime.UtcNow,
                IpAddress = remoteIp
            };

            db.ContactEnquiries.Add(enquiry);
            await db.SaveChangesAsync();

            if (!isHoneypot)
            {
                try
                {
                    await notifier.NotifyNewEnquiryAsync(enquiry);
                }
                catch
                {
                    // Notifier logs failures; do not fail the HTTP response.
                }
            }

            return Results.Created($"/api/admin/enquiries/{enquiry.Id}", new
            {
                enquiry.Id,
                status = enquiry.Status.ToString(),
                enquiry.SubmittedAt
            });
        }).RequireRateLimiting("enquiries");

        return group;
    }
}

public record CreateEnquiryRequest(
    string Name,
    string Email,
    string? Phone,
    string? Company,
    string EnquiryType,
    string Subject,
    string Message,
    Guid? ServiceId,
    bool Consent,
    string? CaptchaToken,
    string? Website);

public class CreateEnquiryRequestValidator : AbstractValidator<CreateEnquiryRequest>
{
    public CreateEnquiryRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Phone).MaximumLength(50);
        RuleFor(x => x.Company).MaximumLength(200);
        RuleFor(x => x.EnquiryType).NotEmpty();
        RuleFor(x => x.Subject).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(5000);
        RuleFor(x => x.Consent).Equal(true).WithMessage("Consent is required.");
        RuleFor(x => x.Website).MaximumLength(200);
    }
}
