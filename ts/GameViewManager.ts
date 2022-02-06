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

    public static UpdateTakeDisplay(takesOfPlayer1: number, takesOfPlayer2: number)
    {
        HtmlUtils.SetInnerHtmlById("player1_take", "A: " + takesOfPlayer1);
        HtmlUtils.SetInnerHtmlById("player2_take", "A: " + takesOfPlayer2);
    }

    public static UpdateHighestSeriesDisplay(highestSeriesOfPlayer1: number, highestSeriesOfPlayer2: number)
    {
        HtmlUtils.SetInnerHtmlById("player1_highest", "H: " + highestSeriesOfPlayer1);
        HtmlUtils.SetInnerHtmlById("player2_highest", "H: " + highestSeriesOfPlayer2);
    }

    public static UpdatePlayerScoreDisplay(scoreOfPlayer1: number, scoreOfPlayer2: number)
    {
        HtmlUtils.SetInnerHtmlById("player1_score", "" + scoreOfPlayer1);
        HtmlUtils.SetInnerHtmlById("player2_score", "" + scoreOfPlayer2);
    }

    public static UpdatePlayerAverageDisplay(averageOfPlayer1: number, averageOfPlayer2: number)
    {
        HtmlUtils.SetInnerHtmlById("player1_average", "Ø: " + averageOfPlayer1.toFixed(2));
        HtmlUtils.SetInnerHtmlById("player2_average", "Ø: " + averageOfPlayer2.toFixed(2));
    }

    public static UpdateRemainingBallsOfPlayerDisplay(remainingBallsOfPlayer1: number, remainingBallsOfPlayer2: number)
    {
        HtmlUtils.SetInnerHtmlById("player1_remaining", "R: " + remainingBallsOfPlayer1);
        HtmlUtils.SetInnerHtmlById("player2_remaining", "R: " + remainingBallsOfPlayer2);
    }

    public static UpdatePlayerNames(nameOfPlayer1: string, nameOfPlayer2: string)
    {
        HtmlUtils.SetInnerHtmlById("player1_name", nameOfPlayer1);
        HtmlUtils.SetInnerHtmlById("player2_name", nameOfPlayer2);
    }

    public static UpdateSeriesCounter(playerLabel: string, series: number)
    {
        const elementId = playerLabel == PlayerConstants.Player1 ? "player1_series_counter" : "player2_series_counter";
        HtmlUtils.SetInnerHtmlById(elementId, "Serie: " + series);
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