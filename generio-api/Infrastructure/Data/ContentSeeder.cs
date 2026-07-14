using System.Text.Json;
using Generio.Api.Domain.Entities;
using Generio.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Generio.Api.Infrastructure.Data;

public static class ContentSeeder
{
    public static async Task SeedAsync(GenerioDbContext db, ILogger logger)
    {
        await SeedServicesAsync(db);
        await SeedIndustriesAsync(db);
        await SeedMarketsAsync(db);
        await EnrichCountryCoordinatesAsync(db);
        await SeedPagesAsync(db);
        await db.SaveChangesAsync();
        await SeedSeoAsync(db);
        await db.SaveChangesAsync();
        logger.LogInformation("Content seed completed (Generio inventory only).");
    }

    private static async Task SeedServicesAsync(GenerioDbContext db)
    {
        if (await db.Services.AnyAsync())
        {
            return;
        }

        var services = new (string Title, string[] Bullets)[]
        {
            ("Brand Expansion & Market Entry", [
                "International market development",
                "Go-to-market strategy",
                "New market identification",
                "Channel development",
                "Regional expansion planning"
            ]),
            ("Distributor Network Development", [
                "Distributor sourcing and evaluation",
                "Distributor appointment and negotiations",
                "Due diligence and partner assessment",
                "Performance monitoring",
                "Distribution network optimization"
            ]),
            ("Business Development Services", [
                "Brand representation",
                "Strategic partnerships",
                "Sales channel development",
                "Market intelligence and research",
                "Competitive analysis"
            ]),
            ("Trade & Supply Chain Support", [
                "Import and export coordination",
                "Regulatory guidance",
                "Commercial negotiations",
                "Contract management",
                "Trade facilitation"
            ]),
            ("Brand Management", [
                "Market launch planning",
                "Product positioning",
                "Trade marketing support",
                "Sales growth strategies",
                "Regional business development"
            ])
        };

        var order = 1;
        foreach (var (title, bullets) in services)
        {
            db.Services.Add(new Service
            {
                Id = Guid.NewGuid(),
                Title = title,
                Slug = FluentSlug(title),
                ShortDescription = $"{title} for manufacturers and brand owners expanding into emerging markets.",
                FullDescription =
                    $"{title}: Generio helps manufacturers and brand owners establish and grow distribution networks across the Middle East, Africa, South Asia, and other emerging markets.",
                BulletPointsJson = JsonSerializer.Serialize(bullets),
                DisplayOrder = order++,
                IsFeatured = true,
                IsActive = true,
                SeoTitle = $"{title} | Generio",
                SeoDescription = $"Learn how Generio delivers {title.ToLowerInvariant()} across emerging markets."
            });
        }
    }

    private static async Task SeedIndustriesAsync(GenerioDbContext db)
    {
        if (await db.Industries.AnyAsync())
        {
            return;
        }

        var industries = new[]
        {
            "FMCG",
            "Food & Beverage",
            "Personal Care",
            "Cosmetics & Beauty",
            "Healthcare & OTC",
            "Household Products",
            "Baby Care",
            "Nutritional Products",
            "Consumer Goods",
            "Specialty Products"
        };

        var order = 1;
        foreach (var name in industries)
        {
            db.Industries.Add(new Industry
            {
                Id = Guid.NewGuid(),
                Name = name,
                Slug = FluentSlug(name),
                ShortDescription = $"{name} market expansion and distribution support.",
                DisplayOrder = order++,
                IsActive = true
            });
        }
    }

