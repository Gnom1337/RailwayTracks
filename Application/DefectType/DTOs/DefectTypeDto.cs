using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DefectType.DTOs
{
    public record DefectTypeDto(
    Guid Id,
    string Name,
    string? Description);
}
