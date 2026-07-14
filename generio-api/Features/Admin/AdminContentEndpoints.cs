using Generio.Api.Domain.Entities;
using Generio.Api.Domain.Enums;
using Generio.Api.Infrastructure;
using Generio.Api.Infrastructure.Auth;
using Generio.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Generio.Api.Features.Admin;

public static class AdminContentEndpoints
{
    public static RouteGroupBuilder MapAdminContentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin").WithTags("AdminContent").RequireAuthorization();

        MapPages(group);
        MapServices(group);
        MapIndustries(group);
        MapMarkets(group);
        MapPartners(group);
        MapStories(group);
        MapEnquiries(group);
        MapMedia(group);
        MapSeo(group);

        return group;
    }

    private static void MapPages(RouteGroupBuilder group)
    {
        group.MapGet("/pages", async (GenerioDbContext db, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.PagesView)) return Results.Forbid();
            var items = await db.Pages.OrderBy(p => p.Name)
                .Select(p => new { p.Id, p.Name, p.Slug, p.Title, p.PageType, p.Status, p.IsPublished, p.UpdatedAt, sectionCount = p.Sections.Count })
                .ToListAsync();
            return Results.Ok(items);
        });

        group.MapGet("/pages/{id:guid}", async (Guid id, GenerioDbContext db, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.PagesView)) return Results.Forbid();
            var page = await db.Pages.Include(p => p.Sections.OrderBy(s => s.DisplayOrder))
                .FirstOrDefaultAsync(p => p.Id == id);
            return page is null ? Results.NotFound() : Results.Ok(page);
        });

        group.MapPost("/pages", async (UpsertPageRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.PagesEdit)) return Results.Forbid();
            var slug = string.IsNullOrWhiteSpace(request.Slug) ? SlugHelper.ToSlug(request.Name) : SlugHelper.ToSlug(request.Slug);
            if (await db.Pages.AnyAsync(p => p.Slug == slug)) return Results.Conflict(new { message = "Slug already exists." });

            var page = new Page
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                Slug = slug,
                Title = request.Title.Trim(),
                PageType = request.PageType,
                Status = request.IsPublished ? "Published" : "Draft",
                IsPublished = request.IsPublished,
                PublishedAt = request.IsPublished ? DateTime.UtcNow : null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.Pages.Add(page);
            await db.SaveChangesAsync();
            await audit.WriteAsync("Create", "Page", page.Id.ToString(), page.Slug);
            return Results.Created($"/api/admin/pages/{page.Id}", page);
        });

        group.MapPut("/pages/{id:guid}", async (Guid id, UpsertPageRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.PagesEdit)) return Results.Forbid();
            var page = await db.Pages.FirstOrDefaultAsync(p => p.Id == id);
            if (page is null) return Results.NotFound();

            var slug = string.IsNullOrWhiteSpace(request.Slug) ? SlugHelper.ToSlug(request.Name) : SlugHelper.ToSlug(request.Slug);
            if (await db.Pages.AnyAsync(p => p.Slug == slug && p.Id != id)) return Results.Conflict(new { message = "Slug already exists." });

            page.Name = request.Name.Trim();
            page.Slug = slug;
            page.Title = request.Title.Trim();
            page.PageType = request.PageType;
            page.IsPublished = request.IsPublished;
            page.Status = request.IsPublished ? "Published" : "Draft";
            page.PublishedAt = request.IsPublished ? page.PublishedAt ?? DateTime.UtcNow : null;
            page.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            await audit.WriteAsync("Update", "Page", page.Id.ToString(), page.Slug);
            return Results.Ok(page);
        });

        group.MapPut("/pages/{pageId:guid}/sections", async (Guid pageId, UpsertSectionsRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.PagesEdit)) return Results.Forbid();
            var page = await db.Pages.Include(p => p.Sections).FirstOrDefaultAsync(p => p.Id == pageId);
            if (page is null) return Results.NotFound();

            db.PageSections.RemoveRange(page.Sections);
            var order = 1;
            foreach (var section in request.Sections ?? [])
            {
                db.PageSections.Add(new PageSection
                {
                    Id = section.Id ?? Guid.NewGuid(),
                    PageId = pageId,
                    SectionType = section.SectionType,
                    Title = section.Title,
                    Subtitle = section.Subtitle,
                    Description = section.Description,
                    ContentJson = section.ContentJson,
                    BackgroundImageId = section.BackgroundImageId,
                    DisplayOrder = section.DisplayOrder > 0 ? section.DisplayOrder : order,
                    IsVisible = section.IsVisible,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
                order++;
            }

            page.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            await audit.WriteAsync("Update", "PageSections", pageId.ToString());
            var refreshed = await db.Pages.Include(p => p.Sections.OrderBy(s => s.DisplayOrder)).FirstAsync(p => p.Id == pageId);
            return Results.Ok(refreshed);
        });
    }

    private static void MapServices(RouteGroupBuilder group)
    {
        group.MapGet("/services", async (GenerioDbContext db, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.ServicesView)) return Results.Forbid();
            return Results.Ok(await db.Services.OrderBy(s => s.DisplayOrder).ToListAsync());
        });

        group.MapPost("/services", async (UpsertServiceRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.ServicesEdit)) return Results.Forbid();
            var slug = string.IsNullOrWhiteSpace(request.Slug) ? FluentSlug(request.Title) : FluentSlug(request.Slug);
            if (await db.Services.AnyAsync(s => s.Slug == slug)) return Results.Conflict(new { message = "Slug already exists." });

            var item = new Service
            {
                Id = Guid.NewGuid(),
                Title = request.Title.Trim(),
                Slug = slug,
                ShortDescription = request.ShortDescription?.Trim() ?? string.Empty,
                FullDescription = request.FullDescription?.Trim() ?? string.Empty,
                BulletPointsJson = request.BulletPointsJson,
                Icon = request.Icon,
                FeaturedImageId = request.FeaturedImageId,
                DisplayOrder = request.DisplayOrder,
                IsFeatured = request.IsFeatured,
                IsActive = request.IsActive,
                SeoTitle = request.SeoTitle,
                SeoDescription = request.SeoDescription,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.Services.Add(item);
            await db.SaveChangesAsync();
            await audit.WriteAsync("Create", "Service", item.Id.ToString(), item.Slug);
            return Results.Created($"/api/admin/services/{item.Id}", item);
        });

        group.MapPut("/services/{id:guid}", async (Guid id, UpsertServiceRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.ServicesEdit)) return Results.Forbid();
            var item = await db.Services.FirstOrDefaultAsync(s => s.Id == id);
            if (item is null) return Results.NotFound();
            var slug = string.IsNullOrWhiteSpace(request.Slug) ? FluentSlug(request.Title) : FluentSlug(request.Slug);
            if (await db.Services.AnyAsync(s => s.Slug == slug && s.Id != id)) return Results.Conflict(new { message = "Slug already exists." });

            item.Title = request.Title.Trim();
            item.Slug = slug;
            item.ShortDescription = request.ShortDescription?.Trim() ?? string.Empty;
            item.FullDescription = request.FullDescription?.Trim() ?? string.Empty;
            item.BulletPointsJson = request.BulletPointsJson;
            item.Icon = request.Icon;
            item.FeaturedImageId = request.FeaturedImageId;
            item.DisplayOrder = request.DisplayOrder;
            item.IsFeatured = request.IsFeatured;
            item.IsActive = request.IsActive;
            item.SeoTitle = request.SeoTitle;
            item.SeoDescription = request.SeoDescription;
            item.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            await audit.WriteAsync("Update", "Service", item.Id.ToString(), item.Slug);
            return Results.Ok(item);
        });

        group.MapDelete("/services/{id:guid}", async (Guid id, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.ServicesEdit)) return Results.Forbid();
            var item = await db.Services.FirstOrDefaultAsync(s => s.Id == id);
            if (item is null) return Results.NotFound();
            item.IsActive = false;
            item.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            await audit.WriteAsync("Deactivate", "Service", id.ToString());
            return Results.NoContent();
        });
    }

    private static void MapIndustries(RouteGroupBuilder group)
    {
        group.MapGet("/industries", async (GenerioDbContext db, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.IndustriesView)) return Results.Forbid();
            return Results.Ok(await db.Industries.OrderBy(i => i.DisplayOrder).ToListAsync());
        });

        group.MapPost("/industries", async (UpsertIndustryRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.IndustriesEdit)) return Results.Forbid();
            var slug = string.IsNullOrWhiteSpace(request.Slug) ? FluentSlug(request.Name) : FluentSlug(request.Slug);
            if (await db.Industries.AnyAsync(i => i.Slug == slug)) return Results.Conflict(new { message = "Slug already exists." });

            var item = new Industry
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                Slug = slug,
                ShortDescription = request.ShortDescription,
                Icon = request.Icon,
                ImageId = request.ImageId,
                DisplayOrder = request.DisplayOrder,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.Industries.Add(item);
            await db.SaveChangesAsync();
            await audit.WriteAsync("Create", "Industry", item.Id.ToString(), item.Slug);
            return Results.Created($"/api/admin/industries/{item.Id}", item);
        });

        group.MapPut("/industries/{id:guid}", async (Guid id, UpsertIndustryRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.IndustriesEdit)) return Results.Forbid();
            var item = await db.Industries.FirstOrDefaultAsync(i => i.Id == id);
            if (item is null) return Results.NotFound();
            var slug = string.IsNullOrWhiteSpace(request.Slug) ? FluentSlug(request.Name) : FluentSlug(request.Slug);
            if (await db.Industries.AnyAsync(i => i.Slug == slug && i.Id != id)) return Results.Conflict(new { message = "Slug already exists." });

            item.Name = request.Name.Trim();
            item.Slug = slug;
            item.ShortDescription = request.ShortDescription;
            item.Icon = request.Icon;
            item.ImageId = request.ImageId;
            item.DisplayOrder = request.DisplayOrder;
            item.IsActive = request.IsActive;
            item.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            await audit.WriteAsync("Update", "Industry", item.Id.ToString(), item.Slug);
            return Results.Ok(item);
        });
    }

    private static void MapMarkets(RouteGroupBuilder group)
    {
        group.MapGet("/markets", async (GenerioDbContext db, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.MarketsView)) return Results.Forbid();
            var regions = await db.MarketRegions
                .Include(r => r.Countries.OrderBy(c => c.DisplayOrder))
                .OrderBy(r => r.DisplayOrder)
                .ToListAsync();
            return Results.Ok(regions);
        });

        group.MapPost("/markets/regions", async (UpsertMarketRegionRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.MarketsEdit)) return Results.Forbid();
            var slug = string.IsNullOrWhiteSpace(request.Slug) ? FluentSlug(request.Name) : FluentSlug(request.Slug);
            if (await db.MarketRegions.AnyAsync(r => r.Slug == slug)) return Results.Conflict(new { message = "Slug already exists." });

            var region = new MarketRegion
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                Slug = slug,
                Description = request.Description,
                HighlightColor = request.HighlightColor,
                BoundaryJson = request.BoundaryJson,
                CentroidLat = request.CentroidLat,
                CentroidLng = request.CentroidLng,
                DisplayOrder = request.DisplayOrder,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.MarketRegions.Add(region);
            await db.SaveChangesAsync();
            await audit.WriteAsync("Create", "MarketRegion", region.Id.ToString(), region.Slug);
            return Results.Created($"/api/admin/markets/regions/{region.Id}", region);
        });

        group.MapPut("/markets/regions/{id:guid}", async (Guid id, UpsertMarketRegionRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.MarketsEdit)) return Results.Forbid();
            var region = await db.MarketRegions.FirstOrDefaultAsync(r => r.Id == id);
            if (region is null) return Results.NotFound();
            var slug = string.IsNullOrWhiteSpace(request.Slug) ? FluentSlug(request.Name) : FluentSlug(request.Slug);
            if (await db.MarketRegions.AnyAsync(r => r.Slug == slug && r.Id != id)) return Results.Conflict(new { message = "Slug already exists." });

            region.Name = request.Name.Trim();
            region.Slug = slug;
            region.Description = request.Description;
            region.HighlightColor = request.HighlightColor;
            region.BoundaryJson = request.BoundaryJson;
            region.CentroidLat = request.CentroidLat;
            region.CentroidLng = request.CentroidLng;
            region.DisplayOrder = request.DisplayOrder;
            region.IsActive = request.IsActive;
            region.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            await audit.WriteAsync("Update", "MarketRegion", region.Id.ToString(), region.Slug);
            return Results.Ok(region);
        });

        group.MapPut("/markets/regions/{regionId:guid}/countries", async (Guid regionId, UpsertCountriesRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.MarketsEdit)) return Results.Forbid();
            var region = await db.MarketRegions.Include(r => r.Countries).FirstOrDefaultAsync(r => r.Id == regionId);
            if (region is null) return Results.NotFound();

            db.MarketCountries.RemoveRange(region.Countries);
            var order = 1;
            foreach (var country in request.Countries ?? [])
            {
                db.MarketCountries.Add(new MarketCountry
                {
                    Id = country.Id ?? Guid.NewGuid(),
                    MarketRegionId = regionId,
                    Name = country.Name.Trim(),
                    IsoCode = country.IsoCode,
                    Latitude = country.Latitude,
                    Longitude = country.Longitude,
                    ShortDescription = country.ShortDescription,
                    DisplayOrder = country.DisplayOrder > 0 ? country.DisplayOrder : order++,
                    IsActive = country.IsActive
                });
            }

            region.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            await audit.WriteAsync("Update", "MarketCountries", regionId.ToString());
            return Results.Ok(await db.MarketRegions.Include(r => r.Countries.OrderBy(c => c.DisplayOrder)).FirstAsync(r => r.Id == regionId));
        });
    }

    private static void MapPartners(RouteGroupBuilder group)
    {
        group.MapGet("/partners", async (GenerioDbContext db, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.PartnersView)) return Results.Forbid();
            return Results.Ok(await db.Partners.OrderBy(p => p.DisplayOrder).ToListAsync());
        });

        group.MapPost("/partners", async (UpsertPartnerRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.PartnersEdit)) return Results.Forbid();
            var slug = string.IsNullOrWhiteSpace(request.Slug) ? FluentSlug(request.Name) : FluentSlug(request.Slug);
            var item = new Partner
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                Slug = slug,
                Category = request.Category,
                ShortDescription = request.ShortDescription,
                WebsiteUrl = request.WebsiteUrl,
                LogoMediaId = request.LogoMediaId,
                DisplayOrder = request.DisplayOrder,
                IsFeatured = request.IsFeatured,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.Partners.Add(item);
            await db.SaveChangesAsync();
            await audit.WriteAsync("Create", "Partner", item.Id.ToString(), item.Slug);
            return Results.Created($"/api/admin/partners/{item.Id}", item);
        });

        group.MapPut("/partners/{id:guid}", async (Guid id, UpsertPartnerRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.PartnersEdit)) return Results.Forbid();
            var item = await db.Partners.FirstOrDefaultAsync(p => p.Id == id);
            if (item is null) return Results.NotFound();
            item.Name = request.Name.Trim();
            item.Slug = string.IsNullOrWhiteSpace(request.Slug) ? FluentSlug(request.Name) : FluentSlug(request.Slug);
            item.Category = request.Category;
            item.ShortDescription = request.ShortDescription;
            item.WebsiteUrl = request.WebsiteUrl;
            item.LogoMediaId = request.LogoMediaId;
            item.DisplayOrder = request.DisplayOrder;
            item.IsFeatured = request.IsFeatured;
            item.IsActive = request.IsActive;
            item.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            await audit.WriteAsync("Update", "Partner", item.Id.ToString(), item.Slug);
            return Results.Ok(item);
        });
    }

    private static void MapStories(RouteGroupBuilder group)
    {
        group.MapGet("/success-stories", async (GenerioDbContext db, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.StoriesView)) return Results.Forbid();
            return Results.Ok(await db.SuccessStories.OrderBy(s => s.DisplayOrder).ToListAsync());
        });

        group.MapPost("/success-stories", async (UpsertStoryRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.StoriesEdit)) return Results.Forbid();
            var item = new SuccessStory
            {
                Id = Guid.NewGuid(),
                PersonName = request.PersonName,
                Designation = request.Designation,
                CompanyName = request.CompanyName,
                StoryText = request.StoryText.Trim(),
                PersonImageId = request.PersonImageId,
                CompanyLogoId = request.CompanyLogoId,
                Rating = request.Rating,
                DisplayOrder = request.DisplayOrder,
                IsActive = request.IsActive,
                IsPublished = request.IsPublished,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.SuccessStories.Add(item);
            await db.SaveChangesAsync();
            await audit.WriteAsync("Create", "SuccessStory", item.Id.ToString());
            return Results.Created($"/api/admin/success-stories/{item.Id}", item);
        });

        group.MapPut("/success-stories/{id:guid}", async (Guid id, UpsertStoryRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.StoriesEdit)) return Results.Forbid();
            var item = await db.SuccessStories.FirstOrDefaultAsync(s => s.Id == id);
            if (item is null) return Results.NotFound();
            item.PersonName = request.PersonName;
            item.Designation = request.Designation;
            item.CompanyName = request.CompanyName;
            item.StoryText = request.StoryText.Trim();
            item.PersonImageId = request.PersonImageId;
            item.CompanyLogoId = request.CompanyLogoId;
            item.Rating = request.Rating;
            item.DisplayOrder = request.DisplayOrder;
            item.IsActive = request.IsActive;
            item.IsPublished = request.IsPublished;
            item.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            await audit.WriteAsync("Update", "SuccessStory", item.Id.ToString());
            return Results.Ok(item);
        });
    }

    private static void MapEnquiries(RouteGroupBuilder group)
    {
        group.MapGet("/enquiries", async (GenerioDbContext db, HttpContext http, string? status = null, string? enquiryType = null) =>
        {
            if (!http.User.HasPermission(PermissionCodes.EnquiriesView)) return Results.Forbid();

            var query = db.ContactEnquiries.AsQueryable();
            if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<EnquiryStatus>(status, true, out var statusEnum))
            {
                query = query.Where(e => e.Status == statusEnum);
            }
            if (!string.IsNullOrWhiteSpace(enquiryType) && Enum.TryParse<EnquiryType>(enquiryType, true, out var typeEnum))
            {
                query = query.Where(e => e.EnquiryType == typeEnum);
            }

            var items = await query.OrderByDescending(e => e.SubmittedAt)
                .Select(e => new
                {
                    e.Id,
                    e.Name,
                    e.Company,
                    e.Email,
                    e.Phone,
                    enquiryType = e.EnquiryType.ToString(),
                    e.Subject,
                    e.Message,
                    e.ServiceId,
                    status = e.Status.ToString(),
                    e.InternalRemarks,
                    e.AssignedToUserId,
                    e.SubmittedAt,
                    e.IpAddress
                })
                .ToListAsync();
            return Results.Ok(items);
        });

        group.MapPut("/enquiries/{id:guid}", async (Guid id, UpdateEnquiryRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.EnquiriesEdit)) return Results.Forbid();
            var item = await db.ContactEnquiries.FirstOrDefaultAsync(e => e.Id == id);
            if (item is null) return Results.NotFound();

            if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<EnquiryStatus>(request.Status, true, out var status))
            {
                item.Status = status;
            }
            if (request.InternalRemarks is not null) item.InternalRemarks = request.InternalRemarks;
            item.AssignedToUserId = request.AssignedToUserId;

            await db.SaveChangesAsync();
            await audit.WriteAsync("Update", "ContactEnquiry", item.Id.ToString(), item.Status.ToString());
            return Results.Ok(new
            {
                item.Id,
                item.Name,
                item.Company,
                item.Email,
                item.Phone,
                enquiryType = item.EnquiryType.ToString(),
                item.Subject,
                item.Message,
                item.ServiceId,
                status = item.Status.ToString(),
                item.InternalRemarks,
                item.AssignedToUserId,
                item.SubmittedAt,
                item.IpAddress
            });
        });

        group.MapGet("/enquiries/export", async (GenerioDbContext db, HttpContext http, string? status = null, string? enquiryType = null) =>
        {
            if (!http.User.HasPermission(PermissionCodes.EnquiriesEdit)) return Results.Forbid();

            var query = db.ContactEnquiries.AsQueryable();
            if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<EnquiryStatus>(status, true, out var statusEnum))
            {
                query = query.Where(e => e.Status == statusEnum);
            }
            if (!string.IsNullOrWhiteSpace(enquiryType) && Enum.TryParse<EnquiryType>(enquiryType, true, out var typeEnum))
            {
                query = query.Where(e => e.EnquiryType == typeEnum);
            }

            var items = await query.OrderByDescending(e => e.SubmittedAt).ToListAsync();
            var sb = new System.Text.StringBuilder();
            sb.AppendLine("Id,SubmittedAt,Name,Email,Phone,Company,EnquiryType,Subject,Status,IpAddress");
            foreach (var e in items)
            {
                static string Csv(string? value) =>
                    "\"" + (value ?? string.Empty).Replace("\"", "\"\"") + "\"";

                sb.AppendLine(string.Join(',',
                    Csv(e.Id.ToString()),
                    Csv(e.SubmittedAt.ToString("u")),
                    Csv(e.Name),
                    Csv(e.Email),
                    Csv(e.Phone),
                    Csv(e.Company),
                    Csv(e.EnquiryType.ToString()),
                    Csv(e.Subject),
                    Csv(e.Status.ToString()),
                    Csv(e.IpAddress)));
            }

            var bytes = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
            return Results.File(bytes, "text/csv", $"generio-enquiries-{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
        });
    }

    private static void MapMedia(RouteGroupBuilder group)
    {
        group.MapGet("/media", async (GenerioDbContext db, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.MediaView)) return Results.Forbid();
            var items = await db.MediaFiles.Where(m => !m.IsDeleted).OrderByDescending(m => m.CreatedAt).ToListAsync();
            return Results.Ok(items);
        });

        group.MapPost("/media", async (UpsertMediaRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.MediaEdit)) return Results.Forbid();
            var item = new MediaFile
            {
                Id = Guid.NewGuid(),
                FileName = request.FileName.Trim(),
                OriginalFileName = request.OriginalFileName.Trim(),
                MimeType = request.MimeType.Trim(),
                StorageProvider = request.StorageProvider ?? "Local",
                StoragePath = request.StoragePath.Trim(),
                PublicUrl = request.PublicUrl,
                AltText = request.AltText,
                Width = request.Width,
                Height = request.Height,
                FileSize = request.FileSize,
                UploadedByUserId = http.User.GetUserId(),
                CreatedAt = DateTime.UtcNow
            };
            db.MediaFiles.Add(item);
            await db.SaveChangesAsync();
            await audit.WriteAsync("Create", "MediaFile", item.Id.ToString(), item.FileName);
            return Results.Created($"/api/admin/media/{item.Id}", item);
        });

        group.MapPut("/media/{id:guid}", async (Guid id, UpsertMediaRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.MediaEdit)) return Results.Forbid();
            var item = await db.MediaFiles.FirstOrDefaultAsync(m => m.Id == id && !m.IsDeleted);
            if (item is null) return Results.NotFound();
            item.AltText = request.AltText;
            item.PublicUrl = request.PublicUrl;
            item.OriginalFileName = request.OriginalFileName.Trim();
            await db.SaveChangesAsync();
            await audit.WriteAsync("Update", "MediaFile", item.Id.ToString());
            return Results.Ok(item);
        });

        group.MapDelete("/media/{id:guid}", async (Guid id, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.MediaEdit)) return Results.Forbid();
            var item = await db.MediaFiles.FirstOrDefaultAsync(m => m.Id == id);
            if (item is null) return Results.NotFound();
            item.IsDeleted = true;
            await db.SaveChangesAsync();
            await audit.WriteAsync("SoftDelete", "MediaFile", id.ToString());
            return Results.NoContent();
        });
    }

    private static void MapSeo(RouteGroupBuilder group)
    {
        group.MapGet("/seo", async (GenerioDbContext db, HttpContext http, string? entityType = null) =>
        {
            if (!http.User.HasPermission(PermissionCodes.SeoView)) return Results.Forbid();
            var query = db.SeoMetadata.AsQueryable();
            if (!string.IsNullOrWhiteSpace(entityType))
            {
                query = query.Where(s => s.EntityType == entityType);
            }
            return Results.Ok(await query.OrderBy(s => s.EntityType).ThenBy(s => s.LanguageCode).ToListAsync());
        });

        group.MapPut("/seo", async (UpsertSeoRequest request, GenerioDbContext db, AuditService audit, HttpContext http) =>
        {
            if (!http.User.HasPermission(PermissionCodes.SeoEdit)) return Results.Forbid();
            var item = await db.SeoMetadata.FirstOrDefaultAsync(s =>
                s.EntityType == request.EntityType &&
                s.EntityId == request.EntityId &&
                s.LanguageCode == (request.LanguageCode ?? "en"));

            if (item is null)
            {
                item = new SeoMetadata
                {
                    Id = Guid.NewGuid(),
                    EntityType = request.EntityType,
                    EntityId = request.EntityId,
                    LanguageCode = request.LanguageCode ?? "en"
                };
                db.SeoMetadata.Add(item);
            }

            item.SeoTitle = request.SeoTitle;
            item.MetaDescription = request.MetaDescription;
            item.CanonicalUrl = request.CanonicalUrl;
            item.OpenGraphTitle = request.OpenGraphTitle;
            item.OpenGraphDescription = request.OpenGraphDescription;
            item.OpenGraphImageId = request.OpenGraphImageId;
            item.RobotsIndex = request.RobotsIndex;
            item.RobotsFollow = request.RobotsFollow;
            item.StructuredDataJson = request.StructuredDataJson;
            item.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            await audit.WriteAsync("Upsert", "SeoMetadata", item.Id.ToString(), $"{item.EntityType}:{item.EntityId}");
            return Results.Ok(item);
        });
    }

    private static string FluentSlug(string value) => SlugHelper.ToSlug(value);
}

