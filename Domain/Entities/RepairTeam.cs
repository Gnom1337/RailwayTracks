using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class RepairTeam : BaseAuditEntity
    {
        public string Name { get; set; } = null!;
        public string Contact { get; set; } = null!;
        public bool Contractor { get; set; }
        public List<Defect>? Defects { get; set; }
    }
}
