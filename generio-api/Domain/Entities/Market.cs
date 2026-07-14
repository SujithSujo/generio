namespace Generio.Api.Domain.Entities;

public class MarketRegion
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? HighlightColor { get; set; }
    public string? BoundaryJson { get; set; }
    public double? CentroidLat { get; set; }
    public double? CentroidLng { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<MarketCountry> Countries { get; set; } = new List<MarketCountry>();
}

public class MarketCountry
{
    public Guid Id { get; set; }
    public Guid MarketRegionId { get; set; }
    public MarketRegion MarketRegion { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string? IsoCode { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? ShortDescription { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
