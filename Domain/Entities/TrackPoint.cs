using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class TrackPoint : BaseEntity
    {
        public Guid TrackSegmentId { get; set; }

        public TrackSegment TrackSegment { get; set; } = null!;

        public int Order { get; set; }

        public double X { get; set; }
        public double Y { get; set; }
    }
}
