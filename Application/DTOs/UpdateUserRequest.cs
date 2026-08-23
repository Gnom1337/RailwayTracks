using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs
{
    public record UpdateUserRequest(
    string Email,
    string FirstName,
    string LastName);
}
