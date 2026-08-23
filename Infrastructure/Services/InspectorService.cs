using Application.Abstractions;
using Application.Inspectors.DTOs;
using Application.Inspectors.Requests;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.DAL;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services
{
    internal class InspectorService : IInspectorService
    {
        private readonly ApplicationDbContext _context;

        public InspectorService(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<IReadOnlyList<InspectorDto>> GetAllAsync(
        CancellationToken cancellationToken = default)
        {
            return await _context.Inspectors
                .AsNoTracking()
                .Select(x => new InspectorDto(
                    x.Id,
                    x.InspectorType,
                    x.EmployeeId,
                    x.FullName,
                    x.SensorSerial))
                .ToListAsync(cancellationToken);
        }

        public async Task<InspectorDto?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            return await _context.Inspectors
                .AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new InspectorDto(
                    x.Id,
                    x.InspectorType,
                    x.EmployeeId,
                    x.FullName,
                    x.SensorSerial))
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<InspectorDto> CreateAsync(
            CreateInspectorRequest request,
            CancellationToken cancellationToken = default)
        {
            Validate(request);

            var inspector = new Inspector
            {
                Id = Guid.NewGuid(),
                InspectorType = request.InspectorType,
                EmployeeId = request.EmployeeId,
                FullName = request.FullName,
                SensorSerial = request.SensorSerial
            };

            _context.Inspectors.Add(inspector);

            await _context.SaveChangesAsync(cancellationToken);

            return Map(inspector);
        }

        public async Task<bool> UpdateAsync(
            Guid id,
            UpdateInspectorRequest request,
            CancellationToken cancellationToken = default)
        {
            Validate(request);

            var inspector = await _context.Inspectors
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (inspector == null)
                return false;

            inspector.InspectorType = request.InspectorType;
            inspector.EmployeeId = request.EmployeeId;
            inspector.FullName = request.FullName;
            inspector.SensorSerial = request.SensorSerial;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<bool> DeleteAsync(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            var inspector = await _context.Inspectors
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (inspector == null)
                return false;

            var hasDefects = await _context.Defects
                .AnyAsync(
                    x => x.DetectedById == id,
                    cancellationToken);

            if (hasDefects)
            {
                throw new InvalidOperationException(
                    "Inspector cannot be deleted because it is used by defects.");
            }

            _context.Inspectors.Remove(inspector);

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }

        private static InspectorDto Map(Inspector inspector)
        {
            return new InspectorDto(
                inspector.Id,
                inspector.InspectorType,
                inspector.EmployeeId,
                inspector.FullName,
                inspector.SensorSerial);
        }

        private static void Validate(
            CreateInspectorRequest request)
        {
            if (request.InspectorType == InspectorType.Worker &&
                request.EmployeeId == Guid.Empty)
            {
                throw new ArgumentException(
                    "EmployeeId is required for Worker inspector.");
            }

            if (request.InspectorType == InspectorType.Sensor &&
                string.IsNullOrWhiteSpace(request.SensorSerial))
            {
                throw new ArgumentException(
                    "SensorSerial is required for Sensor inspector.");
            }

            if (request.InspectorType == InspectorType.System)
            {
                if (string.IsNullOrWhiteSpace(request.FullName))
                {
                    throw new ArgumentException(
                        "FullName is required for System inspector.");
                }
            }
        }

        private static void Validate(
            UpdateInspectorRequest request)
        {
            if (request.InspectorType == InspectorType.Worker &&
                request.EmployeeId == Guid.Empty)
            {
                throw new ArgumentException(
                    "EmployeeId is required for Worker inspector.");
            }

            if (request.InspectorType == InspectorType.Sensor &&
                string.IsNullOrWhiteSpace(request.SensorSerial))
            {
                throw new ArgumentException(
                    "SensorSerial is required for Sensor inspector.");
            }

            if (request.InspectorType == InspectorType.System &&
                string.IsNullOrWhiteSpace(request.FullName))
            {
                throw new ArgumentException(
                    "FullName is required for System inspector.");
            }
        }
    }
}
