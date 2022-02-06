class GameViewManager
{
    public static HighlightActivePlayer(playerLabel: string){
        const player1ScoreElement = document.getElementById("player1_score");
        const player2ScoreElement = document.getElementById("player2_score");
        const player1NameElement = document.getElementById("player1_name").parentElement;
        const player2NameElement = document.getElementById("player2_name").parentElement;
        const player1SeriesElement = document.getElementById("player1_series_counter").parentElement;
        const player2SeriesElement = document.getElementById("player2_series_counter").parentElement;
    
        if(playerLabel === PlayerConstants.Player1)
        {   
            HtmlUtils.SwitchClass(player1ScoreElement, "w3-text-grey", "w3-text-orange");
            HtmlUtils.SwitchClass(player2ScoreElement, "w3-text-orange", "w3-text-grey");
            HtmlUtils.SwitchClass(player1NameElement, "w3-light-grey", "w3-blue");
            HtmlUtils.SwitchClass(player2NameElement, "w3-blue", "w3-light-grey");
            player1SeriesElement.classList.remove("w3-hide");
            player2SeriesElement.classList.add("w3-hide");
            return;
        }
    
        HtmlUtils.SwitchClass(player1ScoreElement, "w3-text-orange", "w3-text-grey");
        HtmlUtils.SwitchClass(player2ScoreElement, "w3-text-grey", "w3-text-orange");
        HtmlUtils.SwitchClass(player1NameElement, "w3-blue", "w3-light-grey");
        HtmlUtils.SwitchClass(player2NameElement, "w3-light-grey", "w3-blue");
        player1SeriesElement.classList.add("w3-hide");
        player2SeriesElement.classList.remove("w3-hide");
    }

    public static SetVisibilityOfElement(elementId: string, isVisible: boolean)
    {
        const displayValue = isVisible ? "block" : "none";
        document.getElementById(elementId).style.display = displayValue;
    }

    public static SetRemainingBallsOnTableDisplayValue(value: number)
    {
        HtmlUtils.SetInnerHtmlById("remaining_balls_display", "" + value);
    }

    public static UpdatePlayerNames(nameOfPlayer1: string, nameOfPlayer2: string)
    {
        HtmlUtils.SetInnerHtmlById("player1_name", nameOfPlayer1);
        HtmlUtils.SetInnerHtmlById("player2_name", nameOfPlayer2);
    }

    public static UpdatePlayerStateDetails(playerLabel: string, playerState: PlayerState)
    {
        HtmlUtils.SetInnerHtmlById(playerLabel + "_highest", "H: " + playerState.HighestSeries);
        HtmlUtils.SetInnerHtmlById(playerLabel + "_take", "A: " + playerState.Take);
        HtmlUtils.SetInnerHtmlById(playerLabel + "_score", "" + playerState.CurrentScore);
    }

    public static UpdateCalculatedPlayerDetails(playerLabel: string, remainingBalls: number, average: number, series: number)
    {
        HtmlUtils.SetInnerHtmlById(playerLabel + "_remaining", "R: " + remainingBalls);
        HtmlUtils.SetInnerHtmlById(playerLabel + "_average", "Ø: " + average.toFixed(2));
        HtmlUtils.SetInnerHtmlById(playerLabel + "_series_counter", "Serie: " + series);
    }

    public static ShowGameView()
    {
        HtmlUtils.ShowElementById("game_view");
        HtmlUtils.HideElementById("menu_view");
    }

    public static ShowMenuView()
    {
        HtmlUtils.ShowElementById("menu_view");
        HtmlUtils.HideElementById("game_view");
    }

    public static ShowWinDialog(nameOfWinner: string)
    {
        HtmlUtils.SetInnerHtmlById("win_dialog_text", nameOfWinner + " hat das Spiel gewonnen.")
        this.SetVisibilityOfElement("win_dialog", true);
        this.LockControls();
    }

    private static LockControls()
    {
        const controls = this.GetLockableButtons();
        controls.forEach(c => c.disabled = true);
    }

    public static UnlockControls()
    {
        const controls = this.GetLockableButtons();
        controls.forEach(c => c.disabled = false);
    }

    private static GetLockableButtons()
    {
        const classNames = [".switch-player", ".remaining-balls", ".new-rack", ".minus", ".plus", ".foul"];

        return classNames.map(cn => <HTMLButtonElement> document.querySelector(cn));
    }

    public static ExtractStartGameInfo()
    {
        const nameOfPlayer1 = HtmlUtils.GetInputFromElementWithId("menu_player1_name");
        const nameOfPlayer2 = HtmlUtils.GetInputFromElementWithId("menu_player2_name");
        const targetScoreString = HtmlUtils.GetInputFromElementWithId("menu_target_score");

        if(nameOfPlayer1 === "")
        {
            alert("Bitte einen Namen für Spieler 1 eingeben.");
            return null;
        }

        if(nameOfPlayer2 === "")
        {
            alert("Bitte einen Namen für Spieler 2 eingeben.");
            return null;
        }

        if(!Validator.IsNumeric(targetScoreString))
        {
            alert("Bitte eine gültige Zahl für die Zielpunktzahl eingeben.");
            return null;
        }

        const targetScore = Number(targetScoreString);

        if(targetScore < 20 || targetScore > 200)
        {
            alert("Bitte eine gültige Zahl für die Zielpunktzahl eingeben.");
            return null;
        }

        return new StartGameInfo(nameOfPlayer1, nameOfPlayer2, targetScore);
    }
}