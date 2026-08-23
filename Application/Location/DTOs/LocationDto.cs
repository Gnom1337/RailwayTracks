using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Location.DTOs
{
    public record LocationDto(
    Guid Id,
    Guid TrackSegmentId,
    string RailwaySection,
    string SubDivision,
    double Kilometer,
    double Picket,
    decimal Latitude,
    decimal Longitude);
}
