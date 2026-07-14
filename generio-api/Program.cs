using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Generio.Api.Configuration;
using Generio.Api.Features.Admin;
using Generio.Api.Features.Auth;
using Generio.Api.Features.Public;
using Generio.Api.Infrastructure;
using Generio.Api.Infrastructure.Auth;
using Generio.Api.Infrastructure.Data;
using Generio.Api.Infrastructure.Notifications;
using Generio.Api.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;
using FluentValidation;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Railway injects PORT; prefer it over Dockerfile ASPNETCORE_URLS when present.
    var railwayPort = Environment.GetEnvironmentVariable("PORT");
    if (!string.IsNullOrWhiteSpace(railwayPort))
    {
        builder.WebHost.UseUrls($"http://0.0.0.0:{railwayPort}");
    }

    builder.Host.UseSerilog((context, services, configuration) =>
    {
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services)
            .Enrich.FromLogContext()
            .WriteTo.Console();

        // File logs only in Development — Railway filesystem is ephemeral/read-only outside volumes.
        if (context.HostingEnvironment.IsDevelopment())
        {
            configuration.WriteTo.File("logs/generio-api-.log", rollingInterval: RollingInterval.Day);
        }
    });

    builder.Services.ConfigureHttpJsonOptions(options =>
    {
        // Guard against EF navigation cycles (e.g. Page ↔ PageSection) if a raw entity is returned.
        options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

    builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
    builder.Services.Configure<CaptchaOptions>(builder.Configuration.GetSection(CaptchaOptions.SectionName));
    builder.Services.Configure<EmailOptions>(builder.Configuration.GetSection(EmailOptions.SectionName));
    builder.Services.Configure<WhatsAppOptions>(builder.Configuration.GetSection(WhatsAppOptions.SectionName));
    builder.Services.AddGenerioMediaStorage(builder.Configuration);

    var connectionString = DatabaseConnection.Resolve(builder.Configuration, builder.Environment);

    builder.Services.AddDbContext<GenerioDbContext>(options =>
        options.UseNpgsql(connectionString));

    builder.Services.AddHttpContextAccessor();
    builder.Services.AddHttpClient("captcha");
    builder.Services.AddScoped<JwtTokenService>();
    builder.Services.AddScoped<AuthService>();
    builder.Services.AddScoped<AuditService>();
    builder.Services.AddScoped<ICaptchaVerifier, CaptchaVerifier>();
    builder.Services.AddScoped<IEnquiryNotifier, EnquiryNotifier>();
    builder.Services.AddSingleton<IWhatsAppNotifier, LoggingWhatsAppNotifier>();

    var emailProvider = builder.Configuration.GetSection(EmailOptions.SectionName).GetValue<string>("Provider") ?? "Console";
    if (emailProvider.Equals("Smtp", StringComparison.OrdinalIgnoreCase))
    {
        builder.Services.AddSingleton<IEmailSender, SmtpEmailSender>();
    }
    else
    {
        builder.Services.AddSingleton<IEmailSender, ConsoleEmailSender>();
    }

    builder.Services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        options.AddPolicy("enquiries", httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 5,
                    Window = TimeSpan.FromMinutes(10),
                    QueueLimit = 0
                }));
    });

    var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
        ?? throw new InvalidOperationException("Jwt configuration is missing.");

    if (string.IsNullOrWhiteSpace(jwt.SigningKey) || jwt.SigningKey.Length < 32)
    {
        throw new InvalidOperationException("Jwt:SigningKey must be at least 32 characters.");
    }

    builder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = true,
                ValidIssuer = jwt.Issuer,
                ValidAudience = jwt.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SigningKey)),
                ClockSkew = TimeSpan.FromMinutes(1)
            };
        });

    builder.Services.AddAuthorization();
    builder.Services.AddOpenApi();
    builder.Services.AddHealthChecks();

    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
        ?? ["http://localhost:3000"];

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("Frontend", policy =>
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod());
    });

    var app = builder.Build();

    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
    }

    app.UseCors("Frontend");
    app.UseGenerioMediaFiles();
    app.UseRateLimiter();
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapGet("/api/health", () => Results.Ok(new
    {
        status = "ok",
        service = "generio-api",
        utc = DateTime.UtcNow
    })).WithTags("Health");

    app.MapHealthChecks("/health");
    app.MapAuthEndpoints();
    app.MapAdminEndpoints();
    app.MapAdminContentEndpoints();
    app.MapAdminMediaSeoEndpoints();
    app.MapPublicContentEndpoints();

    using (var scope = app.Services.CreateScope())
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");
        try
        {
            var db = scope.ServiceProvider.GetRequiredService<GenerioDbContext>();
            await DbSeeder.SeedAsync(db, app.Configuration, logger);
        }
        catch (Exception ex) when (app.Environment.IsDevelopment())
        {
            logger.LogWarning(
                ex,
                "Database migrate/seed skipped. Start Postgres with `docker compose up -d` then restart the API.");
        }
    }

    app.Run();
}
catch (HostAbortedException)
{
    throw;
}
catch (Exception ex)
{
    Log.Fatal(ex, "Generio API terminated unexpectedly");
    throw;
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program;
