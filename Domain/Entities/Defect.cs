using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class Defect : BaseAuditEntity
    {
        public Guid DefectTypeId { get; set; }
        public DefectType DefectType { get; set; } = null!;

        public Guid LocationId { get; set; }
        public Location Location { get; set; } = null!;

        public Guid? TrackSensorId { get; set; }
        public TrackSensor? TrackSensor { get; set; }

        public DateTimeOffset DetectedAt { get; set; }

        public Guid DetectedById { get; set; }
        public Inspector DetectedBy { get; set; } = null!;

        public Saverity Saverity { get; set; }

        public string? Description { get; set; }

        public Status Status { get; set; }

        public DateTimeOffset? PlannedRepairDate { get; set; }

        public Guid? RepairTeamId { get; set; }
        public RepairTeam? RepairTeam { get; set; }

        public RecommendationType RecommendationType { get; set; }

        public SourceType SourceType { get; set; }

        public List<DefectStatusHistory> DefectStatusHistories { get; set; } = [];
    }
}
