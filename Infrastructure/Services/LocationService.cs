using Application.Abstractions;
using Application.Location.DTOs;
using Application.Location.Requests;
using Domain.Entities;
using Infrastructure.DAL;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using static Grpc.Core.Metadata;

namespace Infrastructure.Services
{
    public class LocationService : ILocationService
    {
        private readonly ApplicationDbContext _context;

        public LocationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<LocationDto>> GetAllAsync(
            CancellationToken cancellationToken)
        {
            return await _context.Locations
                .AsNoTracking()
                .Select(x => new LocationDto(
                    x.Id,
                    x.TrackSegmentId,
                    x.RailwaySection,
                    x.SubDivision,
                    x.Kilometer,
                    x.Picket,
                    x.Latitude,
                    x.Longitude))
                .ToListAsync(cancellationToken);
        }

        public async Task<LocationDto?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken)
        {
            return await _context.Locations
                .AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new LocationDto(
                    x.Id,
                    x.TrackSegmentId,
                    x.RailwaySection,
                    x.SubDivision,
                    x.Kilometer,
                    x.Picket,
                    x.Latitude,
                    x.Longitude))
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<LocationDto> CreateAsync(
    CreateLocationRequest request,
    CancellationToken cancellationToken)
        {
            var segmentExists =
                await _context.TrackSegments
                    .AnyAsync(
                        x => x.Id == request.TrackSegmentId,
                        cancellationToken);

            if (!segmentExists)
                throw new KeyNotFoundException(
                    "Участок пути не найден.");

            var location = new Location
            {
                Id = Guid.NewGuid(),

                TrackSegmentId =
                    request.TrackSegmentId,

                RailwaySection =
                    request.RailwaySection.Trim(),

                SubDivision =
                    request.SubDivision.Trim(),

                Kilometer =
                    request.Kilometer,

                Picket =
                    request.Picket,

                Latitude =
                    request.Latitude,

                Longitude =
                    request.Longitude
            };

            _context.Locations.Add(location);

            await _context.SaveChangesAsync(
                cancellationToken);

            return new LocationDto(
                location.Id,
                location.TrackSegmentId,
                location.RailwaySection,
                location.SubDivision,
                location.Kilometer,
                location.Picket,
                location.Latitude,
                location.Longitude);
        }

        public async Task<bool> UpdateAsync(
            Guid id,
            UpdateLocationRequest request,
            CancellationToken cancellationToken)
        {
            var entity = await _context.Locations
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (entity == null)
                return false;

            entity.RailwaySection = request.RailwaySection;
            entity.TrackSegmentId = request.TrackSegmentId;
            entity.SubDivision = request.SubDivision;
            entity.Kilometer = request.Kilometer;
            entity.Picket = request.Picket;
            entity.Latitude = request.Latitude;
            entity.Longitude = request.Longitude;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<bool> DeleteAsync(
            Guid id,
            CancellationToken cancellationToken)
        {
            var entity = await _context.Locations
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (entity == null)
                return false;

            _context.Locations.Remove(entity);

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
