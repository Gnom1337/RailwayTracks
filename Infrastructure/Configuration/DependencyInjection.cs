using Application.Abstractions;
using Application.Common.Security;
using Infrastructure.Configuration;
using Infrastructure.DAL;
using Infrastructure.Models;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using RailwayTracks.Authorization;
using System.Text;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddMemoryCache();

        // =========================
        // Database
        // =========================
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection")));

        // =========================
        // HttpContext
        // =========================
        services.AddHttpContextAccessor();

        // =========================
        // JWT Options
        // =========================
        var jwtSection = configuration.GetSection(JwtOptions.SectionName);

        services.Configure<JwtOptions>(jwtSection);

        var jwtOptions = jwtSection.Get<JwtOptions>()
            ?? throw new InvalidOperationException(
                "JWT configuration is missing.");

        // =========================
        // ASP.NET Core Identity
        // =========================
        services
    .AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
    {
        // User
        options.User.RequireUniqueEmail = true;

        // Password
        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireNonAlphanumeric = false;

        // Lockout
        options.Lockout.AllowedForNewUsers = true;
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.DefaultLockoutTimeSpan =
            TimeSpan.FromMinutes(15);

        // SignIn
        options.SignIn.RequireConfirmedEmail = false;
        options.SignIn.RequireConfirmedAccount = false;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

        // =========================
        // Authentication - JWT
        // =========================
        var key = Encoding.UTF8.GetBytes(jwtOptions.SecretKey);

        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme =
                    JwtBearerDefaults.AuthenticationScheme;

                options.DefaultChallengeScheme =
                    JwtBearerDefaults.AuthenticationScheme;

                options.DefaultScheme =
                    JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = true;
                options.SaveToken = false;

                options.TokenValidationParameters =
                    new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = jwtOptions.Issuer,

                        ValidateAudience = true,
                        ValidAudience = jwtOptions.Audience,

                        ValidateLifetime = true,

                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey =
                            new SymmetricSecurityKey(key),

                        ClockSkew = TimeSpan.Zero
                    };
            });

        // =========================
        // Authorization
        // =========================
        services.AddAuthorization(options =>
        {
            options.AddPolicy(
                Policies.AdminOnly,
                policy => policy.RequireRole(Roles.Admin));

            options.AddPolicy(
                Policies.DefectRead,
                policy => policy.RequireRole(
                    Roles.Admin,
                    Roles.Inspector,
                    Roles.RepairTeam));

            options.AddPolicy(
                Policies.DefectCreate,
                policy => policy.RequireRole(
                    Roles.Admin,
                    Roles.Inspector,
                    Roles.RepairTeam));

            options.AddPolicy(
                Policies.DefectUpdate,
                policy => policy.RequireRole(
                    Roles.Admin,
                    Roles.Inspector));

            options.AddPolicy(
                Policies.DefectDelete,
                policy => policy.RequireRole(
                    Roles.Admin));

            options.AddPolicy(
                Policies.DefectStatusChange,
                policy => policy.RequireRole(
                    Roles.Admin,
                    Roles.Inspector));

            options.AddPolicy(
                Policies.DefectRepair,
                policy => policy.RequireRole(
                    Roles.Admin,
                    Roles.RepairTeam));

            options.AddPolicy(
                Policies.DefectTypeManage,
                policy => policy.RequireRole(Roles.Admin));

            options.AddPolicy(
                Policies.LocationManage,
                policy => policy.RequireRole(Roles.Admin));

            options.AddPolicy(
                Policies.RepairTeamManage,
                policy => policy.RequireRole(Roles.Admin));

            options.AddPolicy(
                Policies.InspectorManage,
                policy => policy.RequireRole(Roles.Admin));

            options.AddPolicy(
                Policies.DataSourceManage,
                policy => policy.RequireRole(Roles.Admin));
            options.AddPolicy(
        Policies.TrackSchemeRead,
        policy => policy.RequireRole(
            Roles.Admin,
            Roles.Inspector,
            Roles.RepairTeam));

            options.AddPolicy(
                Policies.TrackSchemeManage,
                policy => policy.RequireRole(
                    Roles.Admin));
        });

        // =========================
        // Application Services
        // =========================
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddSingleton<IRefreshTokenService, RefreshTokenService>();
        services.AddScoped<IDefectTypeService, DefectTypeService>();
        services.AddScoped<ILocationService, LocationService>();
        services.AddScoped<IRepairTeamService, RepairTeamService>();
        services.AddScoped<IInspectorService, InspectorService>();
        services.AddScoped<IDataSourceService, DataSourceService>();
        services.AddScoped<IDefectStatusHistoryService, DefectStatusHistoryService>();
        services.AddScoped<IDefectService, DefectService>();
        services.AddScoped<ITrackSchemeService, TrackSchemeService>();
        return services;
    }
}
