const _player1Label = "player1";
const _player2Label = "player2";

function ReturnToMenu()
{
    if(!confirm("Soll das Spiel wirklich abgebrochen werden?"))
    {
        return;
    }

    StoreGameState(_gameStateNoGame);
    SetElementVisibilityDependingOnGameState();
}

function CreateNewGame()
{
    ResetGame();
    const nameOfPlayer1 = GetInputFromElementById("menu_player1_name");
    const nameOfPlayer2 = GetInputFromElementById("menu_player2_name");
    const targetScoreString = GetInputFromElementById("menu_target_score");

    if(nameOfPlayer1 === "")
    {
        alert("Bitte einen Namen für Spieler 1 eingeben.");
        return;
    }

    if(nameOfPlayer2 === "")
    {
        alert("Bitte einen Namen für Spieler 2 eingeben.");
        return;
    }

    if(!isNumeric(targetScoreString))
    {
        alert("Bitte eine gültige Zahl für die Zielpunktzahl eingeben.");
        return;
    }

    const targetScore = Number(targetScoreString);

    if(targetScore < 20 || targetScore > 200)
    {
        alert("Bitte eine gültige Zahl für die Zielpunktzahl eingeben.");
        return;
    }

    StorePlayerName(_player1Label, nameOfPlayer1);
    StorePlayerName(_player2Label, nameOfPlayer2);
    StoreTargetScore(targetScoreString);
    StoreGameState(_gameStateInProgress);
    StoreFoulCountOfPlayer(_player1Label, 0);
    StoreFoulCountOfPlayer(_player2Label, 0);
    StoreTakeOfPlayer(_player1Label, 1);
    StoreTakeOfPlayer(_player2Label, 0);
    ReloadStoredState();
    SetElementVisibilityDependingOnGameState();
}

function SetElementVisibilityDependingOnGameState()
{
    let isGameInProgress = IsGameInProgress();

    if(isGameInProgress)
    {
        ShowElementById("game_view");
        HideElementById("menu_view");
    }
    else
    {
        ShowElementById("menu_view");
        HideElementById("game_view");
    }
}

function ReloadStoredState()
{
    SetElementVisibilityDependingOnGameState();

    if(!IsGameInProgress())
    {
        return;
    }

    SetInnerHtmlById("player1_name", GetStoredPlayerName(_player1Label));
    SetInnerHtmlById("player2_name", GetStoredPlayerName(_player2Label));
    SetPlayerScoreValuesToStoredValues();

    UpdateTakeDisplayToStoredValues();
    UpdateDetails();

    SetRemainingBallsDisplayValue(GetStoredAmountOfRemainingBallsOnTable());
    SetActivePlayer(GetActivePlayer());
}

function ResetGame()
{
    SetCurrentScoreOfPlayer(_player1Label, 0);
    SetCurrentScoreOfPlayer(_player2Label, 0);
    SetPreviousScoreOfPlayer(_player1Label, 0);
    SetPreviousScoreOfPlayer(_player2Label, 0);
    SetHighestSeriesOfPlayer(_player1Label, 0);
    SetHighestSeriesOfPlayer(_player2Label, 0);
    SetActivePlayer(_player1Label);
    StoreAmountOfRemainingBallsOnTable(15);
}

function SetRemainingBallsDisplayValue(value: number)
{
    SetInnerHtmlById("remaining_balls_display", "" + value);
}

function SwitchPlayer()
{
    const activePlayer = GetActivePlayer();
    const nextPlayer = activePlayer === _player1Label ? _player2Label : _player1Label;

    UpdateHighestSeriesIfNecessary(activePlayer);
    SetPreviousScoreOfPlayer(activePlayer, GetCurrentScoreOfPlayer(activePlayer));
    SetActivePlayer(nextPlayer);
    const takeOfPlayer = GetStoredTakeOfPlayer(nextPlayer);
    StoreTakeOfPlayer(nextPlayer, takeOfPlayer + 1);
    UpdateTakeDisplayToStoredValues();
    SetInnerHtmlById("series_counter", "Serie: 0");
    UpdateHighestSeriesOfPlayersDisplayValues();
}

