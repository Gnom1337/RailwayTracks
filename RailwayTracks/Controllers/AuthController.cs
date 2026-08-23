using Application.Abstractions;
using Infrastructure.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace RailwayTracks.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IRefreshTokenService _refreshTokenService;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            IJwtTokenService jwtTokenService,
            IRefreshTokenService refreshTokenService)
        {
            _userManager = userManager;
            _jwtTokenService = jwtTokenService;
            _refreshTokenService = refreshTokenService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
                return Unauthorized();

            if (!user.EmailConfirmed)
                return Unauthorized("Адрес электронной почты не подтверждён.");

            return Ok(await CreateTokenResponseAsync(user));
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(RefreshTokenRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.RefreshToken)
                || !_refreshTokenService.TryConsume(request.RefreshToken, out var userId))
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId.ToString());

            if (user == null || !user.EmailConfirmed)
                return Unauthorized();

            return Ok(await CreateTokenResponseAsync(user));
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!Guid.TryParse(userId, out var id))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(id.ToString());

            if (user == null)
                return Unauthorized();

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                id = user.Id,
                userName = user.UserName,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName,
                roles,
            });
        }

        private async Task<object> CreateTokenResponseAsync(ApplicationUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var tokenUser = new TokenUser(
                user.Id,
                user.UserName ?? user.Email ?? user.Id.ToString(),
                user.Email,
                roles.ToList());

            var refreshToken = _jwtTokenService.CreateRefreshToken();
            _refreshTokenService.Store(user.Id, refreshToken);

            return new
            {
                accessToken = _jwtTokenService.CreateAccessToken(tokenUser),
                refreshToken,
                user = new
                {
                    id = user.Id,
                    userName = user.UserName,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    roles,
                },
            };
        }
    }

    public sealed record RefreshTokenRequest(string RefreshToken);
}
