using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Configuration
{
    public class LocationConfiguration
    : IEntityTypeConfiguration<Location>
    {
        public void Configure(EntityTypeBuilder<Location> builder)
        {
            builder.ToTable("Locations");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.RailwaySection)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.SubDivision)
                .IsRequired()
                .HasMaxLength(200);

            builder.HasOne(x => x.TrackSegment)
                .WithMany(x => x.Locations)
                .HasForeignKey(x => x.TrackSegmentId)
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.TrackSegment)
                .WithMany(x => x.Locations)
                .HasForeignKey(x => x.TrackSegmentId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
