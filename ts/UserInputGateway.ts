class UserInputGateway{

    public static ShowDialog(dialogId: string)
    {
        GameViewManager.SetVisibilityOfDialog(dialogId, true);
    }

    public static HideDialog(dialogId: string, event: Event)
    {
        HtmlUtils.StopPropagation(event);
        GameViewManager.SetVisibilityOfDialog(dialogId, false);
    }

    public static ReturnToMenu(event: Event)
    {
        this.HideDialog("confirm_abort_dialog", event);
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
        HtmlUtils.StopPropagation(event);
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

    public static CaptureOutsideDialogClick(dialogId: string)
    {
        GameViewManager.SetVisibilityOfDialog(dialogId, false);
    }

    public static ReloadStoredState()
    {
        GameManager.ReloadStoredState();
    }
}