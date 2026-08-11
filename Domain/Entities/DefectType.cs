using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class DefectType : BaseEntity
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }
}
