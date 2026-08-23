using Application.DTOs;
using Azure.Core;
using Infrastructure.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RailwayTracks.Authorization;

namespace RailwayTracks.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = Policies.AdminOnly)]
    public class AdminUsersController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public AdminUsersController(
            UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet]
        public IActionResult GetUsers()
        {
            var users = _userManager.Users
                .Select(x => new
                {
                    x.Id,
                    x.Email,
                    x.UserName,
                    x.FirstName,
                    x.LastName,
                    x.EmailConfirmed
                });

            return Ok(users);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            var user = await _userManager.FindByIdAsync(
                id.ToString());

            if (user == null)
                return NotFound();

            var roles =
                await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.Id,
                user.Email,
                user.UserName,
                user.FirstName,
                user.LastName,
                user.EmailConfirmed,
                    roles
                });
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            CreateUserRequest request)
        {
            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                EmailConfirmed = true
            };

            var result =
                await _userManager.CreateAsync(
                    user,
                    request.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                var roleResult =
                    await _userManager.AddToRoleAsync(
                        user,
                        request.Role);

                if (!roleResult.Succeeded)
                    return BadRequest(roleResult.Errors);
            }

            return CreatedAtAction(
                nameof(GetUser),
                new { id = user.Id },
                new
                {
                    user.Id,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    Role = request.Role
                });
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(
            Guid id,
            UpdateUserRequest request)
        {
            var user =
                await _userManager.FindByIdAsync(
                    id.ToString());

            if (user == null)
                return NotFound();

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.Email = request.Email;
            user.UserName = request.Email;

            var result =
                await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var user =
                await _userManager.FindByIdAsync(
                    id.ToString());

            if (user == null)
                return NotFound();

            var result =
                await _userManager.DeleteAsync(user);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return NoContent();
        }

        [HttpPut("{id:guid}/roles")]
        public async Task<IActionResult> SetRole(
            Guid id,
            SetUserRoleRequest request)
        {
            var user =
                await _userManager.FindByIdAsync(
                    id.ToString());

            if (user == null)
                return NotFound();

            var roles =
                await _userManager.GetRolesAsync(user);

            if (roles.Count > 0)
            {
                await _userManager.RemoveFromRolesAsync(
                    user,
                    roles);
            }

            var result =
                await _userManager.AddToRoleAsync(
                    user,
                    request.Role);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return NoContent();
        }
    }
}
