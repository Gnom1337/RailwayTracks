using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class TrackSensor : BaseAuditEntity
    {
        public string Name { get; set; } = null!;

        public string Serial { get; set; } = null!;

        public Guid TrackSegmentId { get; set; }

        public TrackSegment TrackSegment { get; set; } = null!;

        public double X { get; set; }

        public double Y { get; set; }
        public double PositionKm { get; set; }
    }
}
