using Application.DefectType.DTOs;
using Application.DefectType.Requests;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Abstractions
{
    public interface IDefectTypeService
    {
        Task<IReadOnlyList<DefectTypeDto>> GetAllAsync(
            CancellationToken cancellationToken);

        Task<DefectTypeDto?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken);

        Task<DefectTypeDto> CreateAsync(
            CreateDefectTypeRequest request,
            CancellationToken cancellationToken);

        Task<bool> UpdateAsync(
            Guid id,
            UpdateDefectTypeRequest request,
            CancellationToken cancellationToken);

        Task<bool> DeleteAsync(
            Guid id,
            CancellationToken cancellationToken);
    }
}