function UpdateHighestSeriesIfNecessary(playerLabel: string)
{
    const previousScore = GetPreviousScoreOfPlayer(playerLabel);
    const currentScore = GetCurrentScoreOfPlayer(playerLabel);
    const highestSeriesBefore = GetHighestSeriesOfPlayer(playerLabel);
    const currentSeries = currentScore - previousScore;

    if(currentSeries > highestSeriesBefore)
    {
        SetHighestSeriesOfPlayer(playerLabel, currentSeries);
    }
}

function UpdateTakeDisplayToStoredValues()
{
    SetInnerHtmlById("player1_take", "A: " + GetStoredTakeOfPlayer(_player1Label));
    SetInnerHtmlById("player2_take", "A: " + GetStoredTakeOfPlayer(_player2Label));
}

function SetActivePlayer(playerLabel: string)
{
    StoreActivePlayer(playerLabel);
    const player1ScoreElement = document.querySelector("#player1_score");
    const player2ScoreElement = document.querySelector("#player2_score");
    const player1NameElement = document.querySelector("#player1_name").parentElement;
    const player2NameElement = document.querySelector("#player2_name").parentElement;

    if(playerLabel === _player1Label)
    {   
        SwitchClass(player1ScoreElement, "w3-text-grey", "w3-text-orange");
        SwitchClass(player2ScoreElement, "w3-text-orange", "w3-text-grey");
        SwitchClass(player1NameElement, "w3-light-grey", "w3-blue");
        SwitchClass(player2NameElement, "w3-blue", "w3-light-grey");
        return;
    }

    SwitchClass(player1ScoreElement, "w3-text-orange", "w3-text-grey");
    SwitchClass(player2ScoreElement, "w3-text-grey", "w3-text-orange");
    SwitchClass(player1NameElement, "w3-blue", "w3-light-grey");
    SwitchClass(player2NameElement, "w3-light-grey", "w3-blue");    
}

function SetRemainingBallsFromDialog(remainingBalls: number, event: Event)
{
    event = event || window.event;
    event.stopPropagation();
    SetVisibilityOfRemainingBallsDialog(false);
    SetRemainingBalls(remainingBalls);
}

function SetRemainingBalls(remainingBalls: number)
{
    const remainingBallsBefore = GetStoredAmountOfRemainingBallsOnTable();
    
    const delta = remainingBallsBefore - remainingBalls;
    ChangePlayerScore(GetActivePlayer(), delta);
    
    if(remainingBalls === 1 || remainingBalls === 0)
    {
        remainingBalls = 15;
    }

    StoreAmountOfRemainingBallsOnTable(remainingBalls);
    SetRemainingBallsDisplayValue(remainingBalls);
    UpdateDetails();
}

function SetVisibilityOfRemainingBallsDialog(isVisible: boolean)
{
    const displayValue = isVisible ? "block" : "none";
    document.getElementById('remaining_balls_selection_dialog').style.display= displayValue;
}

function ChangePlayerScore(playerLabel: string, delta: number)
{
    if(delta > 0)
    {
        StoreFoulCountOfPlayer(playerLabel, 0);
    }

    let playerScore = GetCurrentScoreOfPlayer(playerLabel);
    playerScore += delta;
    SetCurrentScoreOfPlayer(playerLabel, playerScore);
    SetPlayerScoreValuesToStoredValues();
}

function SetPlayerScoreValuesToStoredValues()
{
    SetInnerHtmlById("player1_score", "" + GetCurrentScoreOfPlayer(_player1Label));
    SetInnerHtmlById("player2_score", "" + GetCurrentScoreOfPlayer(_player2Label));
}

function Undo()
{
    //TODO implement
}

function NewRack()
{
    ChangePlayerScore(GetActivePlayer(), 14);
    UpdateDetails();
}

function IncrementOne()
{
    ChangeAmountOfRemainingBalls(1);
}

function DecrementOne()
{
    ChangeAmountOfRemainingBalls(-1);
}

