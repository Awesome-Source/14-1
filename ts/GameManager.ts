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
        const gameState = new GameState(PlayerConstants.Player1, startGameInfo.TargetScore, 15);
        const player1State = new PlayerState(startGameInfo.NameOfPlayer1, PlayerConstants.Player1);
        const player2State = new PlayerState(startGameInfo.NameOfPlayer2, PlayerConstants.Player2);
        player1State.Take = 1;
        const state = new CompleteState(gameState, player1State, player2State);
        LocalStorageManager.StoreState(state);
        LocalStorageManager.StoreActiveView(LocalStorageConstants.GameView);

        this.ReloadStoredState();
        this.ShowActiveView();
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

        this.SwitchPlayerInternal(state);

        LocalStorageManager.StoreState(state);
        GameViewManager.HighlightActivePlayer(state.GameState.ActivePlayer);
        this.UpdateView();
        this.RecordAction(ActionIds.Switch, 0);
    }

    private static SwitchPlayerInternal(state: CompleteState)
    {
        const activePlayerState = StateHelper.GetActivePlayerState(state);
        const nextPlayerState = StateHelper.GetInactivePlayerState(state);

        this.UpdateHighestSeriesIfNecessary(activePlayerState);
        activePlayerState.PreviousScore = activePlayerState.CurrentScore;
        nextPlayerState.Take += 1;
        state.GameState.ActivePlayer = nextPlayerState.Label;
    }

    public static Undo()
    {
        const actions = LocalStorageManager.GetActions();
        actions.pop();
        this.ReplayActions(actions);
        LocalStorageManager.StoreActions(actions);
    }

    private static ReplayActions(actions: GameAction[])
    {
        const stateBefore = LocalStorageManager.GetState();

        const playerState1 = new PlayerState(stateBefore.PlayerState1.Name, PlayerConstants.Player1);
        const playerState2 = new PlayerState(stateBefore.PlayerState2.Name, PlayerConstants.Player2);
        const gameState = new GameState(PlayerConstants.Player1, stateBefore.GameState.TargetScore, 15);
        const state = new CompleteState(gameState, playerState1, playerState2);

        for(let i = 0; i < actions.length; i++)
        {
            const currentAction = actions[i];
            switch(currentAction.Id)
            {
                case ActionIds.Switch:
                    this.SwitchPlayerInternal(state);
                    break;
                case ActionIds.SetRemainingBalls:
                    this.SetRemainingBallsInternal(currentAction.Context, state);
                    break;
                case ActionIds.Foul:
                    this.ApplyFoulPointsInternal(currentAction.Context === 1, state);
                    break;
                case ActionIds.NewRack:
                    this.NewRackInternal(state);
                    break;
            }
        }

        LocalStorageManager.StoreState(state);
        this.UpdateView();
        GameViewManager.HighlightActivePlayer(gameState.ActivePlayer);
    }

    public static NewRack()
    {
        const state = LocalStorageManager.GetState();

        this.NewRackInternal(state);
        
        LocalStorageManager.StoreState(state);
        this.UpdateView();
        this.RecordAction(ActionIds.NewRack, 0);
    }

    private static NewRackInternal(state: CompleteState)
    {
        const activePlayerState = StateHelper.GetActivePlayerState(state);
        this.ChangePlayerScore(activePlayerState, 14);
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
        
        this.ApplyFoulPointsInternal(isBreakFoul, state);

        LocalStorageManager.StoreState(state);

        GameViewManager.HighlightActivePlayer(state.GameState.ActivePlayer);
        this.UpdateView();
        this.RecordAction(ActionIds.Foul, isBreakFoul ? 1 : 0);
    }

    private static ApplyFoulPointsInternal(isBreakFoul: boolean, state: CompleteState)
    {
        const activePlayerState = StateHelper.GetActivePlayerState(state);
        activePlayerState.FoulCount += 1;

        let negativePoints = -1;

        if(isBreakFoul)
        {
            negativePoints = -2;
        }

        if(activePlayerState.FoulCount % 3 === 0)
        {
            negativePoints = -16;
        }

        
        activePlayerState.CurrentScore += negativePoints;
        this.SwitchPlayerInternal(state);
    }

    public static ReloadStoredState()
    {
        if(!LocalStorageManager.IsStorageVersionUpToDate())
        {
            alert("Der gespeicherte Zustand ist nicht mit der aktuellen Version kompatibel.");
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

    public static UpdateHighestSeriesIfNecessary(playerState: PlayerState)
    {
        const currentSeries = playerState.CurrentScore - playerState.PreviousScore;

        if(currentSeries > playerState.HighestSeries)
        {
            playerState.HighestSeries = currentSeries;
        }
    }

    public static SetRemainingBalls(remainingBalls: number)
    {
        const state = LocalStorageManager.GetState();

        this.SetRemainingBallsInternal(remainingBalls, state);

        LocalStorageManager.StoreState(state);
        this.UpdateView();
        this.RecordAction(ActionIds.SetRemainingBalls, remainingBalls);
    }

    private static SetRemainingBallsInternal(remainingBalls: number, state: CompleteState)
    {
        const activePlayerState = StateHelper.GetActivePlayerState(state);

        const remainingBallsBefore = state.GameState.RemainingBallsOnTable;        
        const delta = remainingBallsBefore - remainingBalls;
        this.ChangePlayerScore(activePlayerState, delta);
        
        if(remainingBalls === 1 || remainingBalls === 0)
        {
            remainingBalls = 15;
        }

        state.GameState.RemainingBallsOnTable = remainingBalls;
    }

    public static ChangePlayerScore(activePlayerState: PlayerState, delta: number)
    {
        if(delta > 0)
        {
            activePlayerState.FoulCount = 0;
        }

        activePlayerState.CurrentScore += delta;
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
}