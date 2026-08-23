using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Defect.DTOs
{
    public record DefectDto(
    Guid Id,
    Guid DefectTypeId,
    Guid LocationId,
    DateTimeOffset DetectedAt,
    Guid DetectedById,
    Saverity Saverity,
    string? Description,
    Status Status,
    DateTimeOffset? PlannedRepairDate,
    Guid? RepairTeamId,
    RecommendationType RecommendationType,
    SourceType SourceType);
}
