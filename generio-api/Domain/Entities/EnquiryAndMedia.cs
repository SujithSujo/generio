using Generio.Api.Domain.Enums;

namespace Generio.Api.Domain.Entities;

public class ContactEnquiry
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Company { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public EnquiryType EnquiryType { get; set; } = EnquiryType.General;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public Guid? ServiceId { get; set; }
    public Service? Service { get; set; }
    public EnquiryStatus Status { get; set; } = EnquiryStatus.New;
    public string? InternalRemarks { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public string? IpAddress { get; set; }
}

public class MediaFile
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public string StorageProvider { get; set; } = "Local";
    public string StoragePath { get; set; } = string.Empty;
    public string? PublicUrl { get; set; }
    public string? AltText { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public long FileSize { get; set; }
    public Guid? UploadedByUserId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class SeoMetadata
{
    public Guid Id { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string LanguageCode { get; set; } = "en";
    public string? SeoTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? CanonicalUrl { get; set; }
    public string? OpenGraphTitle { get; set; }
    public string? OpenGraphDescription { get; set; }
    public Guid? OpenGraphImageId { get; set; }
    public bool RobotsIndex { get; set; } = true;
    public bool RobotsFollow { get; set; } = true;
    public string? StructuredDataJson { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class RedirectRule
{
    public Guid Id { get; set; }
    public string FromPath { get; set; } = string.Empty;
    public string ToUrl { get; set; } = string.Empty;
    public bool IsPermanent { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
