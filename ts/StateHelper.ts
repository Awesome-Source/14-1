class StateHelper
{
    //do not move these methods into the CompleteState class.
    //if the class is deserialized from a json string it is not recognized as instance of CompleteState and therefore doesn't have instance methods

    public static GetActivePlayerState(state: CompleteState)
    {
        return state.GameState.ActivePlayer === PlayerConstants.Player1 ? state.PlayerState1 : state.PlayerState2;
    }

    public static GetInactivePlayerState(state: CompleteState)
    {
        return state.GameState.ActivePlayer === PlayerConstants.Player1 ? state.PlayerState2 : state.PlayerState1;
    }
}