using Application.Abstractions;
using Application.DefectType.Requests;
using Application.RepairTeam.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RailwayTracks.Authorization;

namespace RailwayTracks.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RepairTeamsController : ControllerBase
    {
        private readonly IRepairTeamService _service;

        public RepairTeamsController(
            IRepairTeamService service)
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
        [Authorize(Policy = Policies.RepairTeamManage)]
        public async Task<IActionResult> Create(
            CreateRepairTeamRequest request,
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
        [Authorize(Policy = Policies.RepairTeamManage)]
        public async Task<IActionResult> Update(
            Guid id,
            UpdateRepairTeamRequest request,
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
        [Authorize(Policy = Policies.RepairTeamManage)]
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
