using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Location.Requests
{
    public record UpdateLocationRequest(
    Guid TrackSegmentId,
    string RailwaySection,
    string SubDivision,
    double Kilometer,
    double Picket,
    decimal Latitude,
    decimal Longitude);
}
