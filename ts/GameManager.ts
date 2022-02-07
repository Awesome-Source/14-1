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

        const gameState = new GameState(PlayerConstants.Player1, startGameInfo.TargetScore, 15);
        LocalStorageManager.StoreGameState(gameState);

        GameViewManager.HighlightActivePlayer(PlayerConstants.Player1);  
        GameViewManager.UnlockControls();

        const player1State = new PlayerState(startGameInfo.NameOfPlayer1, PlayerConstants.Player1);
        const player2State = new PlayerState(startGameInfo.NameOfPlayer2, PlayerConstants.Player2);
        player1State.Take = 1;
        LocalStorageManager.StorePlayerState(PlayerConstants.Player1, player1State);
        LocalStorageManager.StorePlayerState(PlayerConstants.Player2, player2State);
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
        const gameState = LocalStorageManager.GetGameState();
        const playerState1 = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        const playerState2 = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);

        this.SwitchPlayerInternal(gameState, playerState1, playerState2);

        LocalStorageManager.StorePlayerState(playerState1.Label, playerState1);
        LocalStorageManager.StorePlayerState(playerState2.Label, playerState2);
        LocalStorageManager.StoreGameState(gameState);        
        GameViewManager.HighlightActivePlayer(gameState.ActivePlayer);
        this.UpdateView();
        this.RecordAction(ActionIds.Switch, 0);
    }

    private static SwitchPlayerInternal(gameState: GameState, playerState1: PlayerState, playerState2: PlayerState)
    {
        const activePlayerState = gameState.ActivePlayer === PlayerConstants.Player1 ? playerState1 : playerState2;
        const nextPlayerState = gameState.ActivePlayer === PlayerConstants.Player1 ? playerState2 : playerState1;        

        this.UpdateHighestSeriesIfNecessary(activePlayerState);
        activePlayerState.PreviousScore = activePlayerState.CurrentScore;
        nextPlayerState.Take += 1;
        gameState.ActivePlayer = nextPlayerState.Label;
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
        const playerState1Before = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        const playerState2Before = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);
        const gameStateBefore = LocalStorageManager.GetGameState();

        const playerState1 = new PlayerState(playerState1Before.Name, PlayerConstants.Player1);
        const playerState2 = new PlayerState(playerState2Before.Name, PlayerConstants.Player2);
        const gameState = new GameState(PlayerConstants.Player1, gameStateBefore.TargetScore, 15);

        for(let i = 0; i < actions.length; i++)
        {
            const currentAction = actions[i];
            switch(currentAction.Id)
            {
                case ActionIds.Switch:
                    this.SwitchPlayerInternal(gameState, playerState1, playerState2);
                    break;
                case ActionIds.SetRemainingBalls:
                    this.SetRemainingBallsInternal(currentAction.Context, gameState, playerState1, playerState2);
                    break;
                case ActionIds.Foul:
                    this.ApplyFoulPointsInternal(currentAction.Context === 1, gameState, playerState1, playerState2);
                    break;
                case ActionIds.NewRack:
                    this.NewRackInternal(gameState, playerState1, playerState2);
                    break;
            }
        }

        LocalStorageManager.StoreGameState(gameState);
        LocalStorageManager.StorePlayerState(playerState1.Label, playerState1);
        LocalStorageManager.StorePlayerState(playerState2.Label, playerState2);
        this.UpdateView();
        GameViewManager.HighlightActivePlayer(gameState.ActivePlayer);
    }

    public static NewRack()
    {
        const gameState = LocalStorageManager.GetGameState();
        const playerState1 = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        const playerState2 = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);

        this.NewRackInternal(gameState, playerState1, playerState2);
        
        LocalStorageManager.StorePlayerState(playerState1.Label, playerState1);
        LocalStorageManager.StorePlayerState(playerState2.Label, playerState2);
        this.UpdateView();
        this.RecordAction(ActionIds.NewRack, 0);
    }

    private static NewRackInternal(gameState: GameState, playerState1: PlayerState, playerState2: PlayerState)
    {
        const activePlayerState = gameState.ActivePlayer === PlayerConstants.Player1 ? playerState1 : playerState2;
        this.ChangePlayerScore(activePlayerState, 14);
    }

    public static Foul()
    {
        const gameState = LocalStorageManager.GetGameState();
        const activePlayerState = LocalStorageManager.GetPlayerState(gameState.ActivePlayer);

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
        const gameState = LocalStorageManager.GetGameState();

        const playerState1 = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        const playerState2 = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);
        
        this.ApplyFoulPointsInternal(isBreakFoul, gameState, playerState1, playerState2);

        LocalStorageManager.StorePlayerState(playerState1.Label, playerState1);
        LocalStorageManager.StorePlayerState(playerState2.Label, playerState2);
        LocalStorageManager.StoreGameState(gameState);
        GameViewManager.HighlightActivePlayer(gameState.ActivePlayer);
        this.UpdateView();
        this.RecordAction(ActionIds.Foul, isBreakFoul ? 1 : 0);
    }

    private static ApplyFoulPointsInternal(isBreakFoul: boolean, gameState: GameState, playerState1: PlayerState, playerState2: PlayerState)
    {
        const activePlayerState = gameState.ActivePlayer === PlayerConstants.Player1 ? playerState1 : playerState2;
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
        this.SwitchPlayerInternal(gameState, playerState1, playerState2);
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

        const playerState1 = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        const playerState2 = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);
        GameViewManager.UpdatePlayerNames(playerState1.Name, playerState2.Name);
        this.UpdateView();
        const gameState = LocalStorageManager.GetGameState();
        GameViewManager.HighlightActivePlayer(gameState.ActivePlayer);  
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
        const gameState = LocalStorageManager.GetGameState();
        const playerState1 = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        const playerState2 = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);

        this.SetRemainingBallsInternal(remainingBalls, gameState, playerState1, playerState2);

        LocalStorageManager.StoreGameState(gameState)
        LocalStorageManager.StorePlayerState(playerState1.Label, playerState1);
        LocalStorageManager.StorePlayerState(playerState2.Label, playerState2);
        this.UpdateView();
        this.RecordAction(ActionIds.SetRemainingBalls, remainingBalls);
    }

    private static SetRemainingBallsInternal(remainingBalls: number, gameState: GameState, playerState1: PlayerState, playerState2: PlayerState)
    {
        const activePlayerState = gameState.ActivePlayer === PlayerConstants.Player1 ? playerState1 : playerState2;

        const remainingBallsBefore = gameState.RemainingBallsOnTable;        
        const delta = remainingBallsBefore - remainingBalls;
        this.ChangePlayerScore(activePlayerState, delta);
        
        if(remainingBalls === 1 || remainingBalls === 0)
        {
            remainingBalls = 15;
        }

        gameState.RemainingBallsOnTable = remainingBalls;
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
        const gameState = LocalStorageManager.GetGameState();
        const remainingBallsBefore = gameState.RemainingBallsOnTable;
        const remainingBalls = remainingBallsBefore + delta;

        if(remainingBalls > 15)
        {
            return;
        }

        this.SetRemainingBalls(remainingBalls);    
    }

    public static UpdateView()
    {
        const gameState = LocalStorageManager.GetGameState();
        const playerState1 = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        const playerState2 = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);        

        GameViewManager.SetRemainingBallsOnTableDisplayValue(gameState.RemainingBallsOnTable);

        this.UpdateViewForPlayer(PlayerConstants.Player1, playerState1, gameState.TargetScore)
        this.UpdateViewForPlayer(PlayerConstants.Player2, playerState2, gameState.TargetScore)
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