using System;
using System.Collections.Generic;
using System.Text;

namespace Application.TrackSensor.DTOs
{
    public record CreateTrackSensorDto(
    string Name,
    string Serial,
    Guid TrackSegmentId,
    double X,
    double Y,
    double PositionKm);
}
