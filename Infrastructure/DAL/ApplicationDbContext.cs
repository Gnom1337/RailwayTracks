using Domain.Entities;
using Infrastructure.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Reflection.Emit;
using System.Text;

namespace Infrastructure.DAL
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DbSet<Defect> Defects { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<RepairTeam> RepairTeams { get; set; }
        public DbSet<Inspector> Inspectors { get; set; }
        public DbSet<DefectType> DefectTypes { get; set; }
        public DbSet<DataSource> DataSources { get; set; }
        public DbSet<DefectStatusHistory> DefectStatusHistories { get; set; }

        public DbSet<TrackSegment> TrackSegments { get; set; }

        public DbSet<TrackPoint> TrackPoints { get; set; }

        public DbSet<TrackSensor> TrackSensors { get; set; }
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options,
            IHttpContextAccessor httpContextAccessor)
            : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Location>(entity =>
            {
                entity.Property(x => x.Latitude).HasPrecision(9, 6);
                entity.Property(x => x.Longitude).HasPrecision(9, 6);
            });

            builder.ApplyConfigurationsFromAssembly(
                typeof(ApplicationDbContext).Assembly);
        }

        public override int SaveChanges()
        {
            UpdateAuditFields();

            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(
            CancellationToken cancellationToken = default)
        {
            UpdateAuditFields();

            return base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateAuditFields()
        {
            var userName =
                _httpContextAccessor.HttpContext?.User?.Identity?.Name
                ?? "System";

            var now = DateTime.UtcNow;

            foreach (var entry in ChangeTracker.Entries<BaseAuditEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreatedAt = now;
                        entry.Entity.CreatedBy = userName;

                        entry.Entity.ModifiedAt = now;
                        entry.Entity.ModifiedBy = userName;
                        break;

                    case EntityState.Modified:
                        entry.Entity.ModifiedAt = now;
                        entry.Entity.ModifiedBy = userName;

                        // Не позволяем изменять данные создания
                        entry.Property(x => x.CreatedAt).IsModified = false;
                        entry.Property(x => x.CreatedBy).IsModified = false;
                        break;
                }
            }
        }
    }
}

