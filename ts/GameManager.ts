class GameManager
{
    public static ReturnToMenu()
    {
        LocalStorageManager.StoreGameState(LocalStorageConstants.GameStateNoGame);
        this.ShowViewDependingOnGameState();
    }

    public static CreateNewGame()
    {
        this.ResetGame();
        const startGameInfo = GameViewManager.ExtractStartGameInfo();
        
        if(startGameInfo === null)
        {
            return;
        }

        LocalStorageManager.StorePlayerName(PlayerConstants.Player1, startGameInfo.NameOfPlayer1);
        LocalStorageManager.StorePlayerName(PlayerConstants.Player2, startGameInfo.NameOfPlayer2);
        LocalStorageManager.StoreTargetScore(startGameInfo.TargetScore);
        LocalStorageManager.StoreGameState(LocalStorageConstants.GameStateInProgress);
        LocalStorageManager.StoreFoulCountOfPlayer(PlayerConstants.Player1, 0);
        LocalStorageManager.StoreFoulCountOfPlayer(PlayerConstants.Player2, 0);
        LocalStorageManager.StoreTakeOfPlayer(PlayerConstants.Player1, 1);
        LocalStorageManager.StoreTakeOfPlayer(PlayerConstants.Player2, 0);
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

        this.UpdateHighestSeriesIfNecessary(activePlayer);
        LocalStorageManager.StorePreviousScoreOfPlayer(activePlayer, LocalStorageManager.GetCurrentScoreOfPlayer(activePlayer));
        this.SetActivePlayer(nextPlayer);
        const takeOfPlayer = LocalStorageManager.GetTakeOfPlayer(nextPlayer);
        LocalStorageManager.StoreTakeOfPlayer(nextPlayer, takeOfPlayer + 1);
        this.UpdateDetails();
        this.UpdateTakeDisplayToStoredValues();
        GameViewManager.UpdateSeriesCounter(0);
    }

    public static UpdateTakeDisplayToStoredValues()
    {
        const takesOfPlayer1 = LocalStorageManager.GetTakeOfPlayer(PlayerConstants.Player1);
        const takesOfPlayer2 = LocalStorageManager.GetTakeOfPlayer(PlayerConstants.Player2);
        GameViewManager.UpdateTakeDisplay(takesOfPlayer1, takesOfPlayer2);
    }

    public static SetRemainingBallsFromDialog(remainingBalls: number)
    {
        GameViewManager.SetVisibilityOfDialog("remaining_balls_selection_dialog", false);
        this.SetRemainingBalls(remainingBalls);
    }

    public static Undo()
    {
        //TODO implement
    }

    public static NewRack()
    {
        this.ChangePlayerScore(LocalStorageManager.GetActivePlayer(), 14);
        this.UpdateDetails();
    }

    public static Foul()
    {
        const activePlayer = LocalStorageManager.GetActivePlayer();
        const currentScore = LocalStorageManager.GetCurrentScoreOfPlayer(activePlayer);
        const takeOfPlayer = LocalStorageManager.GetTakeOfPlayer(activePlayer);
        let foulCount = LocalStorageManager.GetFoulCountOfPlayer(activePlayer);
        foulCount++;

        let negativePoints = -1;

        if(takeOfPlayer === 1)
        {
            if(confirm("Wenn es sich um ein Foul beim Break handelt bestätigen Sie mit Ok."))
            {
                negativePoints = -2;
            }
        }    

        if(foulCount % 3 === 0)
        {
            negativePoints = -16;
        }

        LocalStorageManager.StoreFoulCountOfPlayer(activePlayer, foulCount);
        LocalStorageManager.StoreCurrentScoreOfPlayer(activePlayer, currentScore + negativePoints);
        this.SetPlayerScoreValuesToStoredValues();
        this.UpdateDetails();
        this.SwitchPlayer();
    }

    public static ReloadStoredState()
    {
        this.ShowViewDependingOnGameState();

        if(!LocalStorageManager.IsGameInProgress())
        {
            return;
        }

        const nameOfPlayer1 = LocalStorageManager.GetPlayerName(PlayerConstants.Player1);
        const nameOfPlayer2 = LocalStorageManager.GetPlayerName(PlayerConstants.Player2);
        GameViewManager.UpdatePlayerNames(nameOfPlayer1, nameOfPlayer2);
        this.SetPlayerScoreValuesToStoredValues();

        this.UpdateTakeDisplayToStoredValues();
        this.UpdateDetails();

        GameViewManager.SetRemainingBallsDisplayValue(LocalStorageManager.GetAmountOfRemainingBallsOnTable());
        this.SetActivePlayer(LocalStorageManager.GetActivePlayer());
    }

    public static ResetGame()
    {
        LocalStorageManager.StoreCurrentScoreOfPlayer(PlayerConstants.Player1, 0);
        LocalStorageManager.StoreCurrentScoreOfPlayer(PlayerConstants.Player2, 0);
        LocalStorageManager.StorePreviousScoreOfPlayer(PlayerConstants.Player1, 0);
        LocalStorageManager.StorePreviousScoreOfPlayer(PlayerConstants.Player2, 0);
        LocalStorageManager.StoreHighestSeriesOfPlayer(PlayerConstants.Player1, 0);
        LocalStorageManager.StoreHighestSeriesOfPlayer(PlayerConstants.Player2, 0);
        this.SetActivePlayer(PlayerConstants.Player1);
        LocalStorageManager.StoreAmountOfRemainingBallsOnTable(15);
    }

    public static UpdateHighestSeriesIfNecessary(playerLabel: string)
    {
        const previousScore = LocalStorageManager.GetPreviousScoreOfPlayer(playerLabel);
        const currentScore = LocalStorageManager.GetCurrentScoreOfPlayer(playerLabel);
        const highestSeriesBefore = LocalStorageManager.GetHighestSeriesOfPlayer(playerLabel);
        const currentSeries = currentScore - previousScore;

        if(currentSeries > highestSeriesBefore)
        {
            LocalStorageManager.StoreHighestSeriesOfPlayer(playerLabel, currentSeries);
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
        GameViewManager.SetRemainingBallsDisplayValue(remainingBalls);
        this.UpdateDetails();
    }

    public static ChangePlayerScore(playerLabel: string, delta: number)
    {
        if(delta > 0)
        {
            LocalStorageManager.StoreFoulCountOfPlayer(playerLabel, 0);
        }

        let playerScore = LocalStorageManager.GetCurrentScoreOfPlayer(playerLabel);
        playerScore += delta;
        LocalStorageManager.StoreCurrentScoreOfPlayer(playerLabel, playerScore);
        this.SetPlayerScoreValuesToStoredValues();
    }

    public static SetPlayerScoreValuesToStoredValues()
    {
        const scoreOfPlayer1 = LocalStorageManager.GetCurrentScoreOfPlayer(PlayerConstants.Player1);
        const scoreOfPlayer2 = LocalStorageManager.GetCurrentScoreOfPlayer(PlayerConstants.Player2);

        GameViewManager.UpdatePlayerScoreDisplay(scoreOfPlayer1, scoreOfPlayer2);
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

    public static UpdateDetails()
    {
        const targetScore = LocalStorageManager.GetTargetScore();
        const scoreOfPlayer1 = LocalStorageManager.GetCurrentScoreOfPlayer(PlayerConstants.Player1);
        const scoreOfPlayer2 = LocalStorageManager.GetCurrentScoreOfPlayer(PlayerConstants.Player2);
        const previousScoreOfPlayer1 = LocalStorageManager.GetPreviousScoreOfPlayer(PlayerConstants.Player1);
        const previousScoreOfPlayer2 = LocalStorageManager.GetPreviousScoreOfPlayer(PlayerConstants.Player2);
        const takeOfPlayer1 = LocalStorageManager.GetTakeOfPlayer(PlayerConstants.Player1);
        const takeOfPlayer2 = LocalStorageManager.GetTakeOfPlayer(PlayerConstants.Player2);
        const highestSeriesOfPlayer1 = LocalStorageManager.GetHighestSeriesOfPlayer(PlayerConstants.Player1);
        const highestSeriesOfPlayer2 = LocalStorageManager.GetHighestSeriesOfPlayer(PlayerConstants.Player2);

        const remainingBallsOfPlayer1 = Math.max(0, targetScore - scoreOfPlayer1);
        const remainingBallsOfPlayer2 = Math.max(0, targetScore - scoreOfPlayer2);
        const averageOfPlayer1 = scoreOfPlayer1 / Math.max(takeOfPlayer1, 1);
        const averageOfPlayer2 = scoreOfPlayer2 / Math.max(takeOfPlayer2, 1);

        GameViewManager.UpdateRemainingBallsOfPlayerDisplay(remainingBallsOfPlayer1, remainingBallsOfPlayer2);
        GameViewManager.UpdatePlayerAverageDisplay(averageOfPlayer1, averageOfPlayer2);
        GameViewManager.UpdateHighestSeriesDisplay(highestSeriesOfPlayer1, highestSeriesOfPlayer2);

        let series = 0;
        if(LocalStorageManager.GetActivePlayer() === PlayerConstants.Player1){
            series = scoreOfPlayer1 - previousScoreOfPlayer1;
        }else{
            series = scoreOfPlayer2 - previousScoreOfPlayer2;
        }

        GameViewManager.UpdateSeriesCounter(series);

        this.CheckWinCondition(remainingBallsOfPlayer1, remainingBallsOfPlayer2);
    }

    public static CheckWinCondition(remainingBallsOfPlayer1: number, remainingBallsOfPlayer2: number)
    {
        //TODO lock controls so no further game changing input can be made until the game is restarted.

        if(remainingBallsOfPlayer1 === 0)
        {
            alert(LocalStorageManager.GetPlayerName(PlayerConstants.Player1) + " hat das Spiel gewonnen.");
        }

        if(remainingBallsOfPlayer2 === 0)
        {
            alert(LocalStorageManager.GetPlayerName(PlayerConstants.Player2) + " hat das Spiel gewonnen.");
        }
    }
}