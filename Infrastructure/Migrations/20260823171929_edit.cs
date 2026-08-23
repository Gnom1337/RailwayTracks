using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class edit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Defects_TrackSensors_TrackSensorId",
                table: "Defects");

            migrationBuilder.DropColumn(
                name: "EndX",
                table: "TrackSegments");

            migrationBuilder.DropColumn(
                name: "EndY",
                table: "TrackSegments");

            migrationBuilder.DropColumn(
                name: "StartX",
                table: "TrackSegments");

            migrationBuilder.DropColumn(
                name: "StartY",
                table: "TrackSegments");

            migrationBuilder.CreateTable(
                name: "TrackPoints",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TrackSegmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    X = table.Column<double>(type: "float", nullable: false),
                    Y = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrackPoints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrackPoints_TrackSegments_TrackSegmentId",
                        column: x => x.TrackSegmentId,
                        principalTable: "TrackSegments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TrackPoints_TrackSegmentId_Order",
                table: "TrackPoints",
                columns: new[] { "TrackSegmentId", "Order" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Defects_TrackSensors_TrackSensorId",
                table: "Defects",
                column: "TrackSensorId",
                principalTable: "TrackSensors",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Defects_TrackSensors_TrackSensorId",
                table: "Defects");

            migrationBuilder.DropTable(
                name: "TrackPoints");

            migrationBuilder.AddColumn<double>(
                name: "EndX",
                table: "TrackSegments",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "EndY",
                table: "TrackSegments",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "StartX",
                table: "TrackSegments",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "StartY",
                table: "TrackSegments",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddForeignKey(
                name: "FK_Defects_TrackSensors_TrackSensorId",
                table: "Defects",
                column: "TrackSensorId",
                principalTable: "TrackSensors",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
