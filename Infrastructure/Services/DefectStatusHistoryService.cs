using Application.Abstractions;
using Application.DefectStatusHistory.DTOs;
using Infrastructure.DAL;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services
{
    public class DefectStatusHistoryService
    : IDefectStatusHistoryService
    {
        private readonly ApplicationDbContext _context;

        public DefectStatusHistoryService(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<DefectStatusHistoryDto>> GetAllAsync(
            CancellationToken cancellationToken)
        {
            return await _context.DefectStatusHistories
                .AsNoTracking()
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new DefectStatusHistoryDto(
                    x.Id,
                    x.DefectId,
                    x.OldStatus,
                    x.NewStatus,
                    x.Comment,
                    x.CreatedAt,
                    x.CreatedBy))
                .ToListAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<DefectStatusHistoryDto>>
            GetByDefectIdAsync(
                Guid defectId,
                CancellationToken cancellationToken)
        {
            return await _context.DefectStatusHistories
                .AsNoTracking()
                .Where(x => x.DefectId == defectId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new DefectStatusHistoryDto(
                    x.Id,
                    x.DefectId,
                    x.OldStatus,
                    x.NewStatus,
                    x.Comment,
                    x.CreatedAt,
                    x.CreatedBy))
                .ToListAsync(cancellationToken);
        }

        public async Task<DefectStatusHistoryDto?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken)
        {
            return await _context.DefectStatusHistories
                .AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new DefectStatusHistoryDto(
                    x.Id,
                    x.DefectId,
                    x.OldStatus,
                    x.NewStatus,
                    x.Comment,
                    x.CreatedAt,
                    x.CreatedBy))
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}
