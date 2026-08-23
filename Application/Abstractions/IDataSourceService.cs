using Application.DataSource.DTOs;
using Application.DataSource.Requests;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Abstractions
{
    public interface IDataSourceService
    {
        Task<IReadOnlyList<DataSourceDto>> GetAllAsync(
            CancellationToken cancellationToken);

        Task<DataSourceDto?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken);

        Task<DataSourceDto> CreateAsync(
            CreateDataSourceRequest request,
            CancellationToken cancellationToken);

        Task<bool> UpdateAsync(
            Guid id,
            UpdateDataSourceRequest request,
            CancellationToken cancellationToken);

        Task<bool> DeleteAsync(
            Guid id,
            CancellationToken cancellationToken);
    }
}
