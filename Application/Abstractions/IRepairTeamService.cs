using Application.RepairTeam.DTOs;
using Application.RepairTeam.Requests;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Abstractions
{
    public interface IRepairTeamService
    {
        Task<IReadOnlyList<RepairTeamDto>> GetAllAsync(
            CancellationToken cancellationToken);

        Task<RepairTeamDto?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken);

        Task<RepairTeamDto> CreateAsync(
            CreateRepairTeamRequest request,
            CancellationToken cancellationToken);

        Task<bool> UpdateAsync(
            Guid id,
            UpdateRepairTeamRequest request,
            CancellationToken cancellationToken);

        Task<bool> DeleteAsync(
            Guid id,
            CancellationToken cancellationToken);
    }
}
