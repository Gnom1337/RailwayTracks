using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class Location : BaseAuditEntity
    {
        public Guid TrackSegmentId { get; set; }

        public TrackSegment TrackSegment { get; set; } = null!;

        public string RailwaySection { get; set; } = null!;

        public string SubDivision { get; set; } = null!;

        public double Kilometer { get; set; }

        public double Picket { get; set; }

        public decimal Latitude { get; set; }

        public decimal Longitude { get; set; }

        public List<Defect> Defects { get; set; } = [];
    }
}
