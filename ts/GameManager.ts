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

        const player1State = new PlayerState(startGameInfo.NameOfPlayer1);
        const player2State = new PlayerState(startGameInfo.NameOfPlayer2);
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
        const activePlayer = gameState.ActivePlayer;
        const nextPlayer = activePlayer === PlayerConstants.Player1 ? PlayerConstants.Player2 : PlayerConstants.Player1;

        const activePlayerState = LocalStorageManager.GetPlayerState(activePlayer);
        const nextPlayerState = LocalStorageManager.GetPlayerState(nextPlayer);

        this.UpdateHighestSeriesIfNecessary(activePlayerState);
        activePlayerState.PreviousScore = activePlayerState.CurrentScore;
        nextPlayerState.Take += 1;
        LocalStorageManager.StorePlayerState(activePlayer, activePlayerState);
        LocalStorageManager.StorePlayerState(nextPlayer, nextPlayerState);
        this.SetActivePlayer(nextPlayer);
        this.UpdateView();
        this.RecordAction(ActionIds.Switch, 0);
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
        /*const playerState1Before = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        const playerState2Before = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);
        const gameStateBefore = LocalStorageManager.GetGameState();

        const playerState1 = new PlayerState(playerState1Before.Name);
        const playerState2 = new PlayerState(playerState2Before.Name);
        const gameState = new GameState(PlayerConstants.Player1, gameStateBefore.TargetScore, 15);*/

        for(let i = 0; i < actions.length; i++)
        {
            const currentAction = actions[i];
            switch(currentAction.Id)
            {
                case ActionIds.Switch:
                    break;
                case ActionIds.SetRemainingBalls:
                    break;
                case ActionIds.Foul:
                    break;
                case ActionIds.NewRack:
                    break;
            }
        }        
    }

    public static NewRack()
    {
        const gameState = LocalStorageManager.GetGameState();
        this.ChangePlayerScore(gameState.ActivePlayer, 14);
        this.UpdateView();
        this.RecordAction(ActionIds.NewRack, 0);
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
        const gameState = LocalStorageManager.GetGameState();
        const activePlayerState = LocalStorageManager.GetPlayerState(gameState.ActivePlayer);
        activePlayerState.FoulCount += 1;
        this.ApplyFoulPoints(gameState.ActivePlayer, activePlayerState, -2);
    }

    public static HandleNormalFoul()
    {
        const gameState = LocalStorageManager.GetGameState();
        const activePlayerState = LocalStorageManager.GetPlayerState(gameState.ActivePlayer);
        activePlayerState.FoulCount += 1;

        if(activePlayerState.FoulCount % 3 === 0)
        {
            this.ApplyFoulPoints(gameState.ActivePlayer, activePlayerState, -16);
            return;
        }

        this.ApplyFoulPoints(gameState.ActivePlayer, activePlayerState, -1);  
    }

    public static ApplyFoulPoints(activePlayer: string, playerState: PlayerState, negativePoints: number)
    {
        playerState.CurrentScore += negativePoints;
        LocalStorageManager.StorePlayerState(activePlayer, playerState);
        this.UpdateView();
        this.SwitchPlayer();
        this.RecordAction(ActionIds.Foul, negativePoints);
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
        this.SetActivePlayer(gameState.ActivePlayer);
    }

    public static UpdateHighestSeriesIfNecessary(playerState: PlayerState)
    {
        const currentSeries = playerState.CurrentScore - playerState.PreviousScore;

        if(currentSeries > playerState.HighestSeries)
        {
            playerState.HighestSeries = currentSeries;
        }
    }

    public static SetActivePlayer(playerLabel: string)
    {
        const gameState = LocalStorageManager.GetGameState();
        gameState.ActivePlayer = playerLabel;
        LocalStorageManager.StoreGameState(gameState);
        GameViewManager.HighlightActivePlayer(playerLabel);  
    }

    public static SetRemainingBalls(remainingBalls: number)
    {
        const gameState = LocalStorageManager.GetGameState();
        const remainingBallsBefore = gameState.RemainingBallsOnTable;
        
        const delta = remainingBallsBefore - remainingBalls;
        this.ChangePlayerScore(gameState.ActivePlayer, delta);
        
        if(remainingBalls === 1 || remainingBalls === 0)
        {
            remainingBalls = 15;
        }

        gameState.RemainingBallsOnTable = remainingBalls;
        LocalStorageManager.StoreGameState(gameState)
        this.UpdateView();
        this.RecordAction(ActionIds.SetRemainingBalls, delta);
    }

    public static ChangePlayerScore(playerLabel: string, delta: number)
    {
        const playerState = LocalStorageManager.GetPlayerState(playerLabel);

        if(delta > 0)
        {
            playerState.FoulCount = 0;
        }

        playerState.CurrentScore += delta;
        LocalStorageManager.StorePlayerState(playerLabel, playerState);
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