    private static async Task SeedMarketsAsync(GenerioDbContext db)
    {
        if (await db.MarketRegions.AnyAsync())
        {
            return;
        }

        var regions = new (string Name, string Color, double Lat, double Lng, string[] Countries)[]
        {
            ("GCC", "#1B9DD9", 25.2, 51.5, ["United Arab Emirates", "Saudi Arabia", "Kuwait", "Qatar", "Bahrain", "Oman"]),
            ("Levant & Iraq", "#157AA8", 33.3, 36.3, ["Iraq", "Jordan", "Lebanon", "Syria"]),
            ("South & Central Asia", "#0F172A", 28.6, 77.2, ["India", "Nepal", "Afghanistan"]),
            ("Africa", "#475569", 9.0, 38.7, ["Sudan", "Ethiopia", "Kenya", "Uganda", "Tanzania", "West Africa Markets", "Central Africa Markets"]),
            ("Iran & Neighboring Markets", "#64748B", 32.4, 53.7, ["Iran"])
        };

        var regionOrder = 1;
        foreach (var (name, color, lat, lng, countries) in regions)
        {
            var region = new MarketRegion
            {
                Id = Guid.NewGuid(),
                Name = name,
                Slug = FluentSlug(name),
                Description = $"{name} coverage for Generio market expansion programmes.",
                HighlightColor = color,
                CentroidLat = lat,
                CentroidLng = lng,
                DisplayOrder = regionOrder++,
                IsActive = true
            };
            db.MarketRegions.Add(region);

            var countryOrder = 1;
            foreach (var country in countries)
            {
                db.MarketCountries.Add(new MarketCountry
                {
                    Id = Guid.NewGuid(),
                    MarketRegionId = region.Id,
                    Name = country,
                    DisplayOrder = countryOrder++,
                    IsActive = true
                });
            }
        }
    }

    private static async Task EnrichCountryCoordinatesAsync(GenerioDbContext db)
    {
        var coordinates = new Dictionary<string, (double Lat, double Lng)>(StringComparer.OrdinalIgnoreCase)
        {
            ["United Arab Emirates"] = (23.4, 53.8),
            ["Saudi Arabia"] = (23.9, 45.1),
            ["Kuwait"] = (29.3, 47.5),
            ["Qatar"] = (25.3, 51.2),
            ["Bahrain"] = (26.0, 50.5),
            ["Oman"] = (21.5, 57.0),
            ["Iraq"] = (33.2, 44.4),
            ["Jordan"] = (31.0, 36.0),
            ["Lebanon"] = (33.9, 35.5),
            ["Syria"] = (35.0, 38.5),
            ["India"] = (22.0, 79.0),
            ["Nepal"] = (28.4, 84.1),
            ["Afghanistan"] = (33.9, 67.7),
            ["Sudan"] = (15.5, 32.5),
            ["Ethiopia"] = (9.1, 40.5),
            ["Kenya"] = (-0.2, 37.9),
            ["Uganda"] = (1.4, 32.3),
            ["Tanzania"] = (-6.4, 34.9),
            ["West Africa Markets"] = (8.0, 0.0),
            ["Central Africa Markets"] = (4.0, 18.0),
            ["Iran"] = (32.4, 53.7)
        };

        var countries = await db.MarketCountries
            .Where(c => c.Latitude == null || c.Longitude == null)
            .ToListAsync();

        foreach (var country in countries)
        {
            if (!coordinates.TryGetValue(country.Name, out var point))
            {
                continue;
            }

            country.Latitude = point.Lat;
            country.Longitude = point.Lng;
        }
    }

