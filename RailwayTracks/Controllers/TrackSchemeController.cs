using Application.Abstractions;
using Application.TrackSegment.DTOs;
using Application.TrackSensor.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RailwayTracks.Authorization;
using System.Collections.Concurrent;

namespace RailwayTracks.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = Policies.DefectRead)]
    public class TrackSchemeController : ControllerBase
    {
        private readonly ITrackSchemeService _service;

        public TrackSchemeController(
            ITrackSchemeService service)
        {
            _service = service;
        }

        [HttpGet("segments")]
        public async Task<IActionResult> GetSegments(
            CancellationToken cancellationToken)
        {
            return Ok(
                await _service.GetSegmentsAsync(
                    cancellationToken));
        }

        [HttpGet("segments/{id:guid}")]
        public async Task<IActionResult> GetSegment(
            Guid id,
            CancellationToken cancellationToken)
        {
            var result =
                await _service.GetSegmentAsync(
                    id,
                    cancellationToken);

            return result is null
                ? NotFound()
                : Ok(result);
        }

        [HttpPost("segments")]
        [Authorize(Policy = Policies.AdminOnly)]
        public async Task<IActionResult> CreateSegment(
            CreateTrackSegmentDto request,
            CancellationToken cancellationToken)
        {
            var result =
                await _service.CreateSegmentAsync(
                    request,
                    cancellationToken);

            return CreatedAtAction(
                nameof(GetSegment),
                new { id = result.Id },
                result);
        }

        [HttpPut("segments/{id:guid}")]
        [Authorize(Policy = Policies.AdminOnly)]
        public async Task<IActionResult> UpdateSegment(
            Guid id,
            UpdateTrackSegmentDto request,
            CancellationToken cancellationToken)
        {
            var result =
                await _service.UpdateSegmentAsync(
                    id,
                    request,
                    cancellationToken);

            return Ok(result);
        }

        [HttpDelete("segments/{id:guid}")]
        [Authorize(Policy = Policies.AdminOnly)]
        public async Task<IActionResult> DeleteSegment(
            Guid id,
            CancellationToken cancellationToken)
        {
            await _service.DeleteSegmentAsync(
                id,
                cancellationToken);

            return NoContent();
        }

        [HttpGet("sensors")]
        public async Task<IActionResult> GetSensors(
            CancellationToken cancellationToken)
        {
            return Ok(
                await _service.GetSensorsAsync(
                    cancellationToken));
        }

        [HttpPost("sensors")]
        [Authorize(Policy = Policies.AdminOnly)]
        public async Task<IActionResult> CreateSensor(
            CreateTrackSensorDto request,
            CancellationToken cancellationToken)
        {
            return Ok(
                await _service.CreateSensorAsync(
                    request,
                    cancellationToken));
        }

        [HttpPut("sensors/{id:guid}")]
        [Authorize(Policy = Policies.AdminOnly)]
        public async Task<IActionResult> UpdateSensor(
            Guid id,
            UpdateTrackSensorDto request,
            CancellationToken cancellationToken)
        {
            return Ok(
                await _service.UpdateSensorAsync(
                    id,
                    request,
                    cancellationToken));
        }

        [HttpDelete("sensors/{id:guid}")]
        [Authorize(Policy = Policies.AdminOnly)]
        public async Task<IActionResult> DeleteSensor(
            Guid id,
            CancellationToken cancellationToken)
        {
            await _service.DeleteSensorAsync(
                id,
                cancellationToken);

            return NoContent();
        }
    }
}
