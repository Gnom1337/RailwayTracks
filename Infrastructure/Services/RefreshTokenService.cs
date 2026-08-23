using Application.Abstractions;
using Infrastructure.Configuration;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;

namespace Infrastructure.Services;

public sealed class RefreshTokenService : IRefreshTokenService
{
    private const string CacheKeyPrefix = "refresh-token:";

    private readonly IMemoryCache _cache;
    private readonly TimeSpan _lifetime;

    public RefreshTokenService(
        IMemoryCache cache,
        IOptions<JwtOptions> options)
    {
        _cache = cache;
        _lifetime = TimeSpan.FromDays(options.Value.RefreshTokenExpirationDays);
    }

    public void Store(Guid userId, string refreshToken)
    {
        _cache.Set(CreateCacheKey(refreshToken), userId, _lifetime);
    }

    public bool TryConsume(string refreshToken, out Guid userId)
    {
        var cacheKey = CreateCacheKey(refreshToken);

        if (_cache.TryGetValue(cacheKey, out Guid storedUserId))
        {
            _cache.Remove(cacheKey);
            userId = storedUserId;
            return true;
        }

        userId = Guid.Empty;
        return false;
    }

    private static string CreateCacheKey(string refreshToken)
    {
        var tokenBytes = Encoding.UTF8.GetBytes(refreshToken);
        var hash = SHA256.HashData(tokenBytes);
        return CacheKeyPrefix + Convert.ToHexString(hash);
    }
}
