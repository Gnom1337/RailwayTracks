using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs
{
    public record LoginResponse(
    string AccessToken,
    DateTime AccessTokenExpiresAt,
    string RefreshToken);
}
