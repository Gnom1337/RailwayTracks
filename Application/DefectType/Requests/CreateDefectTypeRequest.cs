using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DefectType.Requests
{
    public record CreateDefectTypeRequest(
    string Name,
    string? Description);
}
