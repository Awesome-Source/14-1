class UserInputGateway{

    public static SetVisibilityOfRemainingBallsDialog(isVisible: boolean)
    {
        GameViewManager.SetVisibilityOfRemainingBallsDialog(isVisible);
    }

    public static ReturnToMenu()
    {
        GameManager.ReturnToMenu();
    }

    public static CreateNewGame()
    {
        GameManager.CreateNewGame();
    }

    public static SwitchPlayer()
    {
        GameManager.SwitchPlayer();
    }

    public static SetRemainingBallsFromDialog(remainingBalls: number, event: Event)
    {
        event = event || window.event;
        event.stopPropagation();
        GameManager.SetRemainingBallsFromDialog(remainingBalls);
    }

    public static Undo()
    {
        GameManager.Undo();
    }

    public static NewRack()
    {
        GameManager.NewRack();
    }

    public static IncrementOne()
    {
        GameManager.ChangeAmountOfRemainingBalls(1);
    }

    public static DecrementOne()
    {
        GameManager.ChangeAmountOfRemainingBalls(-1);
    }

    public static Foul()
    {
        GameManager.Foul();
    }

    public static SetVisibilityOfDetailsDialog(isVisible: boolean)
    {
        GameManager.SetVisibilityOfDetailsDialog(isVisible);
    }

    public static CaptureOutsideDialogClick()
    {
        GameViewManager.SetVisibilityOfRemainingBallsDialog(false);
    }

    public static ReloadStoredState()
    {
        GameManager.ReloadStoredState();
    }
}