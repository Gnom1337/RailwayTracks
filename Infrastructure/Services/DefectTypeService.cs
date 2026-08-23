using Application.Abstractions;
using Application.DefectType.DTOs;
using Application.DefectType.Requests;
using Domain.Entities;
using Infrastructure.DAL;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services
{
    public class DefectTypeService : IDefectTypeService
    {
        private readonly ApplicationDbContext _context;

        public DefectTypeService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<DefectTypeDto>> GetAllAsync(
            CancellationToken cancellationToken)
        {
            return await _context.DefectTypes
                .AsNoTracking()
                .Select(x => new DefectTypeDto(
                    x.Id,
                    x.Name,
                    x.Description))
                .ToListAsync(cancellationToken);
        }

        public async Task<DefectTypeDto?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken)
        {
            return await _context.DefectTypes
                .AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new DefectTypeDto(
                    x.Id,
                    x.Name,
                    x.Description))
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<DefectTypeDto> CreateAsync(
            CreateDefectTypeRequest request,
            CancellationToken cancellationToken)
        {
            var entity = new DefectType
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description
            };

            _context.DefectTypes.Add(entity);

            await _context.SaveChangesAsync(cancellationToken);

            return new DefectTypeDto(
                entity.Id,
                entity.Name,
                entity.Description);
        }

        public async Task<bool> UpdateAsync(
            Guid id,
            UpdateDefectTypeRequest request,
            CancellationToken cancellationToken)
        {
            var entity = await _context.DefectTypes
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (entity == null)
                return false;

            entity.Name = request.Name;
            entity.Description = request.Description;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<bool> DeleteAsync(
            Guid id,
            CancellationToken cancellationToken)
        {
            var entity = await _context.DefectTypes
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (entity == null)
                return false;

            _context.DefectTypes.Remove(entity);

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
