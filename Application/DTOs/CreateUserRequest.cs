using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs
{
    public record CreateUserRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string Role);
}
