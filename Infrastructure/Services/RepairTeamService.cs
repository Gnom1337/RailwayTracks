using Application.Abstractions;
using Application.RepairTeam.DTOs;
using Application.RepairTeam.Requests;
using Domain.Entities;
using Infrastructure.DAL;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services
{
    public class RepairTeamService : IRepairTeamService
    {
        private readonly ApplicationDbContext _context;

        public RepairTeamService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<RepairTeamDto>> GetAllAsync(
            CancellationToken cancellationToken)
        {
            return await _context.RepairTeams
                .AsNoTracking()
                .Select(x => new RepairTeamDto(
                    x.Id,
                    x.Name,
                    x.Contact,
                    x.Contractor))
                .ToListAsync(cancellationToken);
        }

        public async Task<RepairTeamDto?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken)
        {
            return await _context.RepairTeams
                .AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new RepairTeamDto(
                    x.Id,
                    x.Name,
                    x.Contact,
                    x.Contractor))
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<RepairTeamDto> CreateAsync(
            CreateRepairTeamRequest request,
            CancellationToken cancellationToken)
        {
            var entity = new RepairTeam
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Contact = request.Contact,
                Contractor = request.Contractor
            };

            _context.RepairTeams.Add(entity);

            await _context.SaveChangesAsync(cancellationToken);

            return new RepairTeamDto(
                entity.Id,
                entity.Name,
                entity.Contact,
                entity.Contractor);
        }

        public async Task<bool> UpdateAsync(
            Guid id,
            UpdateRepairTeamRequest request,
            CancellationToken cancellationToken)
        {
            var entity = await _context.RepairTeams
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (entity == null)
                return false;

            entity.Name = request.Name;
            entity.Contact = request.Contact;
            entity.Contractor = request.Contractor;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<bool> DeleteAsync(
            Guid id,
            CancellationToken cancellationToken)
        {
            var entity = await _context.RepairTeams
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (entity == null)
                return false;

            _context.RepairTeams.Remove(entity);

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
