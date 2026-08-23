using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Inspectors.Requests
{
    public record UpdateInspectorRequest(
    InspectorType InspectorType,
    Guid? EmployeeId,
    string? FullName,
    string? SensorSerial);
}
