namespace Generio.Api.Domain.Entities;

public class Partner
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? ShortDescription { get; set; }
    public string? WebsiteUrl { get; set; }
    public Guid? LogoMediaId { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class SuccessStory
{
    public Guid Id { get; set; }
    public string? PersonName { get; set; }
    public string? Designation { get; set; }
    public string? CompanyName { get; set; }
    public string StoryText { get; set; } = string.Empty;
    public Guid? PersonImageId { get; set; }
    public Guid? CompanyLogoId { get; set; }
    public int? Rating { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
