using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public abstract class BaseAuditEntity : BaseEntity
    {
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = null!;
        public DateTime ModifiedAt { get; set; }
        public string ModifiedBy { get; set; } = null!;
    }
}
