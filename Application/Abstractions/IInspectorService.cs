using Application.Inspectors.DTOs;
using Application.Inspectors.Requests;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Abstractions
{
    public interface IInspectorService
    {
        Task<IReadOnlyList<InspectorDto>> GetAllAsync(
            CancellationToken cancellationToken = default);

        Task<InspectorDto?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        Task<InspectorDto> CreateAsync(
            CreateInspectorRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> UpdateAsync(
            Guid id,
            UpdateInspectorRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> DeleteAsync(
            Guid id,
            CancellationToken cancellationToken = default);
    }
}
