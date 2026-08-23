using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DefectStatusHistory.DTOs
{
    public record DefectStatusHistoryDto(
    Guid Id,
    Guid DefectId,
    Status OldStatus,
    Status NewStatus,
    string? Comment,
    DateTime CreatedAt,
    string CreatedBy);
}
