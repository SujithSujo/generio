using Generio.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Generio.Api.Infrastructure.Data;

public class GenerioDbContext(DbContextOptions<GenerioDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<SiteSetting> SiteSettings => Set<SiteSetting>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Page> Pages => Set<Page>();
    public DbSet<PageSection> PageSections => Set<PageSection>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Industry> Industries => Set<Industry>();
    public DbSet<MarketRegion> MarketRegions => Set<MarketRegion>();
    public DbSet<MarketCountry> MarketCountries => Set<MarketCountry>();
    public DbSet<Partner> Partners => Set<Partner>();
    public DbSet<SuccessStory> SuccessStories => Set<SuccessStory>();
    public DbSet<ContactEnquiry> ContactEnquiries => Set<ContactEnquiry>();
    public DbSet<MediaFile> MediaFiles => Set<MediaFile>();
    public DbSet<SeoMetadata> SeoMetadata => Set<SeoMetadata>();
    public DbSet<RedirectRule> RedirectRules => Set<RedirectRule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureIdentity(modelBuilder);
        ConfigureCms(modelBuilder);
        ConfigureContent(modelBuilder);
    }

    private static void ConfigureIdentity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.Email).HasMaxLength(256).IsRequired();
            entity.Property(x => x.PasswordHash).HasMaxLength(512).IsRequired();
            entity.Property(x => x.FullName).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Name).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(500);
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("user_roles");
            entity.HasKey(x => new { x.UserId, x.RoleId });
            entity.HasOne(x => x.User).WithMany(x => x.UserRoles).HasForeignKey(x => x.UserId);
            entity.HasOne(x => x.Role).WithMany(x => x.UserRoles).HasForeignKey(x => x.RoleId);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("refresh_tokens");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.TokenHash).IsUnique();
            entity.Property(x => x.TokenHash).HasMaxLength(128).IsRequired();
            entity.HasOne(x => x.User).WithMany(x => x.RefreshTokens).HasForeignKey(x => x.UserId);
        });
    }

    private static void ConfigureCms(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Permission>(entity =>
        {
            entity.ToTable("permissions");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Code).IsUnique();
            entity.Property(x => x.Code).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(500);
            entity.Property(x => x.GroupName).HasMaxLength(100).IsRequired();
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.ToTable("role_permissions");
            entity.HasKey(x => new { x.RoleId, x.PermissionId });
            entity.HasOne(x => x.Role).WithMany(x => x.RolePermissions).HasForeignKey(x => x.RoleId);
            entity.HasOne(x => x.Permission).WithMany(x => x.RolePermissions).HasForeignKey(x => x.PermissionId);
        });

        modelBuilder.Entity<SiteSetting>(entity =>
        {
            entity.ToTable("site_settings");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Key).IsUnique();
            entity.Property(x => x.Key).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Value).HasMaxLength(4000).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(500);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Action).HasMaxLength(100).IsRequired();
            entity.Property(x => x.EntityType).HasMaxLength(100).IsRequired();
            entity.Property(x => x.EntityId).HasMaxLength(100);
            entity.Property(x => x.UserEmail).HasMaxLength(256);
            entity.Property(x => x.IpAddress).HasMaxLength(64);
            entity.Property(x => x.Details).HasMaxLength(4000);
            entity.HasIndex(x => x.CreatedAt);
        });
    }

    private static void ConfigureContent(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Page>(entity =>
        {
            entity.ToTable("pages");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Slug).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Slug).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Title).HasMaxLength(300).IsRequired();
            entity.Property(x => x.PageType).HasMaxLength(100);
            entity.Property(x => x.Status).HasMaxLength(50).IsRequired();
        });

        modelBuilder.Entity<PageSection>(entity =>
        {
            entity.ToTable("page_sections");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.SectionType).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Title).HasMaxLength(300);
            entity.Property(x => x.Subtitle).HasMaxLength(500);
            entity.HasOne(x => x.Page).WithMany(x => x.Sections).HasForeignKey(x => x.PageId);
            entity.HasIndex(x => new { x.PageId, x.DisplayOrder });
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.ToTable("services");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Slug).IsUnique();
            entity.Property(x => x.Title).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Slug).HasMaxLength(200).IsRequired();
            entity.Property(x => x.ShortDescription).HasMaxLength(1000).IsRequired();
            entity.Property(x => x.Icon).HasMaxLength(100);
            entity.Property(x => x.SeoTitle).HasMaxLength(200);
            entity.Property(x => x.SeoDescription).HasMaxLength(500);
        });

        modelBuilder.Entity<Industry>(entity =>
        {
            entity.ToTable("industries");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Slug).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Slug).HasMaxLength(200).IsRequired();
            entity.Property(x => x.ShortDescription).HasMaxLength(1000);
            entity.Property(x => x.Icon).HasMaxLength(100);
        });

        modelBuilder.Entity<MarketRegion>(entity =>
        {
            entity.ToTable("market_regions");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Slug).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Slug).HasMaxLength(200).IsRequired();
            entity.Property(x => x.HighlightColor).HasMaxLength(32);
        });

        modelBuilder.Entity<MarketCountry>(entity =>
        {
            entity.ToTable("market_countries");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
            entity.Property(x => x.IsoCode).HasMaxLength(8);
            entity.HasOne(x => x.MarketRegion).WithMany(x => x.Countries).HasForeignKey(x => x.MarketRegionId);
            entity.HasIndex(x => new { x.MarketRegionId, x.Name }).IsUnique();
        });

        modelBuilder.Entity<Partner>(entity =>
        {
            entity.ToTable("partners");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Slug).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Slug).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Category).HasMaxLength(100);
            entity.Property(x => x.WebsiteUrl).HasMaxLength(500);
        });

        modelBuilder.Entity<SuccessStory>(entity =>
        {
            entity.ToTable("success_stories");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.PersonName).HasMaxLength(200);
            entity.Property(x => x.Designation).HasMaxLength(200);
            entity.Property(x => x.CompanyName).HasMaxLength(200);
            entity.Property(x => x.StoryText).IsRequired();
        });

        modelBuilder.Entity<ContactEnquiry>(entity =>
        {
            entity.ToTable("contact_enquiries");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Company).HasMaxLength(200);
            entity.Property(x => x.Email).HasMaxLength(256).IsRequired();
            entity.Property(x => x.Phone).HasMaxLength(50);
            entity.Property(x => x.Subject).HasMaxLength(300).IsRequired();
            entity.Property(x => x.IpAddress).HasMaxLength(64);
            entity.HasOne(x => x.Service).WithMany().HasForeignKey(x => x.ServiceId).OnDelete(DeleteBehavior.SetNull);
            entity.HasIndex(x => x.SubmittedAt);
            entity.HasIndex(x => x.Status);
        });

        modelBuilder.Entity<MediaFile>(entity =>
        {
            entity.ToTable("media_files");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.FileName).HasMaxLength(255).IsRequired();
            entity.Property(x => x.OriginalFileName).HasMaxLength(255).IsRequired();
            entity.Property(x => x.MimeType).HasMaxLength(150).IsRequired();
            entity.Property(x => x.StorageProvider).HasMaxLength(50).IsRequired();
            entity.Property(x => x.StoragePath).HasMaxLength(1000).IsRequired();
            entity.Property(x => x.PublicUrl).HasMaxLength(1000);
            entity.Property(x => x.AltText).HasMaxLength(300);
        });

        modelBuilder.Entity<SeoMetadata>(entity =>
        {
            entity.ToTable("seo_metadata");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.EntityType).HasMaxLength(100).IsRequired();
            entity.Property(x => x.LanguageCode).HasMaxLength(10).IsRequired();
            entity.Property(x => x.SeoTitle).HasMaxLength(200);
            entity.Property(x => x.MetaDescription).HasMaxLength(500);
            entity.Property(x => x.CanonicalUrl).HasMaxLength(500);
            entity.HasIndex(x => new { x.EntityType, x.EntityId, x.LanguageCode }).IsUnique();
        });

        modelBuilder.Entity<RedirectRule>(entity =>
        {
            entity.ToTable("redirect_rules");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.FromPath).HasMaxLength(500).IsRequired();
            entity.Property(x => x.ToUrl).HasMaxLength(1000).IsRequired();
            entity.HasIndex(x => x.FromPath).IsUnique();
        });
    }
}
