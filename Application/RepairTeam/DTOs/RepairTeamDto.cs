using System;
using System.Collections.Generic;
using System.Text;

namespace Application.RepairTeam.DTOs
{
    public record RepairTeamDto(
    Guid Id,
    string Name,
    string Contact,
    bool Contractor);
}
