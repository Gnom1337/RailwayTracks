using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class DataSource : BaseAuditEntity
    {
        public string Name { get; set; } = null!;
    }
}
