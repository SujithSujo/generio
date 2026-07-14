using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Generio.Api.Infrastructure;

public static partial class SlugHelper
{
    public static string ToSlug(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var normalized = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var c in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            {
                sb.Append(c);
            }
        }

        var cleaned = NonSlugChars().Replace(sb.ToString().Normalize(NormalizationForm.FormC), "-");
        cleaned = MultiDash().Replace(cleaned, "-").Trim('-');
        return cleaned;
    }

    [GeneratedRegex(@"[^a-z0-9\s-]")]
    private static partial Regex NonSlugChars();

    [GeneratedRegex(@"[\s-]+")]
    private static partial Regex MultiDash();
}
