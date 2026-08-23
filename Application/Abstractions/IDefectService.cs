using Application.Defect.DTOs;
using Application.Defect.Requests;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Abstractions
{
    public interface IDefectService
    {
        Task<IReadOnlyList<DefectDto>> GetAllAsync(
            CancellationToken cancellationToken = default);

        Task<DefectDto?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        Task<DefectDto> CreateAsync(
            CreateDefectRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> UpdateAsync(
            Guid id,
            UpdateDefectRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> DeleteAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        Task<bool> ChangeStatusAsync(
            Guid id,
            ChangeDefectStatusRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> AssignRepairTeamAsync(
            Guid id,
            AssignRepairTeamRequest request,
            CancellationToken cancellationToken = default);
    }
}
