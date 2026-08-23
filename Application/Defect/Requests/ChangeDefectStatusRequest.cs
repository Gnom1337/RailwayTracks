using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Defect.Requests
{
    public record ChangeDefectStatusRequest(
    Status NewStatus,
    string? Comment);
}