public record UpsertPageRequest(string Name, string? Slug, string Title, string? PageType, bool IsPublished);
public record SectionDto(Guid? Id, string SectionType, string? Title, string? Subtitle, string? Description, string? ContentJson, Guid? BackgroundImageId, int DisplayOrder, bool IsVisible);
public record UpsertSectionsRequest(List<SectionDto> Sections);
public record UpsertServiceRequest(string Title, string? Slug, string? ShortDescription, string? FullDescription, string? BulletPointsJson, string? Icon, Guid? FeaturedImageId, int DisplayOrder, bool IsFeatured, bool IsActive, string? SeoTitle, string? SeoDescription);
public record UpsertIndustryRequest(string Name, string? Slug, string? ShortDescription, string? Icon, Guid? ImageId, int DisplayOrder, bool IsActive);
public record UpsertMarketRegionRequest(string Name, string? Slug, string? Description, string? HighlightColor, string? BoundaryJson, double? CentroidLat, double? CentroidLng, int DisplayOrder, bool IsActive);
public record CountryDto(Guid? Id, string Name, string? IsoCode, double? Latitude, double? Longitude, string? ShortDescription, int DisplayOrder, bool IsActive);
public record UpsertCountriesRequest(List<CountryDto> Countries);
public record UpsertPartnerRequest(string Name, string? Slug, string? Category, string? ShortDescription, string? WebsiteUrl, Guid? LogoMediaId, int DisplayOrder, bool IsFeatured, bool IsActive);
public record UpsertStoryRequest(string? PersonName, string? Designation, string? CompanyName, string StoryText, Guid? PersonImageId, Guid? CompanyLogoId, int? Rating, int DisplayOrder, bool IsActive, bool IsPublished);
public record UpdateEnquiryRequest(string? Status, string? InternalRemarks, Guid? AssignedToUserId);
public record UpsertMediaRequest(string FileName, string OriginalFileName, string MimeType, string? StorageProvider, string StoragePath, string? PublicUrl, string? AltText, int? Width, int? Height, long FileSize);
public record UpsertSeoRequest(string EntityType, Guid EntityId, string? LanguageCode, string? SeoTitle, string? MetaDescription, string? CanonicalUrl, string? OpenGraphTitle, string? OpenGraphDescription, Guid? OpenGraphImageId, bool RobotsIndex, bool RobotsFollow, string? StructuredDataJson);
