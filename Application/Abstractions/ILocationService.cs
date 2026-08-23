using Application.Location.DTOs;
using Application.Location.Requests;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Abstractions
{
    public interface ILocationService
    {
        Task<IReadOnlyList<LocationDto>> GetAllAsync(
            CancellationToken cancellationToken);

        Task<LocationDto?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken);

        Task<LocationDto> CreateAsync(
            CreateLocationRequest request,
            CancellationToken cancellationToken);

        Task<bool> UpdateAsync(
            Guid id,
            UpdateLocationRequest request,
            CancellationToken cancellationToken);

        Task<bool> DeleteAsync(
            Guid id,
            CancellationToken cancellationToken);
    }
}
