using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTrackScheme : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "SubDivision",
                table: "Locations",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "RailwaySection",
                table: "Locations",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<Guid>(
                name: "TrackSegmentId",
                table: "Locations",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TrackSensorId",
                table: "Defects",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TrackSegments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StartKm = table.Column<double>(type: "float", nullable: false),
                    EndKm = table.Column<double>(type: "float", nullable: false),
                    StartX = table.Column<double>(type: "float", nullable: false),
                    StartY = table.Column<double>(type: "float", nullable: false),
                    EndX = table.Column<double>(type: "float", nullable: false),
                    EndY = table.Column<double>(type: "float", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrackSegments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TrackSensors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Serial = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TrackSegmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    X = table.Column<double>(type: "float", nullable: false),
                    Y = table.Column<double>(type: "float", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrackSensors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrackSensors_TrackSegments_TrackSegmentId",
                        column: x => x.TrackSegmentId,
                        principalTable: "TrackSegments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Locations_TrackSegmentId",
                table: "Locations",
                column: "TrackSegmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Defects_TrackSensorId",
                table: "Defects",
                column: "TrackSensorId");

            migrationBuilder.CreateIndex(
                name: "IX_TrackSensors_Serial",
                table: "TrackSensors",
                column: "Serial",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrackSensors_TrackSegmentId",
                table: "TrackSensors",
                column: "TrackSegmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Defects_TrackSensors_TrackSensorId",
                table: "Defects",
                column: "TrackSensorId",
                principalTable: "TrackSensors",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Locations_TrackSegments_TrackSegmentId",
                table: "Locations",
                column: "TrackSegmentId",
                principalTable: "TrackSegments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Defects_TrackSensors_TrackSensorId",
                table: "Defects");

            migrationBuilder.DropForeignKey(
                name: "FK_Locations_TrackSegments_TrackSegmentId",
                table: "Locations");

            migrationBuilder.DropTable(
                name: "TrackSensors");

            migrationBuilder.DropTable(
                name: "TrackSegments");

            migrationBuilder.DropIndex(
                name: "IX_Locations_TrackSegmentId",
                table: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_Defects_TrackSensorId",
                table: "Defects");

            migrationBuilder.DropColumn(
                name: "TrackSegmentId",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "TrackSensorId",
                table: "Defects");

            migrationBuilder.AlterColumn<string>(
                name: "SubDivision",
                table: "Locations",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "RailwaySection",
                table: "Locations",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);
        }
    }
}
