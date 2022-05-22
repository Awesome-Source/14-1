class UserInputGateway{

    public static ShowDialog(dialogId: string)
    {
        GameViewManager.SetVisibilityOfElement(dialogId, true);
    }

    public static ShowDetailsDialog()
    {
        GameManager.FillDetailsDialog();
        UserInputGateway.ShowDialog("details_dialog");
    }

    public static HideDialog(dialogId: string, event: Event)
    {
        HtmlUtils.StopPropagation(event);
        GameViewManager.SetVisibilityOfElement(dialogId, false);
    }

    public static StopPropagation(event: Event)
    {
        HtmlUtils.StopPropagation(event);
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
        GameViewManager.SetVisibilityOfElement("remaining_balls_selection_dialog", false);
        GameManager.SetRemainingBalls(remainingBalls);
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
        GameViewManager.SetVisibilityOfElement(dialogId, false);
    }

    public static ReloadStoredState()
    {
        GameManager.ReloadStoredState();
    }

    public static HandleBreakFoul()
    {
        GameViewManager.SetVisibilityOfElement("break_foul_dialog", false);
        GameManager.HandleBreakFoul();
    }

    public static HandleNormalFoul()
    {
        GameViewManager.SetVisibilityOfElement("break_foul_dialog", false);
        GameManager.HandleNormalFoul();
    }
}