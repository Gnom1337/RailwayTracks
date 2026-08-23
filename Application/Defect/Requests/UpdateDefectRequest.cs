using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Defect.Requests
{
    public record UpdateDefectRequest(
    Guid DefectTypeId,
    Guid LocationId,
    DateTimeOffset DetectedAt,
    Guid DetectedById,
    Saverity Saverity,
    string? Description,
    DateTimeOffset? PlannedRepairDate,
    RecommendationType RecommendationType,
    SourceType SourceType);
}
