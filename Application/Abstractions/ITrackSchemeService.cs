using Application.TrackSegment.DTOs;
using Application.TrackSensor.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Abstractions
{
    public interface ITrackSchemeService
    {
        Task<IReadOnlyList<TrackSegmentDto>>
            GetSegmentsAsync(
                CancellationToken cancellationToken);

        Task<TrackSegmentDto?>
            GetSegmentAsync(
                Guid id,
                CancellationToken cancellationToken);

        Task<TrackSegmentDto>
            CreateSegmentAsync(
                CreateTrackSegmentDto request,
                CancellationToken cancellationToken);

        Task<TrackSegmentDto>
            UpdateSegmentAsync(
                Guid id,
                UpdateTrackSegmentDto request,
                CancellationToken cancellationToken);

        Task DeleteSegmentAsync(
            Guid id,
            CancellationToken cancellationToken);

        Task<IReadOnlyList<TrackSensorDto>>
            GetSensorsAsync(
                CancellationToken cancellationToken);

        Task<TrackSensorDto>
            CreateSensorAsync(
                CreateTrackSensorDto request,
                CancellationToken cancellationToken);

        Task<TrackSensorDto>
            UpdateSensorAsync(
                Guid id,
                UpdateTrackSensorDto request,
                CancellationToken cancellationToken);

        Task DeleteSensorAsync(
            Guid id,
            CancellationToken cancellationToken);
    }
}
