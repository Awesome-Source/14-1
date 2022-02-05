var GameManager = (function () {
    function GameManager() {
    }
    GameManager.ReturnToMenu = function () {
        LocalStorageManager.StoreGameState(LocalStorageConstants.GameStateNoGame);
        this.ShowViewDependingOnGameState();
    };
    GameManager.CreateNewGame = function () {
        this.ResetGame();
        var startGameInfo = GameViewManager.ExtractStartGameInfo();
        if (startGameInfo === null) {
            return;
        }
        LocalStorageManager.StorePlayerName(PlayerConstants.Player1, startGameInfo.NameOfPlayer1);
        LocalStorageManager.StorePlayerName(PlayerConstants.Player2, startGameInfo.NameOfPlayer2);
        LocalStorageManager.StoreTargetScore(startGameInfo.TargetScore);
        LocalStorageManager.StoreGameState(LocalStorageConstants.GameStateInProgress);
        LocalStorageManager.StoreFoulCountOfPlayer(PlayerConstants.Player1, 0);
        LocalStorageManager.StoreFoulCountOfPlayer(PlayerConstants.Player2, 0);
        LocalStorageManager.StoreTakeOfPlayer(PlayerConstants.Player1, 1);
        LocalStorageManager.StoreTakeOfPlayer(PlayerConstants.Player2, 0);
        this.ReloadStoredState();
        this.ShowViewDependingOnGameState();
    };
    GameManager.ShowViewDependingOnGameState = function () {
        var isGameInProgress = LocalStorageManager.IsGameInProgress();
        if (isGameInProgress) {
            GameViewManager.ShowGameView();
        }
        else {
            GameViewManager.ShowMenuView();
        }
    };
    GameManager.SwitchPlayer = function () {
        var activePlayer = LocalStorageManager.GetActivePlayer();
        var nextPlayer = activePlayer === PlayerConstants.Player1 ? PlayerConstants.Player2 : PlayerConstants.Player1;
        this.UpdateHighestSeriesIfNecessary(activePlayer);
        LocalStorageManager.StorePreviousScoreOfPlayer(activePlayer, LocalStorageManager.GetCurrentScoreOfPlayer(activePlayer));
        this.SetActivePlayer(nextPlayer);
        var takeOfPlayer = LocalStorageManager.GetTakeOfPlayer(nextPlayer);
        LocalStorageManager.StoreTakeOfPlayer(nextPlayer, takeOfPlayer + 1);
        this.UpdateDetails();
        this.UpdateTakeDisplayToStoredValues();
        GameViewManager.UpdateSeriesCounter(0);
    };
    GameManager.UpdateTakeDisplayToStoredValues = function () {
        var takesOfPlayer1 = LocalStorageManager.GetTakeOfPlayer(PlayerConstants.Player1);
        var takesOfPlayer2 = LocalStorageManager.GetTakeOfPlayer(PlayerConstants.Player2);
        GameViewManager.UpdateTakeDisplay(takesOfPlayer1, takesOfPlayer2);
    };
    GameManager.SetRemainingBallsFromDialog = function (remainingBalls) {
        GameViewManager.SetVisibilityOfDialog("remaining_balls_selection_dialog", false);
        this.SetRemainingBalls(remainingBalls);
    };
    GameManager.Undo = function () {
    };
    GameManager.NewRack = function () {
        this.ChangePlayerScore(LocalStorageManager.GetActivePlayer(), 14);
        this.UpdateDetails();
    };
    GameManager.Foul = function () {
        var activePlayer = LocalStorageManager.GetActivePlayer();
        var currentScore = LocalStorageManager.GetCurrentScoreOfPlayer(activePlayer);
        var takeOfPlayer = LocalStorageManager.GetTakeOfPlayer(activePlayer);
        var foulCount = LocalStorageManager.GetFoulCountOfPlayer(activePlayer);
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
        LocalStorageManager.StoreFoulCountOfPlayer(activePlayer, foulCount);
        LocalStorageManager.StoreCurrentScoreOfPlayer(activePlayer, currentScore + negativePoints);
        this.SetPlayerScoreValuesToStoredValues();
        this.UpdateDetails();
        this.SwitchPlayer();
    };
    GameManager.ReloadStoredState = function () {
        this.ShowViewDependingOnGameState();
        if (!LocalStorageManager.IsGameInProgress()) {
            return;
        }
        var nameOfPlayer1 = LocalStorageManager.GetPlayerName(PlayerConstants.Player1);
        var nameOfPlayer2 = LocalStorageManager.GetPlayerName(PlayerConstants.Player2);
        GameViewManager.UpdatePlayerNames(nameOfPlayer1, nameOfPlayer2);
        this.SetPlayerScoreValuesToStoredValues();
        this.UpdateTakeDisplayToStoredValues();
        this.UpdateDetails();
        GameViewManager.SetRemainingBallsDisplayValue(LocalStorageManager.GetAmountOfRemainingBallsOnTable());
        this.SetActivePlayer(LocalStorageManager.GetActivePlayer());
    };
    GameManager.ResetGame = function () {
        LocalStorageManager.StoreCurrentScoreOfPlayer(PlayerConstants.Player1, 0);
        LocalStorageManager.StoreCurrentScoreOfPlayer(PlayerConstants.Player2, 0);
        LocalStorageManager.StorePreviousScoreOfPlayer(PlayerConstants.Player1, 0);
        LocalStorageManager.StorePreviousScoreOfPlayer(PlayerConstants.Player2, 0);
        LocalStorageManager.StoreHighestSeriesOfPlayer(PlayerConstants.Player1, 0);
        LocalStorageManager.StoreHighestSeriesOfPlayer(PlayerConstants.Player2, 0);
        this.SetActivePlayer(PlayerConstants.Player1);
        LocalStorageManager.StoreAmountOfRemainingBallsOnTable(15);
    };
    GameManager.UpdateHighestSeriesIfNecessary = function (playerLabel) {
        var previousScore = LocalStorageManager.GetPreviousScoreOfPlayer(playerLabel);
        var currentScore = LocalStorageManager.GetCurrentScoreOfPlayer(playerLabel);
        var highestSeriesBefore = LocalStorageManager.GetHighestSeriesOfPlayer(playerLabel);
        var currentSeries = currentScore - previousScore;
        if (currentSeries > highestSeriesBefore) {
            LocalStorageManager.StoreHighestSeriesOfPlayer(playerLabel, currentSeries);
        }
    };
    GameManager.SetActivePlayer = function (playerLabel) {
        LocalStorageManager.StoreActivePlayer(playerLabel);
        GameViewManager.HighlightActivePlayer(playerLabel);
    };
    GameManager.SetRemainingBalls = function (remainingBalls) {
        var remainingBallsBefore = LocalStorageManager.GetAmountOfRemainingBallsOnTable();
        var delta = remainingBallsBefore - remainingBalls;
        this.ChangePlayerScore(LocalStorageManager.GetActivePlayer(), delta);
        if (remainingBalls === 1 || remainingBalls === 0) {
            remainingBalls = 15;
        }
        LocalStorageManager.StoreAmountOfRemainingBallsOnTable(remainingBalls);
        GameViewManager.SetRemainingBallsDisplayValue(remainingBalls);
        this.UpdateDetails();
    };
    GameManager.ChangePlayerScore = function (playerLabel, delta) {
        if (delta > 0) {
            LocalStorageManager.StoreFoulCountOfPlayer(playerLabel, 0);
        }
        var playerScore = LocalStorageManager.GetCurrentScoreOfPlayer(playerLabel);
        playerScore += delta;
        LocalStorageManager.StoreCurrentScoreOfPlayer(playerLabel, playerScore);
        this.SetPlayerScoreValuesToStoredValues();
    };
    GameManager.SetPlayerScoreValuesToStoredValues = function () {
        var scoreOfPlayer1 = LocalStorageManager.GetCurrentScoreOfPlayer(PlayerConstants.Player1);
        var scoreOfPlayer2 = LocalStorageManager.GetCurrentScoreOfPlayer(PlayerConstants.Player2);
        GameViewManager.UpdatePlayerScoreDisplay(scoreOfPlayer1, scoreOfPlayer2);
    };
    GameManager.ChangeAmountOfRemainingBalls = function (delta) {
        var remainingBallsBefore = LocalStorageManager.GetAmountOfRemainingBallsOnTable();
        var remainingBalls = remainingBallsBefore + delta;
        if (remainingBalls > 15) {
            return;
        }
        this.SetRemainingBalls(remainingBalls);
    };
    GameManager.UpdateDetails = function () {
        var targetScore = LocalStorageManager.GetTargetScore();
        var scoreOfPlayer1 = LocalStorageManager.GetCurrentScoreOfPlayer(PlayerConstants.Player1);
        var scoreOfPlayer2 = LocalStorageManager.GetCurrentScoreOfPlayer(PlayerConstants.Player2);
        var previousScoreOfPlayer1 = LocalStorageManager.GetPreviousScoreOfPlayer(PlayerConstants.Player1);
        var previousScoreOfPlayer2 = LocalStorageManager.GetPreviousScoreOfPlayer(PlayerConstants.Player2);
        var takeOfPlayer1 = LocalStorageManager.GetTakeOfPlayer(PlayerConstants.Player1);
        var takeOfPlayer2 = LocalStorageManager.GetTakeOfPlayer(PlayerConstants.Player2);
        var highestSeriesOfPlayer1 = LocalStorageManager.GetHighestSeriesOfPlayer(PlayerConstants.Player1);
        var highestSeriesOfPlayer2 = LocalStorageManager.GetHighestSeriesOfPlayer(PlayerConstants.Player2);
        var remainingBallsOfPlayer1 = Math.max(0, targetScore - scoreOfPlayer1);
        var remainingBallsOfPlayer2 = Math.max(0, targetScore - scoreOfPlayer2);
        var averageOfPlayer1 = scoreOfPlayer1 / Math.max(takeOfPlayer1, 1);
        var averageOfPlayer2 = scoreOfPlayer2 / Math.max(takeOfPlayer2, 1);
        GameViewManager.UpdateRemainingBallsOfPlayerDisplay(remainingBallsOfPlayer1, remainingBallsOfPlayer2);
        GameViewManager.UpdatePlayerAverageDisplay(averageOfPlayer1, averageOfPlayer2);
        GameViewManager.UpdateHighestSeriesDisplay(highestSeriesOfPlayer1, highestSeriesOfPlayer2);
        var series = 0;
        if (LocalStorageManager.GetActivePlayer() === PlayerConstants.Player1) {
            series = scoreOfPlayer1 - previousScoreOfPlayer1;
        }
        else {
            series = scoreOfPlayer2 - previousScoreOfPlayer2;
        }
        GameViewManager.UpdateSeriesCounter(series);
        this.CheckWinCondition(remainingBallsOfPlayer1, remainingBallsOfPlayer2);
    };
    GameManager.CheckWinCondition = function (remainingBallsOfPlayer1, remainingBallsOfPlayer2) {
        if (remainingBallsOfPlayer1 === 0) {
            alert(LocalStorageManager.GetPlayerName(PlayerConstants.Player1) + " hat das Spiel gewonnen.");
        }
        if (remainingBallsOfPlayer2 === 0) {
            alert(LocalStorageManager.GetPlayerName(PlayerConstants.Player2) + " hat das Spiel gewonnen.");
        }
    };
    return GameManager;
}());
var GameViewManager = (function () {
    function GameViewManager() {
    }
    GameViewManager.HighlightActivePlayer = function (playerLabel) {
        var player1ScoreElement = document.querySelector("#player1_score");
        var player2ScoreElement = document.querySelector("#player2_score");
        var player1NameElement = document.querySelector("#player1_name").parentElement;
        var player2NameElement = document.querySelector("#player2_name").parentElement;
        if (playerLabel === PlayerConstants.Player1) {
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
    };
    GameViewManager.SetVisibilityOfDialog = function (dialogId, isVisible) {
        var displayValue = isVisible ? "block" : "none";
        document.getElementById(dialogId).style.display = displayValue;
    };
    GameViewManager.SetRemainingBallsDisplayValue = function (value) {
        HtmlUtils.SetInnerHtmlById("remaining_balls_display", "" + value);
    };
    GameViewManager.UpdateTakeDisplay = function (takesOfPlayer1, takesOfPlayer2) {
        HtmlUtils.SetInnerHtmlById("player1_take", "A: " + takesOfPlayer1);
        HtmlUtils.SetInnerHtmlById("player2_take", "A: " + takesOfPlayer2);
    };
    GameViewManager.UpdateHighestSeriesDisplay = function (highestSeriesOfPlayer1, highestSeriesOfPlayer2) {
        HtmlUtils.SetInnerHtmlById("player1_highest", "H: " + highestSeriesOfPlayer1);
        HtmlUtils.SetInnerHtmlById("player2_highest", "H: " + highestSeriesOfPlayer2);
    };
    GameViewManager.UpdatePlayerScoreDisplay = function (scoreOfPlayer1, scoreOfPlayer2) {
        HtmlUtils.SetInnerHtmlById("player1_score", "" + scoreOfPlayer1);
        HtmlUtils.SetInnerHtmlById("player2_score", "" + scoreOfPlayer2);
    };
    GameViewManager.UpdatePlayerAverageDisplay = function (averageOfPlayer1, averageOfPlayer2) {
        HtmlUtils.SetInnerHtmlById("player1_average", "Ø: " + averageOfPlayer1.toFixed(2));
        HtmlUtils.SetInnerHtmlById("player2_average", "Ø: " + averageOfPlayer2.toFixed(2));
    };
    GameViewManager.UpdateRemainingBallsOfPlayerDisplay = function (remainingBallsOfPlayer1, remainingBallsOfPlayer2) {
        HtmlUtils.SetInnerHtmlById("player1_remaining", "R: " + remainingBallsOfPlayer1);
        HtmlUtils.SetInnerHtmlById("player2_remaining", "R: " + remainingBallsOfPlayer2);
    };
    GameViewManager.UpdatePlayerNames = function (nameOfPlayer1, nameOfPlayer2) {
        HtmlUtils.SetInnerHtmlById("player1_name", nameOfPlayer1);
        HtmlUtils.SetInnerHtmlById("player2_name", nameOfPlayer2);
    };
    GameViewManager.UpdateSeriesCounter = function (series) {
        HtmlUtils.SetInnerHtmlById("series_counter", "Serie: " + series);
    };
    GameViewManager.ShowGameView = function () {
        HtmlUtils.ShowElementById("game_view");
        HtmlUtils.HideElementById("menu_view");
    };
    GameViewManager.ShowMenuView = function () {
        HtmlUtils.ShowElementById("menu_view");
        HtmlUtils.HideElementById("game_view");
    };
    GameViewManager.ExtractStartGameInfo = function () {
        var nameOfPlayer1 = HtmlUtils.GetInputFromElementWithId("menu_player1_name");
        var nameOfPlayer2 = HtmlUtils.GetInputFromElementWithId("menu_player2_name");
        var targetScoreString = HtmlUtils.GetInputFromElementWithId("menu_target_score");
        if (nameOfPlayer1 === "") {
            alert("Bitte einen Namen für Spieler 1 eingeben.");
            return null;
        }
        if (nameOfPlayer2 === "") {
            alert("Bitte einen Namen für Spieler 2 eingeben.");
            return null;
        }
        if (!Validator.IsNumeric(targetScoreString)) {
            alert("Bitte eine gültige Zahl für die Zielpunktzahl eingeben.");
            return null;
        }
        var targetScore = Number(targetScoreString);
        if (targetScore < 20 || targetScore > 200) {
            alert("Bitte eine gültige Zahl für die Zielpunktzahl eingeben.");
            return null;
        }
        return new StartGameInfo(nameOfPlayer1, nameOfPlayer2, targetScore);
    };
    return GameViewManager;
}());
var HtmlUtils = (function () {
    function HtmlUtils() {
    }
    HtmlUtils.SwitchClass = function (element, classToRemove, classToAdd) {
        element.classList.remove(classToRemove);
        if (!element.classList.contains(classToAdd)) {
            element.classList.add(classToAdd);
        }
    };
    HtmlUtils.ShowElementById = function (elementId) {
        var element = document.getElementById(elementId);
        element.classList.remove("w3-hide");
    };
    HtmlUtils.HideElementById = function (elementId) {
        var element = document.getElementById(elementId);
        if (!element.classList.contains("w3-hide")) {
            element.classList.add("w3-hide");
        }
    };
    HtmlUtils.SetInnerHtmlById = function (elementId, innerHtml) {
        var element = document.getElementById(elementId);
        element.innerHTML = innerHtml;
    };
    HtmlUtils.GetInputFromElementWithId = function (elementId) {
        var element = document.getElementById(elementId);
        return element.value;
    };
    HtmlUtils.StopPropagation = function (event) {
        event = event || window.event;
        event.stopPropagation();
    };
    return HtmlUtils;
}());
var LocalStorageConstants = (function () {
    function LocalStorageConstants() {
    }
    LocalStorageConstants.Player1NameKey = "player1_name";
    LocalStorageConstants.Player2NameKey = "player2_name";
    LocalStorageConstants.Player1ScoreKey = "player1_score";
    LocalStorageConstants.Player2ScoreKey = "player2_score";
    LocalStorageConstants.Player1PreviousScoreKey = "player1_previous_score";
    LocalStorageConstants.Player2PreviousScoreKey = "player2_previous_score";
    LocalStorageConstants.Player1HighestSeriesKey = "player1_highest_series";
    LocalStorageConstants.Player2HighestSeriesKey = "player2_highest_series";
    LocalStorageConstants.Player1TakeKey = "player1_take";
    LocalStorageConstants.Player2TakeKey = "player2_take";
    LocalStorageConstants.Player1FoulsKey = "player1_fouls";
    LocalStorageConstants.Player2FoulsKey = "player2_fouls";
    LocalStorageConstants.TargetScoreKey = "target_score";
    LocalStorageConstants.ActivePlayerKey = "active_player";
    LocalStorageConstants.RemainingBallsOnTableKey = "remaining_balls";
    LocalStorageConstants.GameStateKey = "game_state";
    LocalStorageConstants.GameStateInProgress = "in_progress";
    LocalStorageConstants.GameStateNoGame = "no_game";
    return LocalStorageConstants;
}());
var LocalStorageManager = (function () {
    function LocalStorageManager() {
    }
    LocalStorageManager.GetStoredNumber = function (key) {
        var value = localStorage.getItem(key);
        return Number(value);
    };
    LocalStorageManager.GetStoredNumberForPlayer = function (playerLabel, player1Key, player2Key) {
        var storageKey = playerLabel === PlayerConstants.Player1 ? player1Key : player2Key;
        return this.GetStoredNumber(storageKey);
    };
    LocalStorageManager.GetStoredStringForPlayer = function (playerLabel, player1Key, player2Key) {
        var storageKey = playerLabel === PlayerConstants.Player1 ? player1Key : player2Key;
        return localStorage.getItem(storageKey);
    };
    LocalStorageManager.StoreNumberForPlayer = function (playerLabel, value, player1Key, player2Key) {
        var storageKey = playerLabel === PlayerConstants.Player1 ? player1Key : player2Key;
        localStorage.setItem(storageKey, "" + value);
    };
    LocalStorageManager.StoreStringForPlayer = function (playerLabel, value, player1Key, player2Key) {
        var storageKey = playerLabel === PlayerConstants.Player1 ? player1Key : player2Key;
        localStorage.setItem(storageKey, value);
    };
    LocalStorageManager.GetCurrentScoreOfPlayer = function (playerLabel) {
        return this.GetStoredNumberForPlayer(playerLabel, LocalStorageConstants.Player1ScoreKey, LocalStorageConstants.Player2ScoreKey);
    };
    LocalStorageManager.StoreCurrentScoreOfPlayer = function (playerLabel, score) {
        this.StoreNumberForPlayer(playerLabel, score, LocalStorageConstants.Player1ScoreKey, LocalStorageConstants.Player2ScoreKey);
    };
    LocalStorageManager.GetPreviousScoreOfPlayer = function (playerLabel) {
        return this.GetStoredNumberForPlayer(playerLabel, LocalStorageConstants.Player1PreviousScoreKey, LocalStorageConstants.Player2PreviousScoreKey);
    };
    LocalStorageManager.StorePreviousScoreOfPlayer = function (playerLabel, previousScore) {
        this.StoreNumberForPlayer(playerLabel, previousScore, LocalStorageConstants.Player1PreviousScoreKey, LocalStorageConstants.Player2PreviousScoreKey);
    };
    LocalStorageManager.GetHighestSeriesOfPlayer = function (playerLabel) {
        return this.GetStoredNumberForPlayer(playerLabel, LocalStorageConstants.Player1HighestSeriesKey, LocalStorageConstants.Player2HighestSeriesKey);
    };
    LocalStorageManager.StoreHighestSeriesOfPlayer = function (playerLabel, highestSeries) {
        this.StoreNumberForPlayer(playerLabel, highestSeries, LocalStorageConstants.Player1HighestSeriesKey, LocalStorageConstants.Player2HighestSeriesKey);
    };
    LocalStorageManager.GetTakeOfPlayer = function (playerLabel) {
        return this.GetStoredNumberForPlayer(playerLabel, LocalStorageConstants.Player1TakeKey, LocalStorageConstants.Player2TakeKey);
    };
    LocalStorageManager.StoreTakeOfPlayer = function (playerLabel, take) {
        this.StoreNumberForPlayer(playerLabel, take, LocalStorageConstants.Player1TakeKey, LocalStorageConstants.Player2TakeKey);
    };
    LocalStorageManager.GetFoulCountOfPlayer = function (playerLabel) {
        return this.GetStoredNumberForPlayer(playerLabel, LocalStorageConstants.Player1FoulsKey, LocalStorageConstants.Player2FoulsKey);
    };
    LocalStorageManager.StoreFoulCountOfPlayer = function (playerLabel, foulCount) {
        this.StoreNumberForPlayer(playerLabel, foulCount, LocalStorageConstants.Player1FoulsKey, LocalStorageConstants.Player2FoulsKey);
    };
    LocalStorageManager.GetTargetScore = function () {
        return this.GetStoredNumber(LocalStorageConstants.TargetScoreKey);
    };
    LocalStorageManager.GetActivePlayer = function () {
        return localStorage.getItem(LocalStorageConstants.ActivePlayerKey);
    };
    LocalStorageManager.StoreActivePlayer = function (playerLabel) {
        localStorage.setItem(LocalStorageConstants.ActivePlayerKey, playerLabel);
    };
    LocalStorageManager.GetAmountOfRemainingBallsOnTable = function () {
        return this.GetStoredNumber(LocalStorageConstants.RemainingBallsOnTableKey);
    };
    LocalStorageManager.StoreAmountOfRemainingBallsOnTable = function (remainingBalls) {
        localStorage.setItem(LocalStorageConstants.RemainingBallsOnTableKey, "" + remainingBalls);
    };
    LocalStorageManager.StorePlayerName = function (playerLabel, playerName) {
        this.StoreStringForPlayer(playerLabel, playerName, LocalStorageConstants.Player1NameKey, LocalStorageConstants.Player2NameKey);
    };
    LocalStorageManager.GetPlayerName = function (playerLabel) {
        return this.GetStoredStringForPlayer(playerLabel, LocalStorageConstants.Player1NameKey, LocalStorageConstants.Player2NameKey);
    };
    LocalStorageManager.StoreTargetScore = function (targetScore) {
        localStorage.setItem(LocalStorageConstants.TargetScoreKey, "" + targetScore);
    };
    LocalStorageManager.StoreGameState = function (gameState) {
        localStorage.setItem(LocalStorageConstants.GameStateKey, gameState);
    };
    LocalStorageManager.IsGameInProgress = function () {
        return localStorage.getItem(LocalStorageConstants.GameStateKey) === LocalStorageConstants.GameStateInProgress;
    };
    return LocalStorageManager;
}());
var PlayerConstants = (function () {
    function PlayerConstants() {
    }
    PlayerConstants.Player1 = "player1";
    PlayerConstants.Player2 = "player2";
    return PlayerConstants;
}());
var StartGameInfo = (function () {
    function StartGameInfo(NameOfPlayer1, NameOfPlayer2, TargetScore) {
        this.NameOfPlayer1 = NameOfPlayer1;
        this.NameOfPlayer2 = NameOfPlayer2;
        this.TargetScore = TargetScore;
    }
    return StartGameInfo;
}());
var UserInputGateway = (function () {
    function UserInputGateway() {
    }
    UserInputGateway.ShowDialog = function (dialogId) {
        GameViewManager.SetVisibilityOfDialog(dialogId, true);
    };
    UserInputGateway.HideDialog = function (dialogId, event) {
        HtmlUtils.StopPropagation(event);
        GameViewManager.SetVisibilityOfDialog(dialogId, false);
    };
    UserInputGateway.ReturnToMenu = function (event) {
        this.HideDialog("confirm_abort_dialog", event);
        GameManager.ReturnToMenu();
    };
    UserInputGateway.CreateNewGame = function () {
        GameManager.CreateNewGame();
    };
    UserInputGateway.SwitchPlayer = function () {
        GameManager.SwitchPlayer();
    };
    UserInputGateway.SetRemainingBallsFromDialog = function (remainingBalls, event) {
        HtmlUtils.StopPropagation(event);
        GameManager.SetRemainingBallsFromDialog(remainingBalls);
    };
    UserInputGateway.Undo = function () {
        GameManager.Undo();
    };
    UserInputGateway.NewRack = function () {
        GameManager.NewRack();
    };
    UserInputGateway.IncrementOne = function () {
        GameManager.ChangeAmountOfRemainingBalls(1);
    };
    UserInputGateway.DecrementOne = function () {
        GameManager.ChangeAmountOfRemainingBalls(-1);
    };
    UserInputGateway.Foul = function () {
        GameManager.Foul();
    };
    UserInputGateway.CaptureOutsideDialogClick = function (dialogId) {
        GameViewManager.SetVisibilityOfDialog(dialogId, false);
    };
    UserInputGateway.ReloadStoredState = function () {
        GameManager.ReloadStoredState();
    };
    return UserInputGateway;
}());
var Validator = (function () {
    function Validator() {
    }
    Validator.IsNumeric = function (value) {
        return /^\d+$/.test(value);
    };
    return Validator;
}());
//# sourceMappingURL=141.js.map