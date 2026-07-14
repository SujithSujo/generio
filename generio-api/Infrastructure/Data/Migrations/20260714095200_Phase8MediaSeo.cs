using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Generio.Api.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class Phase8MediaSeo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "redirect_rules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FromPath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ToUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    IsPermanent = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_redirect_rules", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_redirect_rules_FromPath",
                table: "redirect_rules",
                column: "FromPath",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "redirect_rules");
        }
    }
}
