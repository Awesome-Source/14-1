class GameManager
{
    public static ReturnToMenu()
    {
        LocalStorageManager.StoreGameState(LocalStorageConstants.GameStateNoGame);
        this.ShowViewDependingOnGameState();
    }

    public static CreateNewGame()
    {
        this.SetActivePlayer(PlayerConstants.Player1);
        LocalStorageManager.StoreAmountOfRemainingBallsOnTable(15);
        GameViewManager.UnlockControls();
        const startGameInfo = GameViewManager.ExtractStartGameInfo();
        
        if(startGameInfo === null)
        {
            return;
        }

        const player1State = new PlayerState(startGameInfo.NameOfPlayer1);
        const player2State = new PlayerState(startGameInfo.NameOfPlayer2);
        player1State.Take = 1;
        LocalStorageManager.StorePlayerState(PlayerConstants.Player1, player1State);
        LocalStorageManager.StorePlayerState(PlayerConstants.Player2, player2State);

        LocalStorageManager.StoreTargetScore(startGameInfo.TargetScore);
        LocalStorageManager.StoreGameState(LocalStorageConstants.GameStateInProgress);

        this.ReloadStoredState();
        this.ShowViewDependingOnGameState();
    }

    public static ShowViewDependingOnGameState()
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
        const activePlayer = LocalStorageManager.GetActivePlayer();
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
    }

    public static Undo()
    {
        //TODO implement (remember to lock / unlock the button)
    }

    public static NewRack()
    {
        this.ChangePlayerScore(LocalStorageManager.GetActivePlayer(), 14);
        this.UpdateView();
    }

    public static Foul()
    {
        const activePlayer = LocalStorageManager.GetActivePlayer();
        const activePlayerState = LocalStorageManager.GetPlayerState(activePlayer);

        if(activePlayerState.Take === 1)
        {
            GameViewManager.SetVisibilityOfElement("break_foul_dialog", true);
            return;
        }

        this.HandleNormalFoul();
    }

    public static HandleBreakFoul()
    {
        const activePlayer = LocalStorageManager.GetActivePlayer();
        const activePlayerState = LocalStorageManager.GetPlayerState(activePlayer);
        activePlayerState.FoulCount += 1;
        this.ApplyFoulPoints(activePlayer, activePlayerState, -2);
    }

    public static HandleNormalFoul()
    {
        const activePlayer = LocalStorageManager.GetActivePlayer();
        const activePlayerState = LocalStorageManager.GetPlayerState(activePlayer);
        activePlayerState.FoulCount += 1;

        if(activePlayerState.FoulCount % 3 === 0)
        {
            this.ApplyFoulPoints(activePlayer, activePlayerState, -16);
            return;
        }

        this.ApplyFoulPoints(activePlayer, activePlayerState, -1);  
    }

    public static ApplyFoulPoints(activePlayer: string, playerState: PlayerState, negativePoints: number)
    {
        playerState.CurrentScore += negativePoints;
        LocalStorageManager.StorePlayerState(activePlayer, playerState);
        this.UpdateView();
        this.SwitchPlayer();
    }

    public static ReloadStoredState()
    {
        if(!LocalStorageManager.IsStorageVersionUpToDate())
        {
            alert("Der gespeicherte Zustand ist nicht mit der aktuellen Version kompatibel.");
            LocalStorageManager.Clear();
        }

        LocalStorageManager.StoreStorageVersion();
        this.ShowViewDependingOnGameState();

        if(!LocalStorageManager.IsGameInProgress())
        {
            return;
        }

        const playerState1 = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        const playerState2 = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);
        GameViewManager.UpdatePlayerNames(playerState1.Name, playerState2.Name);
        this.UpdateView();        
        this.SetActivePlayer(LocalStorageManager.GetActivePlayer());
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
        LocalStorageManager.StoreActivePlayer(playerLabel);
        GameViewManager.HighlightActivePlayer(playerLabel);  
    }

    public static SetRemainingBalls(remainingBalls: number)
    {
        const remainingBallsBefore = LocalStorageManager.GetAmountOfRemainingBallsOnTable();
        
        const delta = remainingBallsBefore - remainingBalls;
        this.ChangePlayerScore(LocalStorageManager.GetActivePlayer(), delta);
        
        if(remainingBalls === 1 || remainingBalls === 0)
        {
            remainingBalls = 15;
        }

        LocalStorageManager.StoreAmountOfRemainingBallsOnTable(remainingBalls);
        this.UpdateView();
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
        const remainingBallsBefore = LocalStorageManager.GetAmountOfRemainingBallsOnTable();
        const remainingBalls = remainingBallsBefore + delta;

        if(remainingBalls > 15)
        {
            return;
        }

        this.SetRemainingBalls(remainingBalls);    
    }

    public static UpdateView()
    {
        const targetScore = LocalStorageManager.GetTargetScore();
        const remainingBallsOnTable = LocalStorageManager.GetAmountOfRemainingBallsOnTable();
        const playerState1 = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        const playerState2 = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);        

        GameViewManager.SetRemainingBallsOnTableDisplayValue(remainingBallsOnTable);

        this.UpdateViewForPlayer(PlayerConstants.Player1, playerState1, targetScore)
        this.UpdateViewForPlayer(PlayerConstants.Player2, playerState2, targetScore)
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
}