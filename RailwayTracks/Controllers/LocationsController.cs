using Application.Abstractions;
using Application.DefectType.Requests;
using Application.Location.Requests;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RailwayTracks.Authorization;

namespace RailwayTracks.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LocationsController : ControllerBase
    {
        private readonly ILocationService _service;

        public LocationsController(
            ILocationService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Policy = Policies.DefectRead)]
        public async Task<IActionResult> GetAll(
            CancellationToken cancellationToken)
        {
            return Ok(
                await _service.GetAllAsync(cancellationToken));
        }

        [HttpGet("{id:guid}")]
        [Authorize(Policy = Policies.DefectRead)]
        public async Task<IActionResult> GetById(
            Guid id,
            CancellationToken cancellationToken)
        {
            var result = await _service.GetByIdAsync(
                id,
                cancellationToken);

            return result == null
                ? NotFound()
                : Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = Policies.LocationManage)]
        public async Task<IActionResult> Create(
            CreateLocationRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _service.CreateAsync(
                request,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Id },
                result);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Policy = Policies.LocationManage)]
        public async Task<IActionResult> Update(
            Guid id,
            UpdateLocationRequest request,
            CancellationToken cancellationToken)
        {
            var success = await _service.UpdateAsync(
                id,
                request,
                cancellationToken);

            return success
                ? NoContent()
                : NotFound();
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Policy = Policies.LocationManage)]
        public async Task<IActionResult> Delete(
            Guid id,
            CancellationToken cancellationToken)
        {
            var success = await _service.DeleteAsync(
                id,
                cancellationToken);

            return success
                ? NoContent()
                : NotFound();
        }
    }
}
