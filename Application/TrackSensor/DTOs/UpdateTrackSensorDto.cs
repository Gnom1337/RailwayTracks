using System;
using System.Collections.Generic;
using System.Text;

namespace Application.TrackSensor.DTOs
{

    public record UpdateTrackSensorDto(
    string Name,
    string Serial,
    Guid TrackSegmentId,
    double X,
    double Y, double PositionKm);
}
