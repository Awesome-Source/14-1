class LocalStorageManager
{
    public static StoreGameState(gameState: GameState)
    {
        const json = JSON.stringify(gameState);
        localStorage.setItem(LocalStorageConstants.GameStateKey, json);
    }

    public static GetGameState()
    {
        const json = localStorage.getItem(LocalStorageConstants.GameStateKey);

        return <GameState> JSON.parse(json);
    }

    public static StoreActiveView(viewId: string)
    {
        localStorage.setItem(LocalStorageConstants.ActiveViewKey, viewId);
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

    public static GetActions()
    {
        const json = localStorage.getItem(LocalStorageConstants.ActionsKey);

        return <GameAction[]> JSON.parse(json);
    }

    public static StoreActions(actions: GameAction[])
    {
        const json = JSON.stringify(actions);
        localStorage.setItem(LocalStorageConstants.ActionsKey, json);
    }

    public static IsGameInProgress()
    {
        return localStorage.getItem(LocalStorageConstants.ActiveViewKey) === LocalStorageConstants.GameView;
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