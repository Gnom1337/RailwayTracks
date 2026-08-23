using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Configuration
{
    public class TrackSensorConfiguration
     : IEntityTypeConfiguration<TrackSensor>
    {
        public void Configure(
            EntityTypeBuilder<TrackSensor> builder)
        {
            builder.ToTable("TrackSensors");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Serial)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasIndex(x => x.Serial)
                .IsUnique();
        }
    }
}
