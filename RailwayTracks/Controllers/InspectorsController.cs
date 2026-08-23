using Application.Abstractions;
using Application.Inspectors.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RailwayTracks.Authorization;

namespace RailwayTracks.Controllers
{
    [ApiController]
    [Route("api/inspectors")]
    [Authorize]
    public class InspectorsController : ControllerBase
    {
        private readonly IInspectorService _service;

        public InspectorsController(
            IInspectorService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Policy = Policies.DefectRead)]
        public async Task<IActionResult> GetAll(
            CancellationToken cancellationToken)
        {
            var result = await _service.GetAllAsync(
                cancellationToken);

            return Ok(result);
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

            return result is null
                ? NotFound()
                : Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = Policies.InspectorManage)]
        public async Task<IActionResult> Create(
            CreateInspectorRequest request,
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
        [Authorize(Policy = Policies.InspectorManage)]
        public async Task<IActionResult> Update(
            Guid id,
            UpdateInspectorRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _service.UpdateAsync(
                id,
                request,
                cancellationToken);

            return result
                ? NoContent()
                : NotFound();
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Policy = Policies.InspectorManage)]
        public async Task<IActionResult> Delete(
            Guid id,
            CancellationToken cancellationToken)
        {
            var result = await _service.DeleteAsync(
                id,
                cancellationToken);

            return result
                ? NoContent()
                : NotFound();
        }
    }
}
