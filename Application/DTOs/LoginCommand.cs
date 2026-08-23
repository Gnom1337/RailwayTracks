using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs
{
    public record LoginCommand(
    string Email,
    string Password);
}
