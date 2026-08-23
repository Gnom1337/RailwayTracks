using Application.Abstractions;
using Application.DataSource.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RailwayTracks.Authorization;

namespace RailwayTracks.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = Policies.DataSourceManage)]
    public class DataSourcesController : ControllerBase
    {
        private readonly IDataSourceService _service;

        public DataSourcesController(IDataSourceService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            CancellationToken cancellationToken)
        {
            return Ok(
                await _service.GetAllAsync(cancellationToken));
        }

        [HttpGet("{id:guid}")]
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
        public async Task<IActionResult> Create(
            CreateDataSourceRequest request,
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
        public async Task<IActionResult> Update(
            Guid id,
            UpdateDataSourceRequest request,
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
