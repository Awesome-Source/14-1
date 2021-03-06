class GameLogic
{
    public static SwitchPlayer(state: CompleteState)
    {
        const activePlayerState = StateHelper.GetActivePlayerState(state);
        const nextPlayerState = StateHelper.GetInactivePlayerState(state);

        this.UpdateHighestSeriesIfNecessary(activePlayerState);
        activePlayerState.PreviousScore = activePlayerState.CurrentScore;
        nextPlayerState.Take += 1;
        state.GameState.ActivePlayer = nextPlayerState.Label;
    }

    public static NewRack(state: CompleteState)
    {
        const activePlayerState = StateHelper.GetActivePlayerState(state);
        const remainingBallsUntilReRack = state.GameState.RemainingBallsOnTable - 1;
        this.ChangePlayerScore(activePlayerState, remainingBallsUntilReRack);
        state.GameState.RemainingBallsOnTable = 15;
    }

    public static ApplyFoulPoints(isBreakFoul: boolean, state: CompleteState)
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
        this.SwitchPlayer(state);
    }

    public static SetRemainingBalls(remainingBalls: number, state: CompleteState)
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

    public static ReplayActions(actions: GameAction[], state: CompleteState)
    {
        for(let i = 0; i < actions.length; i++)
        {
            const currentAction = actions[i];
            switch(currentAction.Id)
            {
                case ActionIds.Switch:
                    GameLogic.SwitchPlayer(state);
                    break;
                case ActionIds.SetRemainingBalls:
                    GameLogic.SetRemainingBalls(currentAction.Context, state);
                    break;
                case ActionIds.Foul:
                    GameLogic.ApplyFoulPoints(currentAction.Context === 1, state);
                    break;
                case ActionIds.NewRack:
                    GameLogic.NewRack(state);
                    break;
            }
        }
    }

    public static BuildHistory(actions: GameAction[], state: CompleteState)
    {
        const historyEntries: GameHistoryEntry[] = [];

        for(let i = 0; i < actions.length; i++)
        {
            const currentAction = actions[i];
            switch(currentAction.Id)
            {
                case ActionIds.Switch:
                    GameLogic.SwitchPlayer(state);
                    break;
                case ActionIds.SetRemainingBalls:
                    GameLogic.SetRemainingBalls(currentAction.Context, state);
                    break;
                case ActionIds.Foul:
                    GameLogic.ApplyFoulPoints(currentAction.Context === 1, state);
                    break;
                case ActionIds.NewRack:
                    GameLogic.NewRack(state);
                    break;
            }

            const activePlayerState = StateHelper.GetActivePlayerState(state);
            if(historyEntries.length === activePlayerState.Take - 1)
            {
                historyEntries.push(new GameHistoryEntry(activePlayerState.Take, "-", "-"));
            }

            if(activePlayerState.Label === PlayerConstants.Player1)
            {
                historyEntries[activePlayerState.Take - 1].CurrentScoreOfPlayer1 = "" + activePlayerState.CurrentScore;
            }else{
                historyEntries[activePlayerState.Take - 1].CurrentScoreOfPlayer2 = "" + activePlayerState.CurrentScore;
            }

        }

        return historyEntries;
    }

    private static ChangePlayerScore(activePlayerState: PlayerState, delta: number)
    {
        if(delta > 0)
        {
            activePlayerState.FoulCount = 0;
        }

        activePlayerState.CurrentScore += delta;
    }

    private static UpdateHighestSeriesIfNecessary(playerState: PlayerState)
    {
        const currentSeries = playerState.CurrentScore - playerState.PreviousScore;

        if(currentSeries > playerState.HighestSeries)
        {
            playerState.HighestSeries = currentSeries;
        }
    }
}