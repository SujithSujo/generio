namespace Generio.Api.Infrastructure.Storage;

/// <summary>
/// Placeholder for cloud providers. Configure Storage:Provider=Local for MVP,
/// or implement AzureBlob/S3/R2 adapters and register them in Program.cs.
/// </summary>
public sealed class UnconfiguredCloudMediaStorage : IMediaStorage
{
    private readonly string _provider;

    public UnconfiguredCloudMediaStorage(string provider)
    {
        _provider = provider;
    }

    public string ProviderName => _provider;

    public Task<StoredMediaResult> SaveAsync(Stream content, string originalFileName, string mimeType, CancellationToken cancellationToken = default) =>
        throw new InvalidOperationException(
            $"Storage provider '{_provider}' is not configured yet. Set Storage:Provider=Local for development, or wire the cloud adapter.");

    public Task DeleteAsync(string storagePath, CancellationToken cancellationToken = default) =>
        throw new InvalidOperationException($"Storage provider '{_provider}' is not configured yet.");
}
