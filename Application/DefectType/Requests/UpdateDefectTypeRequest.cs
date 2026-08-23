using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DefectType.Requests
{
    public record UpdateDefectTypeRequest(
    string Name,
    string? Description);
}
