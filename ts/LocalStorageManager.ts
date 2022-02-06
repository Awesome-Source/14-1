class LocalStorageManager
{
    private static GetStoredNumber(key: string)
    {
        const value = localStorage.getItem(key);

        return Number(value);
    }

    private static GetStoredNumberForPlayer(playerLabel: string, player1Key: string, player2Key: string)
    {
        const storageKey = playerLabel === PlayerConstants.Player1 ? player1Key : player2Key;
        return this.GetStoredNumber(storageKey);
    }

    private static GetStoredStringForPlayer(playerLabel: string, player1Key: string, player2Key: string)
    {
        const storageKey = playerLabel === PlayerConstants.Player1 ? player1Key : player2Key;
        return localStorage.getItem(storageKey);
    }

    private static StoreNumberForPlayer(playerLabel: string, value: number, player1Key: string, player2Key: string)
    {
        const storageKey = playerLabel === PlayerConstants.Player1 ? player1Key : player2Key;
        localStorage.setItem(storageKey, "" + value);
    }

    private static StoreStringForPlayer(playerLabel: string, value: string, player1Key: string, player2Key: string)
    {
        const storageKey = playerLabel === PlayerConstants.Player1 ? player1Key : player2Key;
        localStorage.setItem(storageKey, value);
    }

    public static GetCurrentScoreOfPlayer(playerLabel: string)
    {
        return this.GetStoredNumberForPlayer(playerLabel, LocalStorageConstants.Player1ScoreKey, LocalStorageConstants.Player2ScoreKey);
    }

    public static StoreCurrentScoreOfPlayer(playerLabel: string, score: number)
    {
        this.StoreNumberForPlayer(playerLabel, score, LocalStorageConstants.Player1ScoreKey , LocalStorageConstants.Player2ScoreKey);
    }

    public static GetPreviousScoreOfPlayer(playerLabel: string)
    {
        return this.GetStoredNumberForPlayer(playerLabel, LocalStorageConstants.Player1PreviousScoreKey, LocalStorageConstants.Player2PreviousScoreKey);
    }

    public static StorePreviousScoreOfPlayer(playerLabel: string, previousScore: number)
    {
        this.StoreNumberForPlayer(playerLabel, previousScore, LocalStorageConstants.Player1PreviousScoreKey, LocalStorageConstants.Player2PreviousScoreKey);
    }

    public static GetHighestSeriesOfPlayer(playerLabel: string)
    {
        return this.GetStoredNumberForPlayer(playerLabel, LocalStorageConstants.Player1HighestSeriesKey, LocalStorageConstants.Player2HighestSeriesKey);
    }

    public static StoreHighestSeriesOfPlayer(playerLabel: string, highestSeries: number)
    {
        this.StoreNumberForPlayer(playerLabel, highestSeries, LocalStorageConstants.Player1HighestSeriesKey, LocalStorageConstants.Player2HighestSeriesKey);
    }

    public static GetTakeOfPlayer(playerLabel: string)
    {
        return this.GetStoredNumberForPlayer(playerLabel, LocalStorageConstants.Player1TakeKey, LocalStorageConstants.Player2TakeKey);
    }

    public static StoreTakeOfPlayer(playerLabel: string, take: number)
    {
        this.StoreNumberForPlayer(playerLabel, take, LocalStorageConstants.Player1TakeKey, LocalStorageConstants.Player2TakeKey);
    }

    public static GetFoulCountOfPlayer(playerLabel: string)
    {
        return this.GetStoredNumberForPlayer(playerLabel, LocalStorageConstants.Player1FoulsKey, LocalStorageConstants.Player2FoulsKey);
    }

    public static StoreFoulCountOfPlayer(playerLabel: string, foulCount: number)
    {
        this.StoreNumberForPlayer(playerLabel, foulCount, LocalStorageConstants.Player1FoulsKey, LocalStorageConstants.Player2FoulsKey);
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

    public static StorePlayerName(playerLabel: string, playerName: string)
    {
        this.StoreStringForPlayer(playerLabel, playerName, LocalStorageConstants.Player1NameKey, LocalStorageConstants.Player2NameKey);
    }

    public static GetPlayerName(playerLabel: string)
    {
        return this.GetStoredStringForPlayer(playerLabel, LocalStorageConstants.Player1NameKey, LocalStorageConstants.Player2NameKey);
    }

    public static StoreTargetScore(targetScore: number)
    {
        localStorage.setItem(LocalStorageConstants.TargetScoreKey, "" + targetScore);
    }

    public static StoreGameState(gameState: string)
    {
        localStorage.setItem(LocalStorageConstants.GameStateKey, gameState);
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