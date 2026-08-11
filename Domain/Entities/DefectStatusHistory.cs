using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class DefectStatusHistory : BaseEntity
    {
        public Guid DefectId { get; set; }
        public Defect Defect { get; set; } = null!;
        public Status OldStatus { get; set; }
        public Status NewStatus { get; set; }
        public string? Comment { get; set; }
    }
}
