using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Defect.Requests
{
    public record AssignRepairTeamRequest(
    Guid? RepairTeamId);
}
