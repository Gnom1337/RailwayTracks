using Application.Abstractions;
using Application.Defect.DTOs;
using Application.Defect.Requests;
using Domain.Entities;
using Infrastructure.DAL;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RailwayTracks.Authorization;

namespace RailwayTracks.Controllers
{
    [ApiController]
    [Route("api/defects")]
    [Authorize]
    public class DefectsController : ControllerBase
    {
        private readonly IDefectService _service;

        public DefectsController(IDefectService service)
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
        [Authorize(Policy = Policies.DefectCreate)]
        public async Task<IActionResult> Create(
            CreateDefectRequest request,
            CancellationToken cancellationToken)
        {
            DefectDto result;

            try
            {
                result = await _service.CreateAsync(
                    request,
                    cancellationToken);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Id },
                result);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Policy = Policies.DefectUpdate)]
        public async Task<IActionResult> Update(
            Guid id,
            UpdateDefectRequest request,
            CancellationToken cancellationToken)
        {
            bool result;

            try
            {
                result = await _service.UpdateAsync(
                    id,
                    request,
                    cancellationToken);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }

            return result
                ? NoContent()
                : NotFound();
        }

        [HttpPatch("{id:guid}/status")]
        [Authorize(Policy = Policies.DefectStatusChange)]
        public async Task<IActionResult> ChangeStatus(
            Guid id,
            ChangeDefectStatusRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _service.ChangeStatusAsync(
                id,
                request,
                cancellationToken);

            return result
                ? NoContent()
                : NotFound();
        }

        [HttpPatch("{id:guid}/repair-team")]
        [HttpPatch("{id:guid}/RepairTeam")]
        [Authorize(Policy = Policies.DefectRepair)]
        public async Task<IActionResult> AssignRepairTeam(
            Guid id,
            AssignRepairTeamRequest request,
            CancellationToken cancellationToken)
        {
            bool result;

            try
            {
                result = await _service.AssignRepairTeamAsync(
                    id,
                    request,
                    cancellationToken);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }

            return result
                ? NoContent()
                : NotFound();
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Policy = Policies.DefectDelete)]
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
