using Application.DefectStatusHistory.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Abstractions
{
    public interface IDefectStatusHistoryService
    {
        Task<IReadOnlyList<DefectStatusHistoryDto>> GetAllAsync(
            CancellationToken cancellationToken);

        Task<IReadOnlyList<DefectStatusHistoryDto>> GetByDefectIdAsync(
            Guid defectId,
            CancellationToken cancellationToken);

        Task<DefectStatusHistoryDto?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken);
    }
}
