using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Configuration
{
    public class TrackPointConfiguration
     : IEntityTypeConfiguration<TrackPoint>
    {
        public void Configure(
            EntityTypeBuilder<TrackPoint> builder)
        {
            builder.ToTable("TrackPoints");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Order)
                .IsRequired();

            builder.Property(x => x.X)
                .IsRequired();

            builder.Property(x => x.Y)
                .IsRequired();

            builder.HasIndex(x => new
            {
                x.TrackSegmentId,
                x.Order
            })
            .IsUnique();
        }
    }
}
