namespace Generio.Api.Domain.Entities;

public class Page
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? PageType { get; set; }
    public string Status { get; set; } = "Draft";
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PageSection> Sections { get; set; } = new List<PageSection>();
}

public class PageSection
{
    public Guid Id { get; set; }
    public Guid PageId { get; set; }
    public Page Page { get; set; } = null!;
    public string SectionType { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Subtitle { get; set; }
    public string? Description { get; set; }
    public string? ContentJson { get; set; }
    public Guid? BackgroundImageId { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsVisible { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
