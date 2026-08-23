using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class TrackSegment : BaseAuditEntity
    {
        public string Name { get; set; } = null!;

        public double StartKm { get; set; }
        public double EndKm { get; set; }

        public List<TrackPoint> Points { get; set; } = [];

        public List<Location> Locations { get; set; } = [];
        public List<TrackSensor> Sensors { get; set; } = [];
    }
}
