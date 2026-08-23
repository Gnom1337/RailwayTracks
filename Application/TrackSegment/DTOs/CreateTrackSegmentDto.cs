using Application.TrackPoint.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.TrackSegment.DTOs
{
    public record CreateTrackSegmentDto(
     string Name,
     double StartKm,
     double EndKm,
     IReadOnlyCollection<CreateTrackPointRequest> Points);
}
