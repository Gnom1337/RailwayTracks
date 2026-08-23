using Application.Common.Security;
using Infrastructure.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Identity
{
    public static class IdentitySeeder
    {
        public static async Task SeedAsync(
            IServiceProvider services)
        {
            var roleManager =
                services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

            var userManager =
                services.GetRequiredService<UserManager<ApplicationUser>>();

            var roles = new[]
            {
            Roles.Admin,
            Roles.Inspector,
            Roles.RepairTeam
        };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    var result = await roleManager.CreateAsync(
                        new IdentityRole<Guid>(role));

                    if (!result.Succeeded)
                    {
                        throw new Exception(
                            $"Failed to create role {role}: " +
                            string.Join(", ",
                                result.Errors.Select(x => x.Description)));
                    }
                }
            }

            await CreateAdminAsync(userManager);
        }

        private static async Task CreateAdminAsync(
            UserManager<ApplicationUser> userManager)
        {
            const string email = "admin@example.com";
            const string password = "Admin123!";

            var user = await userManager.FindByEmailAsync(email);

            if (user != null)
                return;

            user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FirstName = "System",
                LastName = "Administrator"
            };

            var result = await userManager.CreateAsync(
                user,
                password);

            if (!result.Succeeded)
            {
                throw new Exception(
                    "Failed to create admin: " +
                    string.Join(", ",
                        result.Errors.Select(x => x.Description)));
            }

            await userManager.AddToRoleAsync(
                user,
                Roles.Admin);
        }
    }
}
