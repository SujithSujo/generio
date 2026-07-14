namespace Generio.Api.Configuration;

/// <summary>
/// Media storage provider is selected at deploy time via configuration.
/// Supported: Local (dev/MVP) | AzureBlob | S3 | CloudflareR2 (adapters ready to wire).
/// </summary>
public class StorageOptions
{
    public const string SectionName = "Storage";

    public string Provider { get; set; } = "Local";
    public string? ConnectionString { get; set; }
    public string? ContainerOrBucket { get; set; }
    /// <summary>Public origin for stored media URLs, e.g. http://localhost:5080</summary>
    public string? PublicBaseUrl { get; set; }
    public string? Region { get; set; }
    /// <summary>Local disk root (relative to content root or absolute).</summary>
    public string LocalRootPath { get; set; } = "App_Data/media";
}
