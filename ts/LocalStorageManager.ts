class LocalStorageManager
{
    public static StoreState(state: CompleteState)
    {
        localStorage.setItem(LocalStorageConstants.StateKey, JSON.stringify(state));
    }

    public static GetState()
    {
        const json = localStorage.getItem(LocalStorageConstants.StateKey);

        return <CompleteState> JSON.parse(json);
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

    public static StoreActiveView(viewId: string)
    {
        localStorage.setItem(LocalStorageConstants.ActiveViewKey, viewId);
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