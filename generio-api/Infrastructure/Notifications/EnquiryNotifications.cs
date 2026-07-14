using System.Net;
using System.Net.Mail;
using System.Text;
using Generio.Api.Configuration;
using Generio.Api.Domain.Entities;
using Generio.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Generio.Api.Infrastructure.Notifications;

public interface IEmailSender
{
    Task SendAsync(string to, string subject, string plainBody, CancellationToken cancellationToken = default);
}

public interface IWhatsAppNotifier
{
    Task NotifyAsync(string message, CancellationToken cancellationToken = default);
}

public interface IEnquiryNotifier
{
    Task NotifyNewEnquiryAsync(ContactEnquiry enquiry, CancellationToken cancellationToken = default);
}

public sealed class ConsoleEmailSender(ILogger<ConsoleEmailSender> logger, IOptions<EmailOptions> options) : IEmailSender
{
    public Task SendAsync(string to, string subject, string plainBody, CancellationToken cancellationToken = default)
    {
        logger.LogInformation(
            "EMAIL [{Provider}] To={To} From={From} Subject={Subject}\n{Body}",
            options.Value.Provider,
            to,
            options.Value.FromAddress,
            subject,
            plainBody);
        return Task.CompletedTask;
    }
}

public sealed class SmtpEmailSender(IOptions<EmailOptions> options, ILogger<SmtpEmailSender> logger) : IEmailSender
{
    public async Task SendAsync(string to, string subject, string plainBody, CancellationToken cancellationToken = default)
    {
        var cfg = options.Value;
        if (string.IsNullOrWhiteSpace(cfg.SmtpHost))
        {
            throw new InvalidOperationException("Email:SmtpHost is required for Smtp provider.");
        }

        using var message = new MailMessage
        {
            From = new MailAddress(cfg.FromAddress, cfg.FromName),
            Subject = subject,
            Body = plainBody,
            BodyEncoding = Encoding.UTF8,
            IsBodyHtml = false
        };
        message.To.Add(to);

        using var client = new SmtpClient(cfg.SmtpHost, cfg.SmtpPort)
        {
            EnableSsl = cfg.SmtpUseSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network
        };
        if (!string.IsNullOrWhiteSpace(cfg.SmtpUsername))
        {
            client.Credentials = new NetworkCredential(cfg.SmtpUsername, cfg.SmtpPassword);
        }

        await client.SendMailAsync(message, cancellationToken);
        logger.LogInformation("SMTP email sent to {To} subject {Subject}", to, subject);
    }
}

public sealed class LoggingWhatsAppNotifier(IOptions<WhatsAppOptions> options, ILogger<LoggingWhatsAppNotifier> logger) : IWhatsAppNotifier
{
    public Task NotifyAsync(string message, CancellationToken cancellationToken = default)
    {
        var cfg = options.Value;
        if (!cfg.Enabled)
        {
            logger.LogInformation("WhatsApp notify skipped (disabled): {Message}", message);
            return Task.CompletedTask;
        }

        // Provider stub — wire Meta Cloud API / Twilio when credentials are ready.
        logger.LogInformation(
            "WhatsApp notify stub → {To} via {BaseUrl}: {Message}",
            cfg.NotifyTo,
            cfg.ApiBaseUrl,
            message);
        return Task.CompletedTask;
    }
}

public sealed class EnquiryNotifier(
    IEmailSender emailSender,
    IWhatsAppNotifier whatsAppNotifier,
    IOptions<EmailOptions> emailOptions,
    IOptions<WhatsAppOptions> whatsAppOptions,
    GenerioDbContext db,
    ILogger<EnquiryNotifier> logger) : IEnquiryNotifier
{
    public async Task NotifyNewEnquiryAsync(ContactEnquiry enquiry, CancellationToken cancellationToken = default)
    {
        var notifyTo = emailOptions.Value.NotifyTo;
        if (string.IsNullOrWhiteSpace(notifyTo))
        {
            notifyTo = await db.SiteSettings
                .Where(s => s.Key == "company.email")
                .Select(s => s.Value)
                .FirstOrDefaultAsync(cancellationToken);
        }

        var subject = $"[Generio] New {enquiry.EnquiryType} enquiry — {enquiry.Subject}";
        var body =
            $"""
            New enquiry received on the Generio website.

            Name: {enquiry.Name}
            Email: {enquiry.Email}
            Phone: {enquiry.Phone}
            Company: {enquiry.Company}
            Type: {enquiry.EnquiryType}
            Subject: {enquiry.Subject}
            ServiceId: {enquiry.ServiceId}
            Submitted: {enquiry.SubmittedAt:u}
            IP: {enquiry.IpAddress}

            Message:
            {enquiry.Message}
            """;

        if (!string.IsNullOrWhiteSpace(notifyTo))
        {
            try
            {
                await emailSender.SendAsync(notifyTo, subject, body, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send enquiry email notification");
            }
        }
        else
        {
            logger.LogWarning("No NotifyTo / company.email configured; enquiry email skipped");
        }

        var wa = whatsAppOptions.Value.NotifyTo;
        var waMessage = $"Generio enquiry from {enquiry.Name} ({enquiry.EnquiryType}): {enquiry.Subject}";
        try
        {
            await whatsAppNotifier.NotifyAsync(
                string.IsNullOrWhiteSpace(wa) ? waMessage : $"{waMessage} → {wa}",
                cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send enquiry WhatsApp notification");
        }
    }
}
