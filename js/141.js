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
    const nameOfPlayer1 = document.querySelector("#menu_player1_name").value;
    const nameOfPlayer2 = document.querySelector("#menu_player2_name").value;
    const targetScoreString = document.querySelector("#menu_target_score").value;

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

    SetInnerHtmlById("player1_name", GetStoredPlayerName(_player1Label));
    SetInnerHtmlById("player2_name", GetStoredPlayerName(_player2Label));
    SetPlayerScoreValuesToStoredValues();

    SetInnerHtmlById("player1_take", "A: 0");
    SetInnerHtmlById("player2_take", "A: 0");
    SetInnerHtmlById("player1_average", "Ø: 0,0");
    SetInnerHtmlById("player2_average", "Ø: 0,0");
    SetInnerHtmlById("player1_highest", "H: 0");
    SetInnerHtmlById("player2_highest", "H: 0");
    SetRemainingBallsOfPlayers();

    SetRemainingBallsDisplayValue(GetStoredAmountOfRemainingBallsOnTable());
    SetActivePlayer(GetActivePlayer());
}

function ResetGame()
{
    SetCurrentScoreOfPlayer(_player1Label, 0);
    SetCurrentScoreOfPlayer(_player2Label, 0);
    SetActivePlayer(_player1Label);
    StoreAmountOfRemainingBallsOnTable(15);
}

function SetRemainingBallsDisplayValue(value)
{
    document.querySelector("#remaining_balls_display").innerHTML = "" + value;
}

function SwitchPlayer()
{
    const activePlayer = GetActivePlayer();
    if(activePlayer === _player1Label)
    {
        SetActivePlayer(_player2Label);
        return;
    }

    SetActivePlayer(_player1Label);
}

function SetActivePlayer(playerLabel)
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

function SetRemainingBallsFromDialog(remainingBalls, event)
{
    event = event || window.event;
    event.stopPropagation();
    SetVisibilityOfRemainingBallsDialog(false);
    SetRemainingBalls(remainingBalls);
}

function SetRemainingBalls(remainingBalls)
{
    const remainingBallsBefore = GetStoredAmountOfRemainingBallsOnTable();
    
    const delta = remainingBallsBefore - remainingBalls;
    ChangePlayerScore(GetActivePlayer(), delta);
    
    StoreAmountOfRemainingBallsOnTable(remainingBalls);
    SetRemainingBallsDisplayValue(remainingBalls);
    UpdateDetails();
}

function SetVisibilityOfRemainingBallsDialog(isVisible)
{
    const displayValue = isVisible ? "block" : "none";
    document.getElementById('remaining_balls_selection_dialog').style.display= displayValue;
}

function ChangePlayerScore(playerLabel, delta)
{
    let playerScore = GetCurrentScoreOfPlayer(playerLabel);
    playerScore += delta;
    SetCurrentScoreOfPlayer(playerLabel, playerScore);
    SetPlayerScoreValuesToStoredValues();
}

function SetPlayerScoreValuesToStoredValues()
{
    document.querySelector("#player1_score").innerHTML = GetCurrentScoreOfPlayer(_player1Label);
    document.querySelector("#player2_score").innerHTML = GetCurrentScoreOfPlayer(_player2Label);
}

function Undo()
{
    //TODO implement
}

function NewRack()
{
    //TODO implement
}

function ChangeAmountOfRemainingBalls(delta)
{
    const remainingBallsBefore = GetStoredAmountOfRemainingBallsOnTable();
    const remainingBalls = remainingBallsBefore + delta;
    SetRemainingBalls(remainingBalls);    
}

function Foul()
{
    //TODO implement
}

function SetVisibilityOfDetailsDialog(isVisible)
{
    //TODO implement
}

function UpdateDetails()
{
    SetRemainingBallsOfPlayers();
}

function SetRemainingBallsOfPlayers()
{
    const targetScore = GetStoredTargetScore();
    const scoreOfPlayer1 = GetCurrentScoreOfPlayer(_player1Label);
    const scoreOfPlayer2 = GetCurrentScoreOfPlayer(_player2Label);
    const remainingBallsOfPlayer1 = targetScore - scoreOfPlayer1;
    const remainingBallsOfPlayer2 = targetScore - scoreOfPlayer2;

    document.querySelector("#player1_remaining").innerHTML = "R: " + remainingBallsOfPlayer1;
    document.querySelector("#player2_remaining").innerHTML = "R: " + remainingBallsOfPlayer2;
}

function CaptureOutsideDialogClick()
{
    SetVisibilityOfRemainingBallsDialog(false);
}

function StopPropagation(event)
{
    event = event || window.event;
    event.stopPropagation();
}