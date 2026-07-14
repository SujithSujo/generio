namespace Generio.Api.Configuration;

public class CaptchaOptions
{
    public const string SectionName = "Captcha";

    /// <summary>When false (default locally), server skips CAPTCHA verification.</summary>
    public bool Enabled { get; set; }
    public string Provider { get; set; } = "Turnstile";
    public string? SiteKey { get; set; }
    public string? SecretKey { get; set; }
}

public class EmailOptions
{
    public const string SectionName = "Email";

    /// <summary>Console | Smtp</summary>
    public string Provider { get; set; } = "Console";
    public string FromAddress { get; set; } = "noreply@generiogroup.com";
    public string FromName { get; set; } = "Generio Website";
    public string? NotifyTo { get; set; }
    public string? SmtpHost { get; set; }
    public int SmtpPort { get; set; } = 587;
    public string? SmtpUsername { get; set; }
    public string? SmtpPassword { get; set; }
    public bool SmtpUseSsl { get; set; } = true;
}

public class WhatsAppOptions
{
    public const string SectionName = "WhatsApp";

    /// <summary>When false, only logs outbound notify attempts.</summary>
    public bool Enabled { get; set; }
    public string? NotifyTo { get; set; }
    public string? ApiBaseUrl { get; set; }
    public string? ApiToken { get; set; }
}
