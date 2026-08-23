using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Configuration
{
    public class TrackSegmentConfiguration
    : IEntityTypeConfiguration<TrackSegment>
    {
        public void Configure(
            EntityTypeBuilder<TrackSegment> builder)
        {
            builder.ToTable("TrackSegments");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.StartKm)
                .IsRequired();

            builder.Property(x => x.EndKm)
                .IsRequired();

            builder.HasMany(x => x.Points)
                .WithOne(x => x.TrackSegment)
                .HasForeignKey(x => x.TrackSegmentId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.Sensors)
                .WithOne(x => x.TrackSegment)
                .HasForeignKey(x => x.TrackSegmentId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.Locations)
                .WithOne(x => x.TrackSegment)
                .HasForeignKey(x => x.TrackSegmentId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