function ChangeAmountOfRemainingBalls(delta: number)
{
    const remainingBallsBefore = GetStoredAmountOfRemainingBallsOnTable();
    const remainingBalls = remainingBallsBefore + delta;

    if(remainingBalls > 15)
    {
        return;
    }

    SetRemainingBalls(remainingBalls);    
}

function Foul()
{
    const activePlayer = GetActivePlayer();
    const currentScore = GetCurrentScoreOfPlayer(activePlayer);
    const takeOfPlayer = GetStoredTakeOfPlayer(activePlayer);
    let foulCount = GetStoredFoulCountOfPlayer(activePlayer);
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

    StoreFoulCountOfPlayer(activePlayer, foulCount);
    SetCurrentScoreOfPlayer(activePlayer, currentScore + negativePoints);
    SetPlayerScoreValuesToStoredValues();
    UpdateDetails();
    SwitchPlayer();
}

function SetVisibilityOfDetailsDialog(_isVisible: boolean)
{
    //TODO implement
}

function UpdateDetails()
{
    const targetScore = GetStoredTargetScore();
    const scoreOfPlayer1 = GetCurrentScoreOfPlayer(_player1Label);
    const scoreOfPlayer2 = GetCurrentScoreOfPlayer(_player2Label);
    const previousScoreOfPlayer1 = GetPreviousScoreOfPlayer(_player1Label);
    const previousScoreOfPlayer2 = GetPreviousScoreOfPlayer(_player2Label);
    const takeOfPlayer1 = GetStoredTakeOfPlayer(_player1Label);
    const takeOfPlayer2 = GetStoredTakeOfPlayer(_player2Label);

    const remainingBallsOfPlayer1 = Math.max(0, targetScore - scoreOfPlayer1);
    const remainingBallsOfPlayer2 = Math.max(0, targetScore - scoreOfPlayer2);
    const averageOfPlayer1 = scoreOfPlayer1 / Math.max(takeOfPlayer1, 1);
    const averageOfPlayer2 = scoreOfPlayer2 / Math.max(takeOfPlayer2, 1);

    SetInnerHtmlById("player1_remaining", "R: " + remainingBallsOfPlayer1);
    SetInnerHtmlById("player2_remaining", "R: " + remainingBallsOfPlayer2);

    SetInnerHtmlById("player1_average", "Ø: " + averageOfPlayer1.toFixed(2));
    SetInnerHtmlById("player2_average", "Ø: " + averageOfPlayer2.toFixed(2));

    UpdateHighestSeriesOfPlayersDisplayValues();

    let series = 0;
    if(GetActivePlayer() === _player1Label){
        series = scoreOfPlayer1 - previousScoreOfPlayer1;
    }else{
        series = scoreOfPlayer2 - previousScoreOfPlayer2;
    }

    SetInnerHtmlById("series_counter", "Serie: " + series);

    CheckWinCondition(remainingBallsOfPlayer1, remainingBallsOfPlayer2);
}

function UpdateHighestSeriesOfPlayersDisplayValues()
{
    const highestSeriesOfPlayer1 = GetHighestSeriesOfPlayer(_player1Label);
    const highestSeriesOfPlayer2 = GetHighestSeriesOfPlayer(_player2Label);

    SetInnerHtmlById("player1_highest", "H: " + highestSeriesOfPlayer1);
    SetInnerHtmlById("player2_highest", "H: " + highestSeriesOfPlayer2);
}

function CheckWinCondition(remainingBallsOfPlayer1: number, remainingBallsOfPlayer2: number)
{
    //TODO lock controls so no further game changing input can be made until the game is restarted.

    if(remainingBallsOfPlayer1 === 0)
    {
        alert(GetStoredPlayerName(_player1Label) + " hat das Spiel gewonnen.");
    }

    if(remainingBallsOfPlayer2 === 0)
    {
        alert(GetStoredPlayerName(_player2Label) + " hat das Spiel gewonnen.");
    }
}

function CaptureOutsideDialogClick()
{
    SetVisibilityOfRemainingBallsDialog(false);
}

function StopPropagation(event: Event)
{
    event = event || window.event;
    event.stopPropagation();
}