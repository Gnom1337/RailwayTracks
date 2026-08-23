using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Abstractions
{
    public interface IJwtTokenService
    {
        string CreateAccessToken(TokenUser user);
        string CreateRefreshToken();
    }
    public record TokenUser(
    Guid Id,
    string UserName,
    string? Email,
    IReadOnlyCollection<string> Roles);
}
