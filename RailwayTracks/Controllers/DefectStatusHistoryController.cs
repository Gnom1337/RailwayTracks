using Application.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RailwayTracks.Authorization;

namespace RailwayTracks.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Route("api/defect-status-history")]
    [Authorize(Policy = Policies.DefectRead)]
    public class DefectStatusHistoryController : ControllerBase
    {
        private readonly IDefectStatusHistoryService _service;

        public DefectStatusHistoryController(
            IDefectStatusHistoryService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] Guid? defectId,
            CancellationToken cancellationToken)
        {
            if (defectId.HasValue)
            {
                return Ok(
                    await _service.GetByDefectIdAsync(
                        defectId.Value,
                        cancellationToken));
            }

            return Ok(
                await _service.GetAllAsync(cancellationToken));
        }

        [HttpGet("defect/{defectId:guid}")]
        public async Task<IActionResult> GetByDefect(
            Guid defectId,
            CancellationToken cancellationToken)
        {
            return Ok(
                await _service.GetByDefectIdAsync(
                    defectId,
                    cancellationToken));
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> Get(
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
    }
}
