namespace Application.Abstractions;

public interface IRefreshTokenService
{
    void Store(Guid userId, string refreshToken);

    bool TryConsume(string refreshToken, out Guid userId);
}
