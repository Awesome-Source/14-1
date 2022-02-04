class GameViewManager
{
    public static HighlightActivePlayer(playerLabel: string){
        const player1ScoreElement = document.querySelector("#player1_score");
        const player2ScoreElement = document.querySelector("#player2_score");
        const player1NameElement = document.querySelector("#player1_name").parentElement;
        const player2NameElement = document.querySelector("#player2_name").parentElement;
    
        if(playerLabel === PlayerConstants.Player1)
        {   
            HtmlUtils.SwitchClass(player1ScoreElement, "w3-text-grey", "w3-text-orange");
            HtmlUtils.SwitchClass(player2ScoreElement, "w3-text-orange", "w3-text-grey");
            HtmlUtils.SwitchClass(player1NameElement, "w3-light-grey", "w3-blue");
            HtmlUtils.SwitchClass(player2NameElement, "w3-blue", "w3-light-grey");
            return;
        }
    
        HtmlUtils.SwitchClass(player1ScoreElement, "w3-text-orange", "w3-text-grey");
        HtmlUtils.SwitchClass(player2ScoreElement, "w3-text-grey", "w3-text-orange");
        HtmlUtils.SwitchClass(player1NameElement, "w3-blue", "w3-light-grey");
        HtmlUtils.SwitchClass(player2NameElement, "w3-light-grey", "w3-blue"); 
    }

    public static SetVisibilityOfRemainingBallsDialog(isVisible: boolean)
    {
        const displayValue = isVisible ? "block" : "none";
        document.getElementById('remaining_balls_selection_dialog').style.display= displayValue;
    }

    public static SetRemainingBallsDisplayValue(value: number)
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

    public static UpdatePlayerNames(nameOfPlayer1: string,nameOfPlayer2: string)
    {
        HtmlUtils.SetInnerHtmlById("player1_name", nameOfPlayer1);
        HtmlUtils.SetInnerHtmlById("player2_name", nameOfPlayer2);
    }

    public static UpdateSeriesCounter(series: number)
    {
        HtmlUtils.SetInnerHtmlById("series_counter", "Serie: " + series);
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
}