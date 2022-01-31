var _player1Label = "player1";
var _player2Label = "player2";
function ReturnToMenu() {
    if (!confirm("Soll das Spiel wirklich abgebrochen werden?")) {
        return;
    }
    StoreGameState(_gameStateNoGame);
    SetElementVisibilityDependingOnGameState();
}
function CreateNewGame() {
    ResetGame();
    var nameOfPlayer1 = GetInputFromElementById("menu_player1_name");
    var nameOfPlayer2 = GetInputFromElementById("menu_player2_name");
    var targetScoreString = GetInputFromElementById("menu_target_score");
    if (nameOfPlayer1 === "") {
        alert("Bitte einen Namen für Spieler 1 eingeben.");
        return;
    }
    if (nameOfPlayer2 === "") {
        alert("Bitte einen Namen für Spieler 2 eingeben.");
        return;
    }
    if (!isNumeric(targetScoreString)) {
        alert("Bitte eine gültige Zahl für die Zielpunktzahl eingeben.");
        return;
    }
    var targetScore = Number(targetScoreString);
    if (targetScore < 20 || targetScore > 200) {
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
function SetElementVisibilityDependingOnGameState() {
    var isGameInProgress = IsGameInProgress();
    if (isGameInProgress) {
        ShowElementById("game_view");
        HideElementById("menu_view");
    }
    else {
        ShowElementById("menu_view");
        HideElementById("game_view");
    }
}
function ReloadStoredState() {
    SetElementVisibilityDependingOnGameState();
    if (!IsGameInProgress()) {
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
function ResetGame() {
    SetCurrentScoreOfPlayer(_player1Label, 0);
    SetCurrentScoreOfPlayer(_player2Label, 0);
    SetPreviousScoreOfPlayer(_player1Label, 0);
    SetPreviousScoreOfPlayer(_player2Label, 0);
    SetHighestSeriesOfPlayer(_player1Label, 0);
    SetHighestSeriesOfPlayer(_player2Label, 0);
    SetActivePlayer(_player1Label);
    StoreAmountOfRemainingBallsOnTable(15);
}
function SetRemainingBallsDisplayValue(value) {
    SetInnerHtmlById("remaining_balls_display", "" + value);
}
function SwitchPlayer() {
    var activePlayer = GetActivePlayer();
    var nextPlayer = activePlayer === _player1Label ? _player2Label : _player1Label;
    UpdateHighestSeriesIfNecessary(activePlayer);
    SetPreviousScoreOfPlayer(activePlayer, GetCurrentScoreOfPlayer(activePlayer));
    SetActivePlayer(nextPlayer);
    var takeOfPlayer = GetStoredTakeOfPlayer(nextPlayer);
    StoreTakeOfPlayer(nextPlayer, takeOfPlayer + 1);
    UpdateTakeDisplayToStoredValues();
    SetInnerHtmlById("series_counter", "Serie: 0");
    UpdateHighestSeriesOfPlayersDisplayValues();
}
function UpdateHighestSeriesIfNecessary(playerLabel) {
    var previousScore = GetPreviousScoreOfPlayer(playerLabel);
    var currentScore = GetCurrentScoreOfPlayer(playerLabel);
    var highestSeriesBefore = GetHighestSeriesOfPlayer(playerLabel);
    var currentSeries = currentScore - previousScore;
    if (currentSeries > highestSeriesBefore) {
        SetHighestSeriesOfPlayer(playerLabel, currentSeries);
    }
}
function UpdateTakeDisplayToStoredValues() {
    SetInnerHtmlById("player1_take", "A: " + GetStoredTakeOfPlayer(_player1Label));
    SetInnerHtmlById("player2_take", "A: " + GetStoredTakeOfPlayer(_player2Label));
}
function SetActivePlayer(playerLabel) {
    StoreActivePlayer(playerLabel);
    var player1ScoreElement = document.querySelector("#player1_score");
    var player2ScoreElement = document.querySelector("#player2_score");
    var player1NameElement = document.querySelector("#player1_name").parentElement;
    var player2NameElement = document.querySelector("#player2_name").parentElement;
    if (playerLabel === _player1Label) {
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
function SetRemainingBallsFromDialog(remainingBalls, event) {
    event = event || window.event;
    event.stopPropagation();
    SetVisibilityOfRemainingBallsDialog(false);
    SetRemainingBalls(remainingBalls);
}
function SetRemainingBalls(remainingBalls) {
    var remainingBallsBefore = GetStoredAmountOfRemainingBallsOnTable();
    var delta = remainingBallsBefore - remainingBalls;
    ChangePlayerScore(GetActivePlayer(), delta);
    if (remainingBalls === 1 || remainingBalls === 0) {
        remainingBalls = 15;
    }
    StoreAmountOfRemainingBallsOnTable(remainingBalls);
    SetRemainingBallsDisplayValue(remainingBalls);
    UpdateDetails();
}
function SetVisibilityOfRemainingBallsDialog(isVisible) {
    var displayValue = isVisible ? "block" : "none";
    document.getElementById('remaining_balls_selection_dialog').style.display = displayValue;
}
function ChangePlayerScore(playerLabel, delta) {
    if (delta > 0) {
        StoreFoulCountOfPlayer(playerLabel, 0);
    }
    var playerScore = GetCurrentScoreOfPlayer(playerLabel);
    playerScore += delta;
    SetCurrentScoreOfPlayer(playerLabel, playerScore);
    SetPlayerScoreValuesToStoredValues();
}
function SetPlayerScoreValuesToStoredValues() {
    SetInnerHtmlById("player1_score", "" + GetCurrentScoreOfPlayer(_player1Label));
    SetInnerHtmlById("player2_score", "" + GetCurrentScoreOfPlayer(_player2Label));
}
function Undo() {
}
function NewRack() {
    ChangePlayerScore(GetActivePlayer(), 14);
    UpdateDetails();
}
function IncrementOne() {
    ChangeAmountOfRemainingBalls(1);
}
function DecrementOne() {
    ChangeAmountOfRemainingBalls(-1);
}
function ChangeAmountOfRemainingBalls(delta) {
    var remainingBallsBefore = GetStoredAmountOfRemainingBallsOnTable();
    var remainingBalls = remainingBallsBefore + delta;
    if (remainingBalls > 15) {
        return;
    }
    SetRemainingBalls(remainingBalls);
}
function Foul() {
    var activePlayer = GetActivePlayer();
    var currentScore = GetCurrentScoreOfPlayer(activePlayer);
    var takeOfPlayer = GetStoredTakeOfPlayer(activePlayer);
    var foulCount = GetStoredFoulCountOfPlayer(activePlayer);
    foulCount++;
    var negativePoints = -1;
    if (takeOfPlayer === 1) {
        if (confirm("Wenn es sich um ein Foul beim Break handelt bestätigen Sie mit Ok.")) {
            negativePoints = -2;
        }
    }
    if (foulCount % 3 === 0) {
        negativePoints = -16;
    }
    StoreFoulCountOfPlayer(activePlayer, foulCount);
    SetCurrentScoreOfPlayer(activePlayer, currentScore + negativePoints);
    SetPlayerScoreValuesToStoredValues();
    UpdateDetails();
    SwitchPlayer();
}
function SetVisibilityOfDetailsDialog(_isVisible) {
}
function UpdateDetails() {
    var targetScore = GetStoredTargetScore();
    var scoreOfPlayer1 = GetCurrentScoreOfPlayer(_player1Label);
    var scoreOfPlayer2 = GetCurrentScoreOfPlayer(_player2Label);
    var previousScoreOfPlayer1 = GetPreviousScoreOfPlayer(_player1Label);
    var previousScoreOfPlayer2 = GetPreviousScoreOfPlayer(_player2Label);
    var takeOfPlayer1 = GetStoredTakeOfPlayer(_player1Label);
    var takeOfPlayer2 = GetStoredTakeOfPlayer(_player2Label);
    var remainingBallsOfPlayer1 = Math.max(0, targetScore - scoreOfPlayer1);
    var remainingBallsOfPlayer2 = Math.max(0, targetScore - scoreOfPlayer2);
    var averageOfPlayer1 = scoreOfPlayer1 / Math.max(takeOfPlayer1, 1);
    var averageOfPlayer2 = scoreOfPlayer2 / Math.max(takeOfPlayer2, 1);
    SetInnerHtmlById("player1_remaining", "R: " + remainingBallsOfPlayer1);
    SetInnerHtmlById("player2_remaining", "R: " + remainingBallsOfPlayer2);
    SetInnerHtmlById("player1_average", "Ø: " + averageOfPlayer1.toFixed(2));
    SetInnerHtmlById("player2_average", "Ø: " + averageOfPlayer2.toFixed(2));
    UpdateHighestSeriesOfPlayersDisplayValues();
    var series = 0;
    if (GetActivePlayer() === _player1Label) {
        series = scoreOfPlayer1 - previousScoreOfPlayer1;
    }
    else {
        series = scoreOfPlayer2 - previousScoreOfPlayer2;
    }
    SetInnerHtmlById("series_counter", "Serie: " + series);
    CheckWinCondition(remainingBallsOfPlayer1, remainingBallsOfPlayer2);
}
function UpdateHighestSeriesOfPlayersDisplayValues() {
    var highestSeriesOfPlayer1 = GetHighestSeriesOfPlayer(_player1Label);
    var highestSeriesOfPlayer2 = GetHighestSeriesOfPlayer(_player2Label);
    SetInnerHtmlById("player1_highest", "H: " + highestSeriesOfPlayer1);
    SetInnerHtmlById("player2_highest", "H: " + highestSeriesOfPlayer2);
}
function CheckWinCondition(remainingBallsOfPlayer1, remainingBallsOfPlayer2) {
    if (remainingBallsOfPlayer1 === 0) {
        alert(GetStoredPlayerName(_player1Label) + " hat das Spiel gewonnen.");
    }
    if (remainingBallsOfPlayer2 === 0) {
        alert(GetStoredPlayerName(_player2Label) + " hat das Spiel gewonnen.");
    }
}
function CaptureOutsideDialogClick() {
    SetVisibilityOfRemainingBallsDialog(false);
}
function StopPropagation(event) {
    event = event || window.event;
    event.stopPropagation();
}
var _player1NameKey = "player1_name";
var _player2NameKey = "player2_name";
var _player1ScoreKey = "player1_score";
var _player2ScoreKey = "player2_score";
var _player1PreviousScoreKey = "player1_previous_score";
var _player2PreviousScoreKey = "player2_previous_score";
var _player1HighestSeriesKey = "player1_highest_series";
var _player2HighestSeriesKey = "player2_highest_series";
var _player1TakeKey = "player1_take";
var _player2TakeKey = "player2_take";
var _player1FoulsKey = "player1_fouls";
var _player2FoulsKey = "player2_fouls";
var _targetScoreKey = "target_score";
var _activePlayerKey = "active_player";
var _remainingBallsOnTableKey = "remaining_balls";
var _gameStateKey = "game_state";
var _gameStateInProgress = "in_progress";
var _gameStateNoGame = "no_game";
function GetCurrentScoreOfPlayer(playerLabel) {
    var scoreStorageKey = playerLabel === _player1Label ? _player1ScoreKey : _player2ScoreKey;
    var playerScoreString = localStorage.getItem(scoreStorageKey);
    return Number(playerScoreString);
}
function SetCurrentScoreOfPlayer(playerLabel, score) {
    var scoreStorageKey = playerLabel === _player1Label ? _player1ScoreKey : _player2ScoreKey;
    localStorage.setItem(scoreStorageKey, "" + score);
}
function GetPreviousScoreOfPlayer(playerLabel) {
    var scoreStorageKey = playerLabel === _player1Label ? _player1PreviousScoreKey : _player2PreviousScoreKey;
    var playerScoreString = localStorage.getItem(scoreStorageKey);
    return Number(playerScoreString);
}
function SetPreviousScoreOfPlayer(playerLabel, previousScore) {
    var scoreStorageKey = playerLabel === _player1Label ? _player1PreviousScoreKey : _player2PreviousScoreKey;
    localStorage.setItem(scoreStorageKey, "" + previousScore);
}
function GetHighestSeriesOfPlayer(playerLabel) {
    var storageKey = playerLabel === _player1Label ? _player1HighestSeriesKey : _player2HighestSeriesKey;
    var playerScoreString = localStorage.getItem(storageKey);
    return Number(playerScoreString);
}
function SetHighestSeriesOfPlayer(playerLabel, highestSeries) {
    var storageKey = playerLabel === _player1Label ? _player1HighestSeriesKey : _player2HighestSeriesKey;
    localStorage.setItem(storageKey, "" + highestSeries);
}
function GetStoredTakeOfPlayer(playerLabel) {
    var takeStorageKey = playerLabel === _player1Label ? _player1TakeKey : _player2TakeKey;
    var playerScoreString = localStorage.getItem(takeStorageKey);
    return Number(playerScoreString);
}
function StoreTakeOfPlayer(playerLabel, take) {
    var scoreStorageKey = playerLabel === _player1Label ? _player1TakeKey : _player2TakeKey;
    localStorage.setItem(scoreStorageKey, "" + take);
}
function GetStoredFoulCountOfPlayer(playerLabel) {
    var foulStorageKey = playerLabel === _player1Label ? _player1FoulsKey : _player2FoulsKey;
    var playerScoreString = localStorage.getItem(foulStorageKey);
    return Number(playerScoreString);
}
function StoreFoulCountOfPlayer(playerLabel, foulCount) {
    var foulStorageKey = playerLabel === _player1Label ? _player1FoulsKey : _player2FoulsKey;
    localStorage.setItem(foulStorageKey, "" + foulCount);
}
function GetStoredTargetScore() {
    var targetScore = localStorage.getItem(_targetScoreKey);
    return Number(targetScore);
}
function GetActivePlayer() {
    return localStorage.getItem(_activePlayerKey);
}
function StoreActivePlayer(playerLabel) {
    localStorage.setItem(_activePlayerKey, playerLabel);
}
function GetStoredAmountOfRemainingBallsOnTable() {
    var remainingBallsOnTable = localStorage.getItem(_remainingBallsOnTableKey);
    return Number(remainingBallsOnTable);
}
function StoreAmountOfRemainingBallsOnTable(remainingBalls) {
    localStorage.setItem(_remainingBallsOnTableKey, "" + remainingBalls);
}
function StorePlayerName(playerLabel, playerName) {
    var nameStorageKey = playerLabel === _player1Label ? _player1NameKey : _player2NameKey;
    localStorage.setItem(nameStorageKey, playerName);
}
function GetStoredPlayerName(playerLabel) {
    var nameStorageKey = playerLabel === _player1Label ? _player1NameKey : _player2NameKey;
    return localStorage.getItem(nameStorageKey);
}
function StoreTargetScore(targetScoreString) {
    localStorage.setItem(_targetScoreKey, targetScoreString);
}
function StoreGameState(gameState) {
    localStorage.setItem(_gameStateKey, gameState);
}
function IsGameInProgress() {
    return localStorage.getItem(_gameStateKey) === _gameStateInProgress;
}
function isNumeric(value) {
    return /^\d+$/.test(value);
}
function SwitchClass(element, classToRemove, classToAdd) {
    element.classList.remove(classToRemove);
    if (!element.classList.contains(classToAdd)) {
        element.classList.add(classToAdd);
    }
}
function ShowElementById(elementId) {
    var element = document.querySelector("#" + elementId);
    element.classList.remove("w3-hide");
}
function HideElementById(elementId) {
    var element = document.querySelector("#" + elementId);
    if (!element.classList.contains("w3-hide")) {
        element.classList.add("w3-hide");
    }
}
function SetInnerHtmlById(elementId, innerHtml) {
    var element = document.querySelector("#" + elementId);
    element.innerHTML = innerHtml;
}
function GetInputFromElementById(elementId) {
    var element = document.querySelector("#" + elementId);
    return element.value;
}
//# sourceMappingURL=141.js.map