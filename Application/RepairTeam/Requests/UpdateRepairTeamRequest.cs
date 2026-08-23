using System;
using System.Collections.Generic;
using System.Text;

namespace Application.RepairTeam.Requests
{
    public record UpdateRepairTeamRequest(
    string Name,
    string Contact,
    bool Contractor);
}
