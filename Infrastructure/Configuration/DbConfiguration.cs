using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RailwayTracks.Authorization;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Configuration
{
    public class DbConfiguration : IEntityTypeConfiguration<Defect>
    {
        public void Configure(EntityTypeBuilder<Defect> builder)
        {
            builder.ToTable("Defects");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Description)
                .HasMaxLength(2000);

            builder.Property(x => x.Status)
                .IsRequired();

            builder.Property(x => x.Saverity)
                .IsRequired();

            builder.Property(x => x.SourceType)
                .IsRequired();

            builder.Property(x => x.RecommendationType)
                .IsRequired();

            builder.HasOne(x => x.DefectType)
                .WithMany()
                .HasForeignKey(x => x.DefectTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Location)
                .WithMany(x => x.Defects)
                .HasForeignKey(x => x.LocationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.DetectedBy)
                .WithMany(x => x.Defects)
                .HasForeignKey(x => x.DetectedById)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.RepairTeam)
                .WithMany(x => x.Defects)
                .HasForeignKey(x => x.RepairTeamId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(x => x.DefectStatusHistories)
                .WithOne(x => x.Defect)
                .HasForeignKey(x => x.DefectId)
                .OnDelete(DeleteBehavior.Cascade);
            
        }

    }
}
