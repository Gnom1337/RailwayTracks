using Application.Abstractions;
using Application.Common.Security;
using Application.Defect.DTOs;
using Application.Defect.Requests;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.DAL;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services
{
    public class DefectService : IDefectService
    {
        private readonly ApplicationDbContext _context;

        public DefectService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<DefectDto>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            return await _context.Defects
                .AsNoTracking()
                .Select(x => new DefectDto(
                    x.Id,
                    x.DefectTypeId,
                    x.LocationId,
                    x.DetectedAt,
                    x.DetectedById,
                    x.Saverity,
                    x.Description,
                    x.Status,
                    x.PlannedRepairDate,
                    x.RepairTeamId,
                    x.RecommendationType,
                    x.SourceType))
                .ToListAsync(cancellationToken);
        }

        public async Task<DefectDto?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            return await _context.Defects
                .AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new DefectDto(
                    x.Id,
                    x.DefectTypeId,
                    x.LocationId,
                    x.DetectedAt,
                    x.DetectedById,
                    x.Saverity,
                    x.Description,
                    x.Status,
                    x.PlannedRepairDate,
                    x.RepairTeamId,
                    x.RecommendationType,
                    x.SourceType))
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<DefectDto> CreateAsync(
            CreateDefectRequest request,
            CancellationToken cancellationToken = default)
        {
            await ValidateReferencesAsync(
                request.DefectTypeId,
                request.LocationId,
                request.DetectedById,
                cancellationToken);

            var defect = new Defect
            {
                Id = Guid.NewGuid(),

                DefectTypeId = request.DefectTypeId,
                LocationId = request.LocationId,

                DetectedAt = request.DetectedAt,
                DetectedById = request.DetectedById,

                Saverity = request.Saverity,
                Description = request.Description,

                // Новый дефект получает начальный статус.
                Status = Status.New,

                PlannedRepairDate =
                    request.PlannedRepairDate,

                RecommendationType =
                    request.RecommendationType,

                SourceType =
                    request.SourceType
            };

            _context.Defects.Add(defect);

            await _context.SaveChangesAsync(
                cancellationToken);

            return Map(defect);
        }

        public async Task<bool> UpdateAsync(
            Guid id,
            UpdateDefectRequest request,
            CancellationToken cancellationToken = default)
        {
            var defect = await _context.Defects
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (defect == null)
                return false;

            await ValidateReferencesAsync(
                request.DefectTypeId,
                request.LocationId,
                request.DetectedById,
                cancellationToken);

            defect.DefectTypeId =
                request.DefectTypeId;

            defect.LocationId =
                request.LocationId;

            defect.DetectedAt =
                request.DetectedAt;

            defect.DetectedById =
                request.DetectedById;

            defect.Saverity =
                request.Saverity;

            defect.Description =
                request.Description;

            defect.PlannedRepairDate =
                request.PlannedRepairDate;

            defect.RecommendationType =
                request.RecommendationType;

            defect.SourceType =
                request.SourceType;

            await _context.SaveChangesAsync(
                cancellationToken);

            return true;
        }

        public async Task<bool> DeleteAsync(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            var defect = await _context.Defects
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (defect == null)
                return false;

            _context.Defects.Remove(defect);

            await _context.SaveChangesAsync(
                cancellationToken);

            return true;
        }

        public async Task<bool> ChangeStatusAsync(
            Guid id,
            ChangeDefectStatusRequest request,
            CancellationToken cancellationToken = default)
        {
            var defect = await _context.Defects
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (defect == null)
                return false;

            // Нечего записывать в историю,
            // если статус фактически не изменился.
            if (defect.Status == request.NewStatus)
                return true;

            var oldStatus = defect.Status;

            defect.Status = request.NewStatus;

            var history = new DefectStatusHistory
            {
                Id = Guid.NewGuid(),

                DefectId = defect.Id,

                OldStatus = oldStatus,
                NewStatus = request.NewStatus,

                Comment = request.Comment
            };

            _context.DefectStatusHistories.Add(history);

            await _context.SaveChangesAsync(
                cancellationToken);

            return true;
        }

        public async Task<bool> AssignRepairTeamAsync(
            Guid id,
            AssignRepairTeamRequest request,
            CancellationToken cancellationToken = default)
        {
            var defect = await _context.Defects
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (defect == null)
                return false;

            if (request.RepairTeamId.HasValue)
            {
                var repairTeamExists =
                    await _context.RepairTeams
                        .AnyAsync(
                            x => x.Id ==
                                request.RepairTeamId.Value,
                            cancellationToken);

                if (!repairTeamExists)
                {
                    throw new KeyNotFoundException(
                        "Repair team was not found.");
                }
            }

            defect.RepairTeamId =
                request.RepairTeamId;

            await _context.SaveChangesAsync(
                cancellationToken);

            return true;
        }

        private async Task ValidateReferencesAsync(
            Guid defectTypeId,
            Guid locationId,
            Guid detectedById,
            CancellationToken cancellationToken)
        {
            var defectTypeExists =
                await _context.DefectTypes
                    .AnyAsync(
                        x => x.Id == defectTypeId,
                        cancellationToken);

            if (!defectTypeExists)
            {
                throw new KeyNotFoundException(
                    "Defect type was not found.");
            }

            var locationExists =
                await _context.Locations
                    .AnyAsync(
                        x => x.Id == locationId,
                        cancellationToken);

            if (!locationExists)
            {
                throw new KeyNotFoundException(
                    "Location was not found.");
            }

            var inspectorExists =
                await _context.Inspectors
                    .AnyAsync(
                        x => x.Id == detectedById,
                        cancellationToken);

            if (!inspectorExists)
            {
                throw new KeyNotFoundException(
                    "Inspector was not found.");
            }
        }

        private static DefectDto Map(Defect defect)
        {
            return new DefectDto(
                defect.Id,
                defect.DefectTypeId,
                defect.LocationId,
                defect.DetectedAt,
                defect.DetectedById,
                defect.Saverity,
                defect.Description,
                defect.Status,
                defect.PlannedRepairDate,
                defect.RepairTeamId,
                defect.RecommendationType,
                defect.SourceType);
        }
    }
}
