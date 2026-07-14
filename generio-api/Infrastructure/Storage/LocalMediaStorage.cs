using Generio.Api.Configuration;
using Microsoft.Extensions.Options;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace Generio.Api.Infrastructure.Storage;

public sealed class LocalMediaStorage : IMediaStorage
{
    private readonly StorageOptions _options;
    private readonly IWebHostEnvironment _env;
    private readonly IHttpContextAccessor _http;

    public LocalMediaStorage(
        IOptions<StorageOptions> options,
        IWebHostEnvironment env,
        IHttpContextAccessor http)
    {
        _options = options.Value;
        _env = env;
        _http = http;
    }

    public string ProviderName => "Local";

    public string RootPath
    {
        get
        {
            var configured = _options.LocalRootPath;
            return Path.IsPathRooted(configured)
                ? configured
                : Path.Combine(_env.ContentRootPath, configured.Replace('/', Path.DirectorySeparatorChar));
        }
    }

    public async Task<StoredMediaResult> SaveAsync(
        Stream content,
        string originalFileName,
        string mimeType,
        CancellationToken cancellationToken = default)
    {
        Directory.CreateDirectory(RootPath);

        var safeOriginal = Path.GetFileName(originalFileName);
        var extension = Path.GetExtension(safeOriginal);
        if (string.IsNullOrWhiteSpace(extension))
        {
            extension = GuessExtension(mimeType);
        }

        var isImage = mimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)
                      && !mimeType.Equals("image/svg+xml", StringComparison.OrdinalIgnoreCase);

        int? width = null;
        int? height = null;
        string storedMime = mimeType;
        string storedExtension = extension;
        await using var buffer = new MemoryStream();

        if (isImage)
        {
            content.Position = 0;
            using var image = await Image.LoadAsync(content, cancellationToken);
            width = image.Width;
            height = image.Height;

            // Cap oversized uploads for web delivery.
            const int maxEdge = 2400;
            if (image.Width > maxEdge || image.Height > maxEdge)
            {
                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(maxEdge, maxEdge)
                }));
                width = image.Width;
                height = image.Height;
            }

            // Prefer WebP for raster uploads (keep original extension for GIF to preserve animation).
            if (!mimeType.Equals("image/gif", StringComparison.OrdinalIgnoreCase))
            {
                storedExtension = ".webp";
                storedMime = "image/webp";
                await image.SaveAsync(buffer, new WebpEncoder { Quality = 82 }, cancellationToken);
            }
            else
            {
                await image.SaveAsGifAsync(buffer, cancellationToken);
            }
        }
        else
        {
            content.Position = 0;
            await content.CopyToAsync(buffer, cancellationToken);
        }

        buffer.Position = 0;
        var relativeDir = Path.Combine(DateTime.UtcNow.ToString("yyyy"), DateTime.UtcNow.ToString("MM"));
        var absoluteDir = Path.Combine(RootPath, relativeDir);
        Directory.CreateDirectory(absoluteDir);

        var storedName = $"{Guid.NewGuid():N}{storedExtension}";
        var absolutePath = Path.Combine(absoluteDir, storedName);
        await using (var file = File.Create(absolutePath))
        {
            await buffer.CopyToAsync(file, cancellationToken);
        }

        var relativePath = $"{relativeDir.Replace('\\', '/')}/{storedName}";
        var publicUrl = BuildPublicUrl(relativePath);

        return new StoredMediaResult(
            StoragePath: relativePath,
            PublicUrl: publicUrl,
            FileName: storedName,
            MimeType: storedMime,
            FileSize: buffer.Length,
            Width: width,
            Height: height);
    }

    public Task DeleteAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        var full = Path.Combine(RootPath, storagePath.Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(full))
        {
            File.Delete(full);
        }

        return Task.CompletedTask;
    }

    private string BuildPublicUrl(string relativePath)
    {
        var baseUrl = _options.PublicBaseUrl?.TrimEnd('/');
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            var request = _http.HttpContext?.Request;
            if (request is not null)
            {
                baseUrl = $"{request.Scheme}://{request.Host.Value}";
            }
            else
            {
                baseUrl = "http://localhost:5080";
            }
        }

        return $"{baseUrl}/media/{relativePath}";
    }

    private static string GuessExtension(string mimeType) => mimeType.ToLowerInvariant() switch
    {
        "image/jpeg" or "image/jpg" => ".jpg",
        "image/png" => ".png",
        "image/webp" => ".webp",
        "image/gif" => ".gif",
        "application/pdf" => ".pdf",
        _ => ".bin"
    };
}
