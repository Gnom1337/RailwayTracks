using Application.Abstractions;
using Application.TrackPoint.DTOs;
using Application.TrackSegment.DTOs;
using Application.TrackSensor.DTOs;
using Domain.Entities;
using Infrastructure.DAL;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services
{
    public class TrackSchemeService : ITrackSchemeService
    {
        private readonly ApplicationDbContext _context;

        public TrackSchemeService(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<TrackSegmentDto>>
            GetSegmentsAsync(
                CancellationToken cancellationToken)
        {
            return await _context.TrackSegments
                .AsNoTracking()
                .Include(x => x.Points)
                .OrderBy(x => x.Name)
                .Select(x => new TrackSegmentDto(
                    x.Id,
                    x.Name,
                    x.StartKm,
                    x.EndKm,
                    x.Points
                        .OrderBy(p => p.Order)
                        .Select(p => new TrackPointDto(
                            p.Id,
                            p.Order,
                            p.X,
                            p.Y))
                        .ToList()))
                .ToListAsync(cancellationToken);
        }

        public async Task<TrackSegmentDto?>
            GetSegmentAsync(
                Guid id,
                CancellationToken cancellationToken)
        {
            return await _context.TrackSegments
                .AsNoTracking()
                .Include(x => x.Points)
                .Where(x => x.Id == id)
                .Select(x => new TrackSegmentDto(
                    x.Id,
                    x.Name,
                    x.StartKm,
                    x.EndKm,
                    x.Points
                        .OrderBy(p => p.Order)
                        .Select(p => new TrackPointDto(
                            p.Id,
                            p.Order,
                            p.X,
                            p.Y))
                        .ToList()))
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<TrackSegmentDto>
            CreateSegmentAsync(
                CreateTrackSegmentDto request,
                CancellationToken cancellationToken)
        {
            ValidateSegment(request.Name, request.StartKm, request.EndKm, request.Points);

            var segment = new TrackSegment
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                StartKm = request.StartKm,
                EndKm = request.EndKm
            };

            segment.Points = request.Points
                .OrderBy(x => x.Order)
                .Select(x => new TrackPoint
                {
                    Id = Guid.NewGuid(),
                    TrackSegmentId = segment.Id,
                    Order = x.Order,
                    X = x.X,
                    Y = x.Y
                })
                .ToList();

            _context.TrackSegments.Add(segment);

            await _context.SaveChangesAsync(
                cancellationToken);

            return ToDto(segment);
        }

        public async Task<TrackSegmentDto>
            UpdateSegmentAsync(
                Guid id,
                UpdateTrackSegmentDto request,
                CancellationToken cancellationToken)
        {
            ValidateSegment(
                request.Name,
                request.StartKm,
                request.EndKm,
                request.Points);

            var segment = await _context.TrackSegments
                .Include(x => x.Points)
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (segment is null)
                throw new KeyNotFoundException(
                    "Участок пути не найден.");

            segment.Name = request.Name.Trim();
            segment.StartKm = request.StartKm;
            segment.EndKm = request.EndKm;

            _context.TrackPoints.RemoveRange(
                segment.Points);

            segment.Points = request.Points
                .OrderBy(x => x.Order)
                .Select(x => new TrackPoint
                {
                    Id = Guid.NewGuid(),
                    TrackSegmentId = segment.Id,
                    Order = x.Order,
                    X = x.X,
                    Y = x.Y
                })
                .ToList();

            await _context.SaveChangesAsync(
                cancellationToken);

            return ToDto(segment);
        }

        public async Task DeleteSegmentAsync(
            Guid id,
            CancellationToken cancellationToken)
        {
            var segment = await _context.TrackSegments
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (segment is null)
                throw new KeyNotFoundException(
                    "Участок пути не найден.");

            var hasLocations = await _context.Locations
                .AnyAsync(
                    x => x.TrackSegmentId == id,
                    cancellationToken);

            if (hasLocations)
            {
                throw new InvalidOperationException(
                    "Нельзя удалить участок, к которому привязаны локации.");
            }

            _context.TrackSegments.Remove(segment);

            await _context.SaveChangesAsync(
                cancellationToken);
        }

        public async Task<IReadOnlyList<TrackSensorDto>>
            GetSensorsAsync(
                CancellationToken cancellationToken)
        {
            return await _context.TrackSensors
                .AsNoTracking()
                .OrderBy(x => x.Name)
                .Select(x => new TrackSensorDto(
                    x.Id,
                    x.Name,
                    x.Serial,
                    x.TrackSegmentId,
                    x.X,
                    x.Y, x.PositionKm))
                .ToListAsync(cancellationToken);
        }

        public async Task<TrackSensorDto> CreateSensorAsync(
    CreateTrackSensorDto request,
    CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                throw new ArgumentException(
                    "Введите название датчика.");

            if (string.IsNullOrWhiteSpace(request.Serial))
                throw new ArgumentException(
                    "Введите серийный номер.");

            var segment =
                await FindNearestSegmentAsync(
                    request.X,
                    request.Y,
                    cancellationToken);

            var sensor = new TrackSensor
            {
                Id = Guid.NewGuid(),

                Name = request.Name.Trim(),

                Serial = request.Serial.Trim(),

                TrackSegmentId = segment.Id,

                X = request.X,

                Y = request.Y
            };

            _context.TrackSensors.Add(sensor);

            await _context.SaveChangesAsync(
                cancellationToken);

            return new TrackSensorDto(
                sensor.Id,
                sensor.Name,
                sensor.Serial,
                sensor.TrackSegmentId,
                sensor.X,
                sensor.Y,
                sensor.PositionKm);
        }

        public async Task<TrackSensorDto>
            UpdateSensorAsync(
                Guid id,
                UpdateTrackSensorDto request,
                CancellationToken cancellationToken)
        {
            var sensor = await _context.TrackSensors
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (sensor is null)
                throw new KeyNotFoundException(
                    "Датчик не найден.");

            var segmentExists =
                await _context.TrackSegments.AnyAsync(
                    x => x.Id == request.TrackSegmentId,
                    cancellationToken);

            if (!segmentExists)
                throw new KeyNotFoundException(
                    "Участок пути не найден.");

            sensor.Name = request.Name.Trim();
            sensor.Serial = request.Serial.Trim();
            sensor.TrackSegmentId = request.TrackSegmentId;
            sensor.X = request.X;
            sensor.Y = request.Y;
            sensor.PositionKm = request.PositionKm;

            await _context.SaveChangesAsync(
                cancellationToken);

            return new TrackSensorDto(
                sensor.Id,
                sensor.Name,
                sensor.Serial,
                sensor.TrackSegmentId,
                sensor.X,
                sensor.Y, sensor.PositionKm);
        }

        public async Task DeleteSensorAsync(
            Guid id,
            CancellationToken cancellationToken)
        {
            var sensor = await _context.TrackSensors
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (sensor is null)
                throw new KeyNotFoundException(
                    "Датчик не найден.");

            _context.TrackSensors.Remove(sensor);

            await _context.SaveChangesAsync(
                cancellationToken);
        }

        private static void ValidateSegment(
            string name,
            double startKm,
            double endKm,
            IReadOnlyCollection<CreateTrackPointRequest> points)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException(
                    "Укажите название участка.");

            if (startKm > endKm)
                throw new ArgumentException(
                    "Начальный километр не может быть больше конечного.");

            if (points.Count < 2)
                throw new ArgumentException(
                    "Участок должен содержать минимум две точки.");

            if (points.GroupBy(x => x.Order)
                .Any(x => x.Count() > 1))
            {
                throw new ArgumentException(
                    "Точки участка имеют повторяющийся Order.");
            }
        }

        private static TrackSegmentDto ToDto(
            TrackSegment segment)
        {
            return new TrackSegmentDto(
                segment.Id,
                segment.Name,
                segment.StartKm,
                segment.EndKm,
                segment.Points
                    .OrderBy(x => x.Order)
                    .Select(x => new TrackPointDto(
                        x.Id,
                        x.Order,
                        x.X,
                        x.Y))
                    .ToList());
        }
        private async Task<TrackSegment> FindNearestSegmentAsync(
    double x,
    double y,
    CancellationToken cancellationToken)
        {
            var segments = await _context.TrackSegments
                .Include(x => x.Points)
                .ToListAsync(cancellationToken);

            TrackSegment? nearestSegment = null;
            double nearestDistance = double.MaxValue;

            foreach (var segment in segments)
            {
                var points = segment.Points
                    .OrderBy(x => x.Order)
                    .ToList();

                for (var i = 0; i < points.Count - 1; i++)
                {
                    var distance = DistanceToSegment(
                        x,
                        y,
                        points[i].X,
                        points[i].Y,
                        points[i + 1].X,
                        points[i + 1].Y);

                    if (distance < nearestDistance)
                    {
                        nearestDistance = distance;
                        nearestSegment = segment;
                    }
                }
            }

            if (nearestSegment is null)
                throw new KeyNotFoundException(
                    "Не найден участок пути.");

            if (nearestDistance > 30)
                throw new InvalidOperationException(
                    "Датчик должен находиться рядом с путем.");

            return nearestSegment;
        }
        private static double DistanceToSegment(
    double px,
    double py,
    double x1,
    double y1,
    double x2,
    double y2)
        {
            var dx = x2 - x1;
            var dy = y2 - y1;

            if (dx == 0 && dy == 0)
            {
                return Math.Sqrt(
                    Math.Pow(px - x1, 2) +
                    Math.Pow(py - y1, 2));
            }

            var t =
                ((px - x1) * dx +
                 (py - y1) * dy) /
                (dx * dx + dy * dy);

            t = Math.Max(0, Math.Min(1, t));

            var closestX = x1 + t * dx;
            var closestY = y1 + t * dy;

            return Math.Sqrt(
                Math.Pow(px - closestX, 2) +
                Math.Pow(py - closestY, 2));
        }
       
    }
}
