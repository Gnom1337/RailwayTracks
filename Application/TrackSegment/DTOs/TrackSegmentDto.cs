using Application.TrackPoint.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.TrackSegment.DTOs
{
    public record TrackSegmentDto(
    Guid Id,
    string Name,
    double StartKm,
    double EndKm,
    IReadOnlyCollection<TrackPointDto> Points);
}
