class LocalStorageManager
{
    private static GetStoredNumber(key: string)
    {
        const value = localStorage.getItem(key);

        return Number(value);
    }

    public static GetTargetScore()
    {
        return this.GetStoredNumber(LocalStorageConstants.TargetScoreKey);
    }

    public static GetActivePlayer()
    {
        return localStorage.getItem(LocalStorageConstants.ActivePlayerKey);
    }

    public static StoreActivePlayer(playerLabel: string)
    {
        localStorage.setItem(LocalStorageConstants.ActivePlayerKey, playerLabel);
    }

    public static GetAmountOfRemainingBallsOnTable()
    {
        return this.GetStoredNumber(LocalStorageConstants.RemainingBallsOnTableKey);
    }

    public static StoreAmountOfRemainingBallsOnTable(remainingBalls: number)
    {
        localStorage.setItem(LocalStorageConstants.RemainingBallsOnTableKey, "" + remainingBalls);
    }

    public static StoreTargetScore(targetScore: number)
    {
        localStorage.setItem(LocalStorageConstants.TargetScoreKey, "" + targetScore);
    }

    public static StoreGameState(gameState: string)
    {
        localStorage.setItem(LocalStorageConstants.GameStateKey, gameState);
    }

    public static StorePlayerState(playerLabel: string, playerInfo: PlayerState)
    {
        const storageKey = playerLabel == PlayerConstants.Player1 ? LocalStorageConstants.Player1StateKey : LocalStorageConstants.Player2StateKey;
        localStorage.setItem(storageKey, JSON.stringify(playerInfo));
    }

    public static GetPlayerState(playerLabel: string)
    {
        const storageKey = playerLabel == PlayerConstants.Player1 ? LocalStorageConstants.Player1StateKey : LocalStorageConstants.Player2StateKey;
        const json = localStorage.getItem(storageKey);

        return <PlayerState> JSON.parse(json);
    }

    public static IsGameInProgress()
    {
        return localStorage.getItem(LocalStorageConstants.GameStateKey) === LocalStorageConstants.GameStateInProgress;
    }

    public static StoreStorageVersion()
    {
        localStorage.setItem(LocalStorageConstants.StorageVersionKey, LocalStorageConstants.StorageVersion)
    }

    public static IsStorageVersionUpToDate()
    {
        const storageVersion = localStorage.getItem(LocalStorageConstants.StorageVersionKey);

        if(storageVersion === null || storageVersion === "")
        {
            return true;
        }

        return storageVersion === LocalStorageConstants.StorageVersion;
    }

    public static Clear()
    {
        localStorage.clear();
    }
}