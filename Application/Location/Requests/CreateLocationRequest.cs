using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Location.Requests
{
    public record CreateLocationRequest(
    Guid TrackSegmentId,
    string RailwaySection,
    string SubDivision,
    double Kilometer,
    double Picket,
    decimal Latitude,
    decimal Longitude);
}
