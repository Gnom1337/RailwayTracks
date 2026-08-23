using System;
using System.Collections.Generic;
using System.Text;

namespace Application.RepairTeam.Requests
{
    public record CreateRepairTeamRequest(
    string Name,
    string Contact,
    bool Contractor);
}
