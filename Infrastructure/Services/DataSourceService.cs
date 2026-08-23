using Application.Abstractions;
using Application.DataSource.DTOs;
using Application.DataSource.Requests;
using Domain.Entities;
using Infrastructure.DAL;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services
{
    public class DataSourceService : IDataSourceService
    {
        private readonly ApplicationDbContext _context;

        public DataSourceService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<DataSourceDto>> GetAllAsync(
            CancellationToken cancellationToken)
        {
            return await _context.DataSources
                .AsNoTracking()
                .Select(x => new DataSourceDto(
                    x.Id,
                    x.Name))
                .ToListAsync(cancellationToken);
        }

        public async Task<DataSourceDto?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken)
        {
            return await _context.DataSources
                .AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new DataSourceDto(
                    x.Id,
                    x.Name))
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<DataSourceDto> CreateAsync(
            CreateDataSourceRequest request,
            CancellationToken cancellationToken)
        {
            var entity = new DataSource
            {
                Id = Guid.NewGuid(),
                Name = request.Name
            };

            _context.DataSources.Add(entity);

            await _context.SaveChangesAsync(cancellationToken);

            return new DataSourceDto(
                entity.Id,
                entity.Name);
        }

        public async Task<bool> UpdateAsync(
            Guid id,
            UpdateDataSourceRequest request,
            CancellationToken cancellationToken)
        {
            var entity = await _context.DataSources
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (entity == null)
                return false;

            entity.Name = request.Name;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<bool> DeleteAsync(
            Guid id,
            CancellationToken cancellationToken)
        {
            var entity = await _context.DataSources
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (entity == null)
                return false;

            _context.DataSources.Remove(entity);

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
