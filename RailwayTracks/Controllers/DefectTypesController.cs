using Application.Abstractions;
using Application.DefectType.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RailwayTracks.Authorization;

namespace RailwayTracks.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DefectTypesController : ControllerBase
    {
        private readonly IDefectTypeService _service;

        public DefectTypesController(
            IDefectTypeService service)
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
        [Authorize(Policy = Policies.DefectTypeManage)]
        public async Task<IActionResult> Create(
            CreateDefectTypeRequest request,
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
        [Authorize(Policy = Policies.DefectTypeManage)]
        public async Task<IActionResult> Update(
            Guid id,
            UpdateDefectTypeRequest request,
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
        [Authorize(Policy = Policies.DefectTypeManage)]
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
