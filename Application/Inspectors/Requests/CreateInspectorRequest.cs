using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Inspectors.Requests
{
    public record CreateInspectorRequest(
    InspectorType InspectorType,
    Guid? EmployeeId,
    string? FullName,
    string? SensorSerial);
}
