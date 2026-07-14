using System.Text;

namespace Generio.Api.Infrastructure;

public static class DatabaseConnection
{
    /// <summary>
    /// Prefer Railway DATABASE_URL / DATABASE_PRIVATE_URL, then ConnectionStrings:Default.
    /// Rejects loopback hosts outside Development so misconfigured deploys fail loudly.
    /// </summary>
    public static string Resolve(IConfiguration configuration, IHostEnvironment? environment = null)
    {
        foreach (var key in new[] { "DATABASE_URL", "DATABASE_PRIVATE_URL" })
        {
            var url = FirstNonEmpty(configuration[key], Environment.GetEnvironmentVariable(key));
            if (url is not null)
            {
                return FromDatabaseUrl(url);
            }
        }

        // Individual Railway / Heroku-style PG* variables
        var pgHost = FirstNonEmpty(
            configuration["PGHOST"],
            Environment.GetEnvironmentVariable("PGHOST"));
        if (pgHost is not null)
        {
            return FromPgEnvironment(configuration);
        }

        var configured = configuration.GetConnectionString("Default");
        if (string.IsNullOrWhiteSpace(configured))
        {
            throw new InvalidOperationException(
                "PostgreSQL is not configured. On Railway: Variables → add reference to Postgres DATABASE_URL " +
                "(or DATABASE_PRIVATE_URL). Do not set ConnectionStrings__Default to localhost.");
        }

        if (IsLoopbackConnection(configured)
            && environment is not null
            && !environment.IsDevelopment())
        {
            throw new InvalidOperationException(
                "ConnectionStrings:Default points to localhost, which is unreachable on Railway. " +
                "Remove ConnectionStrings__Default from the API service variables and link " +
                "DATABASE_URL from the Postgres plugin instead.");
        }

        return configured;
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
        AppendSsl(builder, query);
        return builder.ToString();
    }

    private static string FromPgEnvironment(IConfiguration configuration)
    {
        string Env(string key) =>
            FirstNonEmpty(configuration[key], Environment.GetEnvironmentVariable(key)) ?? string.Empty;

        var host = Env("PGHOST");
        var port = FirstNonEmpty(Env("PGPORT"), "5432");
        var database = FirstNonEmpty(Env("PGDATABASE"), Env("POSTGRES_DB"), "railway");
        var username = FirstNonEmpty(Env("PGUSER"), Env("POSTGRES_USER"), "postgres");
        var password = FirstNonEmpty(Env("PGPASSWORD"), Env("POSTGRES_PASSWORD"), string.Empty);

        var builder = new StringBuilder();
        builder.Append($"Host={host};Port={port};Database={database};Username={username};Password={password};");
        AppendSsl(builder, query: null);
        return builder.ToString();
    }

    private static void AppendSsl(StringBuilder builder, string? query)
    {
        if (query is not null
            && query.Contains("sslmode=disable", StringComparison.OrdinalIgnoreCase))
        {
            builder.Append("SSL Mode=Disable;");
            return;
        }

        builder.Append("SSL Mode=Require;Trust Server Certificate=true;");
    }

    private static bool IsLoopbackConnection(string connectionString)
    {
        return connectionString.Contains("Host=localhost", StringComparison.OrdinalIgnoreCase)
               || connectionString.Contains("Host=127.0.0.1", StringComparison.OrdinalIgnoreCase)
               || connectionString.Contains("Server=localhost", StringComparison.OrdinalIgnoreCase)
               || connectionString.Contains("Server=127.0.0.1", StringComparison.OrdinalIgnoreCase);
    }

    private static string? FirstNonEmpty(params string?[] values)
    {
        foreach (var value in values)
        {
            if (!string.IsNullOrWhiteSpace(value))
            {
                return value;
            }
        }

        return null;
    }
}
