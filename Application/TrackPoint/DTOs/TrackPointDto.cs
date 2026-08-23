using System;
using System.Collections.Generic;
using System.Text;

namespace Application.TrackPoint.DTOs
{
    public record TrackPointDto(
    Guid Id,
    int Order,
    double X,
    double Y);
}
