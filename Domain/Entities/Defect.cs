using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class Defect : BaseEntity
    {
        public Guid DefectTypeId { get; set; }
        public DefectType DefectType { get; set; } = null!;
        public Guid LocationId { get; set; }
        public Location Location { get; set; } = null!;
        public DateTimeOffset DetectedAt {  get; set; }
        public Guid DatectedById { get; set; }
        public Saverity Saverity { get; set; }
        public string? Description { get; set; }
        public Status Status { get; set; }
        public DateTimeOffset PlannedRepairDate { get; set; }
        public RepairTeam RepairTeam { get; set; } = null!;
        public RecommendationType RecommendationType { get; set; }
        public SourceType SourceType { get; set; }
        public List<DefectStatusHistory>? DefectStatusHistories { get; set; }


    }
}
