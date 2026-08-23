using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Inspectors.DTOs
{
    public record InspectorDto(
    Guid Id,
    InspectorType InspectorType,
    Guid? EmployeeId,
    string? FullName,
    string? SensorSerial);
}
