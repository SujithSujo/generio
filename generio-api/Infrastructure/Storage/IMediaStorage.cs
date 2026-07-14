namespace Generio.Api.Infrastructure.Storage;

public sealed record StoredMediaResult(
    string StoragePath,
    string PublicUrl,
    string FileName,
    string MimeType,
    long FileSize,
    int? Width,
    int? Height);

public interface IMediaStorage
{
    string ProviderName { get; }
    Task<StoredMediaResult> SaveAsync(Stream content, string originalFileName, string mimeType, CancellationToken cancellationToken = default);
    Task DeleteAsync(string storagePath, CancellationToken cancellationToken = default);
}
