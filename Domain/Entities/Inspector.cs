using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class Inspector : BaseAuditEntity
    {
        public InspectorType InspectorType { get; set; }

        public Guid? EmployeeId { get; set; }

        public string? FullName { get; set; }

        public string? SensorSerial { get; set; }

        public List<Defect> Defects { get; set; } = [];
    }
}
