using Generio.Api.Configuration;
using Microsoft.Extensions.Options;

namespace Generio.Api.Infrastructure.Security;

public interface ICaptchaVerifier
{
    Task<bool> VerifyAsync(string? token, string? remoteIp, CancellationToken cancellationToken = default);
}

public sealed class CaptchaVerifier : ICaptchaVerifier
{
    private readonly CaptchaOptions _options;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<CaptchaVerifier> _logger;

    public CaptchaVerifier(
        IOptions<CaptchaOptions> options,
        IHttpClientFactory httpClientFactory,
        ILogger<CaptchaVerifier> logger)
    {
        _options = options.Value;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<bool> VerifyAsync(string? token, string? remoteIp, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(_options.SecretKey))
        {
            return false;
        }

        try
        {
            var client = _httpClientFactory.CreateClient("captcha");
            using var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["secret"] = _options.SecretKey!,
                ["response"] = token,
                ["remoteip"] = remoteIp ?? string.Empty
            });
            using var response = await client.PostAsync(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                content,
                cancellationToken);
            if (!response.IsSuccessStatusCode) return false;

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var doc = await System.Text.Json.JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
            return doc.RootElement.TryGetProperty("success", out var success) && success.GetBoolean();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CAPTCHA verification failed");
            return false;
        }
    }
}
