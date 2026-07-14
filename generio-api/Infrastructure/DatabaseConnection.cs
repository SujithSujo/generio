using System.Text;

namespace Generio.Api.Infrastructure;

public static class DatabaseConnection
{
    /// <summary>
    /// Prefer DATABASE_URL (Railway) when set; otherwise ConnectionStrings:Default.
    /// </summary>
    public static string Resolve(IConfiguration configuration)
    {
        var url = configuration["DATABASE_URL"]
                  ?? Environment.GetEnvironmentVariable("DATABASE_URL");
        if (!string.IsNullOrWhiteSpace(url))
        {
            return FromDatabaseUrl(url);
        }

        var configured = configuration.GetConnectionString("Default");
        if (!string.IsNullOrWhiteSpace(configured))
        {
            return configured;
        }

        throw new InvalidOperationException(
            "Set DATABASE_URL or ConnectionStrings:Default for PostgreSQL.");
    }

    public static string FromDatabaseUrl(string databaseUrl)
    {
        // postgresql://user:pass@host:port/db?sslmode=require
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':', 2);
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
        var database = uri.AbsolutePath.Trim('/');
        var query = uri.Query.TrimStart('?');

        var builder = new StringBuilder();
        builder.Append($"Host={uri.Host};");
        if (uri.Port > 0) builder.Append($"Port={uri.Port};");
        builder.Append($"Database={database};");
        builder.Append($"Username={username};");
        builder.Append($"Password={password};");

        if (query.Contains("sslmode=disable", StringComparison.OrdinalIgnoreCase))
        {
            builder.Append("SSL Mode=Disable;");
        }
        else
        {
            builder.Append("SSL Mode=Require;Trust Server Certificate=true;");
        }

        return builder.ToString();
    }
}