    private static async Task SeedPagesAsync(GenerioDbContext db)
    {
        if (await db.Pages.AnyAsync())
        {
            return;
        }

        var pages = new (string Name, string Slug, string Title, string Type, (string Type, string? Title, string? Desc)[] Sections)[]
        {
            ("Home", "home", "Home", "home", [
                ("hero", "Your Gateway to Emerging Markets", "Connecting brands with the right partners across emerging markets."),
                ("introduction", "About Generio", "Dubai-based business development and market expansion."),
                ("value_props", "Why brands choose Generio", null),
                ("services", "What we do", null),
                ("markets_map", "Markets we cover", null),
                ("industries", "Industries we serve", null),
                ("partners", "Partner network", null),
                ("success_stories", "Success stories", null),
                ("contact_cta", "Start a conversation", "One enquiry form for brand owners, distributors, and partners.")
            ]),
            ("About Generio", "about", "About Generio", "about", [
                ("introduction", "About Generio Trading FZCO", "Dubai-based business development and market expansion company."),
                ("value_props", "Why brands choose Generio", null),
                ("rich_text", "Our approach", "Strategic guidance from distributor selection to long-term partner management.")
            ]),
            ("Services", "services", "Services", "listing", [
                ("services", "Services", "Generio service groups for market entry and distribution growth.")
            ]),
            ("Markets We Cover", "markets", "Markets We Cover", "markets", [
                ("markets_map", "Interactive regional coverage", "Explore Generio's geographic coverage by region and market.")
            ]),
            ("Industries", "industries", "Industries", "listing", [
                ("industries", "Industries served", null)
            ]),
            ("Partner Network", "partners", "Partner Network", "listing", [
                ("partners", "Partner network", "Featured partners will appear here when supplied by Generio.")
            ]),
            ("Success Stories", "success-stories", "Success Stories", "listing", [
                ("success_stories", "Success stories", "Published stories will appear here when provided.")
            ]),
            ("Contact", "contact", "Contact", "contact", [
                ("contact_form", "Contact Generio", "One enquiry form for all visitor types.")
            ]),
            ("Privacy Policy", "privacy-policy", "Privacy Policy", "legal", [
                ("rich_text", "Privacy Policy", "Legal copy to be supplied before launch.")
            ]),
            ("Terms and Conditions", "terms", "Terms and Conditions", "legal", [
                ("rich_text", "Terms and Conditions", "Legal copy to be supplied before launch.")
            ]),
            ("Cookie Policy", "cookie-policy", "Cookie Policy", "legal", [
                ("rich_text", "Cookie Policy", "Legal copy to be supplied before launch.")
            ])
        };

        foreach (var (name, slug, title, type, sections) in pages)
        {
            var page = new Page
            {
                Id = Guid.NewGuid(),
                Name = name,
                Slug = slug,
                Title = title,
                PageType = type,
                Status = "Published",
                IsPublished = true,
                PublishedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.Pages.Add(page);

            var order = 1;
            foreach (var (sectionType, sectionTitle, desc) in sections)
            {
                db.PageSections.Add(new PageSection
                {
                    Id = Guid.NewGuid(),
                    PageId = page.Id,
                    SectionType = sectionType,
                    Title = sectionTitle,
                    Description = desc,
                    DisplayOrder = order++,
                    IsVisible = true,
                    ContentJson = sectionType == "value_props"
                        ? JsonSerializer.Serialize(new[]
                        {
                            "Access to vetted distributors across multiple regions",
                            "Strong presence in difficult-to-access and emerging markets",
                            "Deep understanding of regional trade dynamics",
                            "Local market intelligence and business development expertise",
                            "Reduced time and cost of market entry",
                            "Single point of contact for multiple markets",
                            "Long-term partnership approach focused on sustainable growth"
                        })
                        : null
                });
            }
        }
    }

    private static async Task SeedSeoAsync(GenerioDbContext db)
    {
        if (await db.SeoMetadata.AnyAsync())
        {
            return;
        }

        var pages = await db.Pages.ToListAsync();
        foreach (var page in pages)
        {
            db.SeoMetadata.Add(new SeoMetadata
            {
                Id = Guid.NewGuid(),
                EntityType = "Page",
                EntityId = page.Id,
                LanguageCode = "en",
                SeoTitle = $"{page.Title} | Generio Trading FZCO",
                MetaDescription = $"{page.Title} — Generio Trading FZCO, your gateway to emerging markets.",
                CanonicalUrl = page.Slug == "home" ? "/" : $"/{page.Slug}",
                RobotsIndex = true,
                RobotsFollow = true,
                UpdatedAt = DateTime.UtcNow
            });
        }
    }

    private static string FluentSlug(string value) => SlugHelper.ToSlug(value);
}
