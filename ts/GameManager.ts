class GameManager
{
    public static ReturnToMenu()
    {
        LocalStorageManager.StoreActiveView(LocalStorageConstants.MenuView);
        this.ShowActiveView();
    }

    public static CreateNewGame()
    {
        LocalStorageManager.StoreActions([]);
        const startGameInfo = GameViewManager.ExtractStartGameInfo();
        
        if(startGameInfo === null)
        {
            return;
        }        

        GameViewManager.HighlightActivePlayer(PlayerConstants.Player1);  
        GameViewManager.UnlockControls();
        const state = this.CreateCompleteState(startGameInfo.NameOfPlayer1, startGameInfo.NameOfPlayer2, startGameInfo.TargetScore);
        LocalStorageManager.StoreState(state);
        LocalStorageManager.StoreActiveView(LocalStorageConstants.GameView);

        this.ReloadStoredState();
        this.ShowActiveView();
    }

    private static CreateCompleteState(nameOfPlayer1: string, nameOfPlayer2: string, targetScore: number)
    {
        const gameState = new GameState(PlayerConstants.Player1, targetScore, 15);
        const player1State = new PlayerState(nameOfPlayer1, PlayerConstants.Player1);
        const player2State = new PlayerState(nameOfPlayer2, PlayerConstants.Player2);
        player1State.Take = 1;
        return new CompleteState(gameState, player1State, player2State);
    }

    public static ShowActiveView()
    {
        let isGameInProgress = LocalStorageManager.IsGameInProgress();

        if(isGameInProgress)
        {
            GameViewManager.ShowGameView();
        }
        else
        {
            GameViewManager.ShowMenuView();
        }
    }

    public static SwitchPlayer()
    {
        const state = LocalStorageManager.GetState();

        GameLogic.SwitchPlayer(state);

        LocalStorageManager.StoreState(state);
        GameViewManager.HighlightActivePlayer(state.GameState.ActivePlayer);
        this.UpdateView();
        this.RecordAction(ActionIds.Switch, 0);
    }

    public static Undo()
    {
        const actions = LocalStorageManager.GetActions();

        if(actions.length === 0)
        {
            return;
        }

        actions.pop();
        this.ReplayActions(actions);
        LocalStorageManager.StoreActions(actions);
    }

    private static ReplayActions(actions: GameAction[])
    {
        const stateBefore = LocalStorageManager.GetState();
        const state = this.CreateCompleteState(stateBefore.PlayerState1.Name, stateBefore.PlayerState2.Name, stateBefore.GameState.TargetScore);
        GameLogic.ReplayActions(actions, state);
        LocalStorageManager.StoreState(state);
        GameViewManager.UnlockControls();
        this.UpdateView();
        GameViewManager.HighlightActivePlayer(state.GameState.ActivePlayer);
    }

    public static NewRack()
    {
        const state = LocalStorageManager.GetState();
        GameLogic.NewRack(state);        
        LocalStorageManager.StoreState(state);
        this.UpdateView();
        this.RecordAction(ActionIds.NewRack, 0);
    }

    public static Foul()
    {
        const state = LocalStorageManager.GetState();        
        const activePlayerState = StateHelper.GetActivePlayerState(state);

        if(activePlayerState.Take === 1)
        {
            GameViewManager.SetVisibilityOfElement("break_foul_dialog", true);
            return;
        }

        this.HandleNormalFoul();
    }

    public static HandleBreakFoul()
    {
        this.ApplyFoulPoints(true);
    }

    public static HandleNormalFoul()
    {
        this.ApplyFoulPoints(false);
    }

    private static ApplyFoulPoints(isBreakFoul: boolean)
    {
        const state = LocalStorageManager.GetState();        
        GameLogic.ApplyFoulPoints(isBreakFoul, state);
        LocalStorageManager.StoreState(state);
        GameViewManager.HighlightActivePlayer(state.GameState.ActivePlayer);
        this.UpdateView();
        this.RecordAction(ActionIds.Foul, isBreakFoul ? 1 : 0);
    }

    public static ReloadStoredState()
    {
        GameViewManager.LocalizeView();
        if(!LocalStorageManager.IsStorageVersionUpToDate())
        {
            GameViewManager.ShowIncompatibleStorageVersionMessage();
            LocalStorageManager.Clear();
        }

        LocalStorageManager.StoreStorageVersion();
        this.ShowActiveView();

        if(!LocalStorageManager.IsGameInProgress())
        {
            return;
        }

        const state = LocalStorageManager.GetState();
        
        GameViewManager.UpdatePlayerNames(state.PlayerState1.Name, state.PlayerState2.Name);
        this.UpdateView();
        GameViewManager.HighlightActivePlayer(state.GameState.ActivePlayer);  
    }

    public static SetRemainingBalls(remainingBalls: number)
    {
        const state = LocalStorageManager.GetState();

        GameLogic.SetRemainingBalls(remainingBalls, state);

        LocalStorageManager.StoreState(state);
        this.UpdateView();
        this.RecordAction(ActionIds.SetRemainingBalls, remainingBalls);
    }

    public static ChangeAmountOfRemainingBalls(delta: number)
    {
        const state = LocalStorageManager.GetState();
        const remainingBallsBefore = state.GameState.RemainingBallsOnTable;
        const remainingBalls = remainingBallsBefore + delta;

        if(remainingBalls > 15)
        {
            return;
        }

        this.SetRemainingBalls(remainingBalls);    
    }

    public static UpdateView()
    {
        const state = LocalStorageManager.GetState();

        GameViewManager.SetRemainingBallsOnTableDisplayValue(state.GameState.RemainingBallsOnTable);

        this.UpdateViewForPlayer(PlayerConstants.Player1, state.PlayerState1, state.GameState.TargetScore)
        this.UpdateViewForPlayer(PlayerConstants.Player2, state.PlayerState2, state.GameState.TargetScore)
    }

    private static UpdateViewForPlayer(playerLabel: string, playerState: PlayerState, targetScore: number)
    {
        const remainingBalls = Math.max(0, targetScore - playerState.CurrentScore);
        const average = playerState.CurrentScore / Math.max(playerState.Take, 1);
        const series = playerState.CurrentScore - playerState.PreviousScore;

        GameViewManager.UpdateCalculatedPlayerDetails(playerLabel, remainingBalls, average, series);
        GameViewManager.UpdatePlayerStateDetails(playerLabel, playerState);

        if(remainingBalls === 0)
        {
            GameViewManager.ShowWinDialog(playerState.Name);
        }
    }

    private static RecordAction(actionId: number, actionContext: number)
    {
        const actions = LocalStorageManager.GetActions();
        actions.push(new GameAction(actionId, actionContext));
        LocalStorageManager.StoreActions(actions);
    }

    public static FillDetailsDialog() {
        
        GameViewManager.ClearDetailsTable();

        const actions = LocalStorageManager.GetActions();

        if(actions.length === 0)
        {
            GameViewManager.AddDetailsTableRow(1, "0", "-");
            return;
        }

        const stateBefore = LocalStorageManager.GetState();
        const state = this.CreateCompleteState(stateBefore.PlayerState1.Name, stateBefore.PlayerState2.Name, stateBefore.GameState.TargetScore);
        const historyEntries = GameLogic.BuildHistory(actions, state);

        for(let i = 0; i < historyEntries.length; i++)
        {
            const entry = historyEntries[i];
            GameViewManager.AddDetailsTableRow(entry.Take, entry.CurrentScoreOfPlayer1, entry.CurrentScoreOfPlayer2);
        }
    }
}