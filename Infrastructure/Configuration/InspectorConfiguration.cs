using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Configuration
{
    public class InspectorConfiguration : IEntityTypeConfiguration<Inspector>
    {
        public void Configure(EntityTypeBuilder<Inspector> builder)
        {
            builder.ToTable("Inspectors");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.InspectorType)
                .IsRequired();

            builder.Property(x => x.EmployeeId)
                .IsRequired();

            builder.Property(x => x.FullName)
                .HasMaxLength(200);

            builder.Property(x => x.SensorSerial)
                .HasMaxLength(100);

            builder.HasMany(x => x.Defects)
                .WithOne(x => x.DetectedBy)
                .HasForeignKey(x => x.DetectedById)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
