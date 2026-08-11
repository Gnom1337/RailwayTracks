using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Configuration
{
    public class DbConfiguration : IEntityTypeConfiguration<Defect>
    {
        public void Configure(EntityTypeBuilder<Defect> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Description)
                   .HasMaxLength(500);

            builder.Property(x => x.Saverity)
                   .HasConversion<string>();
            builder.Property(x => x.Status)
                   .HasConversion<string>();
            builder.Property(x => x.RecommendationType)
                   .HasConversion<string>();
            builder.Property(x => x.SourceType)
                   .HasConversion<string>();
            builder.HasOne(x => x.Location)
                   .WithMany(x => x.Defects)
                   .HasForeignKey(x => x.LocationId);
        }
        
    }
}
