using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Abstractions
{
    public interface ICurrentUserService
    {
        Guid? UserId { get; }

        string? UserName { get; }

        bool IsAuthenticated { get; }

        bool IsInRole(string role);
    }
}
