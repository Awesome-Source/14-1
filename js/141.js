var GameManager = (function () {
    function GameManager() {
    }
    GameManager.ReturnToMenu = function () {
        LocalStorageManager.StoreGameState(LocalStorageConstants.GameStateNoGame);
        this.ShowViewDependingOnGameState();
    };
    GameManager.CreateNewGame = function () {
        this.SetActivePlayer(PlayerConstants.Player1);
        LocalStorageManager.StoreAmountOfRemainingBallsOnTable(15);
        GameViewManager.UnlockControls();
        var startGameInfo = GameViewManager.ExtractStartGameInfo();
        if (startGameInfo === null) {
            return;
        }
        var player1State = new PlayerState(startGameInfo.NameOfPlayer1);
        var player2State = new PlayerState(startGameInfo.NameOfPlayer2);
        player1State.Take = 1;
        LocalStorageManager.StorePlayerState(PlayerConstants.Player1, player1State);
        LocalStorageManager.StorePlayerState(PlayerConstants.Player2, player2State);
        LocalStorageManager.StoreTargetScore(startGameInfo.TargetScore);
        LocalStorageManager.StoreGameState(LocalStorageConstants.GameStateInProgress);
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
        var activePlayerState = LocalStorageManager.GetPlayerState(activePlayer);
        var nextPlayerState = LocalStorageManager.GetPlayerState(nextPlayer);
        this.UpdateHighestSeriesIfNecessary(activePlayerState);
        activePlayerState.PreviousScore = activePlayerState.CurrentScore;
        nextPlayerState.Take += 1;
        LocalStorageManager.StorePlayerState(activePlayer, activePlayerState);
        LocalStorageManager.StorePlayerState(nextPlayer, nextPlayerState);
        this.SetActivePlayer(nextPlayer);
        this.UpdateView();
    };
    GameManager.Undo = function () {
    };
    GameManager.NewRack = function () {
        this.ChangePlayerScore(LocalStorageManager.GetActivePlayer(), 14);
        this.UpdateView();
    };
    GameManager.Foul = function () {
        var activePlayer = LocalStorageManager.GetActivePlayer();
        var activePlayerState = LocalStorageManager.GetPlayerState(activePlayer);
        if (activePlayerState.Take === 1) {
            GameViewManager.SetVisibilityOfElement("break_foul_dialog", true);
            return;
        }
        this.HandleNormalFoul();
    };
    GameManager.HandleBreakFoul = function () {
        var activePlayer = LocalStorageManager.GetActivePlayer();
        var activePlayerState = LocalStorageManager.GetPlayerState(activePlayer);
        activePlayerState.FoulCount += 1;
        this.ApplyFoulPoints(activePlayer, activePlayerState, -2);
    };
    GameManager.HandleNormalFoul = function () {
        var activePlayer = LocalStorageManager.GetActivePlayer();
        var activePlayerState = LocalStorageManager.GetPlayerState(activePlayer);
        activePlayerState.FoulCount += 1;
        if (activePlayerState.FoulCount % 3 === 0) {
            this.ApplyFoulPoints(activePlayer, activePlayerState, -16);
            return;
        }
        this.ApplyFoulPoints(activePlayer, activePlayerState, -1);
    };
    GameManager.ApplyFoulPoints = function (activePlayer, playerState, negativePoints) {
        playerState.CurrentScore += negativePoints;
        LocalStorageManager.StorePlayerState(activePlayer, playerState);
        this.UpdateView();
        this.SwitchPlayer();
    };
    GameManager.ReloadStoredState = function () {
        if (!LocalStorageManager.IsStorageVersionUpToDate()) {
            alert("Der gespeicherte Zustand ist nicht mit der aktuellen Version kompatibel.");
            LocalStorageManager.Clear();
        }
        LocalStorageManager.StoreStorageVersion();
        this.ShowViewDependingOnGameState();
        if (!LocalStorageManager.IsGameInProgress()) {
            return;
        }
        var playerState1 = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        var playerState2 = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);
        GameViewManager.UpdatePlayerNames(playerState1.Name, playerState2.Name);
        this.UpdateView();
        this.SetActivePlayer(LocalStorageManager.GetActivePlayer());
    };
    GameManager.UpdateHighestSeriesIfNecessary = function (playerState) {
        var currentSeries = playerState.CurrentScore - playerState.PreviousScore;
        if (currentSeries > playerState.HighestSeries) {
            playerState.HighestSeries = currentSeries;
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
        this.UpdateView();
    };
    GameManager.ChangePlayerScore = function (playerLabel, delta) {
        var playerState = LocalStorageManager.GetPlayerState(playerLabel);
        if (delta > 0) {
            playerState.FoulCount = 0;
        }
        playerState.CurrentScore += delta;
        LocalStorageManager.StorePlayerState(playerLabel, playerState);
    };
    GameManager.ChangeAmountOfRemainingBalls = function (delta) {
        var remainingBallsBefore = LocalStorageManager.GetAmountOfRemainingBallsOnTable();
        var remainingBalls = remainingBallsBefore + delta;
        if (remainingBalls > 15) {
            return;
        }
        this.SetRemainingBalls(remainingBalls);
    };
    GameManager.UpdateView = function () {
        var targetScore = LocalStorageManager.GetTargetScore();
        var remainingBallsOnTable = LocalStorageManager.GetAmountOfRemainingBallsOnTable();
        var playerState1 = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        var playerState2 = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);
        GameViewManager.SetRemainingBallsOnTableDisplayValue(remainingBallsOnTable);
        this.UpdateViewForPlayer(PlayerConstants.Player1, playerState1, targetScore);
        this.UpdateViewForPlayer(PlayerConstants.Player2, playerState2, targetScore);
    };
    GameManager.UpdateViewForPlayer = function (playerLabel, playerState, targetScore) {
        var remainingBalls = Math.max(0, targetScore - playerState.CurrentScore);
        var average = playerState.CurrentScore / Math.max(playerState.Take, 1);
        var series = playerState.CurrentScore - playerState.PreviousScore;
        GameViewManager.UpdateCalculatedPlayerDetails(playerLabel, remainingBalls, average, series);
        GameViewManager.UpdatePlayerStateDetails(playerLabel, playerState);
        if (remainingBalls === 0) {
            GameViewManager.ShowWinDialog(playerState.Name);
        }
    };
    return GameManager;
}());
var GameViewManager = (function () {
    function GameViewManager() {
    }
    GameViewManager.HighlightActivePlayer = function (playerLabel) {
        var player1ScoreElement = document.getElementById("player1_score");
        var player2ScoreElement = document.getElementById("player2_score");
        var player1NameElement = document.getElementById("player1_name").parentElement;
        var player2NameElement = document.getElementById("player2_name").parentElement;
        var player1SeriesElement = document.getElementById("player1_series_counter").parentElement;
        var player2SeriesElement = document.getElementById("player2_series_counter").parentElement;
        if (playerLabel === PlayerConstants.Player1) {
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
    };
    GameViewManager.SetVisibilityOfElement = function (elementId, isVisible) {
        var displayValue = isVisible ? "block" : "none";
        document.getElementById(elementId).style.display = displayValue;
    };
    GameViewManager.SetRemainingBallsOnTableDisplayValue = function (value) {
        HtmlUtils.SetInnerHtmlById("remaining_balls_display", "" + value);
    };
    GameViewManager.UpdatePlayerNames = function (nameOfPlayer1, nameOfPlayer2) {
        HtmlUtils.SetInnerHtmlById("player1_name", nameOfPlayer1);
        HtmlUtils.SetInnerHtmlById("player2_name", nameOfPlayer2);
    };
    GameViewManager.UpdatePlayerStateDetails = function (playerLabel, playerState) {
        HtmlUtils.SetInnerHtmlById(playerLabel + "_highest", "H: " + playerState.HighestSeries);
        HtmlUtils.SetInnerHtmlById(playerLabel + "_take", "A: " + playerState.Take);
        HtmlUtils.SetInnerHtmlById(playerLabel + "_score", "" + playerState.CurrentScore);
    };
    GameViewManager.UpdateCalculatedPlayerDetails = function (playerLabel, remainingBalls, average, series) {
        HtmlUtils.SetInnerHtmlById(playerLabel + "_remaining", "R: " + remainingBalls);
        HtmlUtils.SetInnerHtmlById(playerLabel + "_average", "Ø: " + average.toFixed(2));
        HtmlUtils.SetInnerHtmlById(playerLabel + "_series_counter", "Serie: " + series);
    };
    GameViewManager.ShowGameView = function () {
        HtmlUtils.ShowElementById("game_view");
        HtmlUtils.HideElementById("menu_view");
    };
    GameViewManager.ShowMenuView = function () {
        HtmlUtils.ShowElementById("menu_view");
        HtmlUtils.HideElementById("game_view");
    };
    GameViewManager.ShowWinDialog = function (nameOfWinner) {
        HtmlUtils.SetInnerHtmlById("win_dialog_text", nameOfWinner + " hat das Spiel gewonnen.");
        this.SetVisibilityOfElement("win_dialog", true);
        this.LockControls();
    };
    GameViewManager.LockControls = function () {
        var controls = this.GetLockableButtons();
        controls.forEach(function (c) { return c.disabled = true; });
    };
    GameViewManager.UnlockControls = function () {
        var controls = this.GetLockableButtons();
        controls.forEach(function (c) { return c.disabled = false; });
    };
    GameViewManager.GetLockableButtons = function () {
        var classNames = [".switch-player", ".remaining-balls", ".new-rack", ".minus", ".plus", ".foul"];
        return classNames.map(function (cn) { return document.querySelector(cn); });
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
        element.classList.add(classToAdd);
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
    LocalStorageConstants.Player1StateKey = "player1_state";
    LocalStorageConstants.Player2StateKey = "player2_state";
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
    LocalStorageConstants.StorageVersionKey = "storage_verison";
    LocalStorageConstants.GameStateInProgress = "in_progress";
    LocalStorageConstants.GameStateNoGame = "no_game";
    LocalStorageConstants.StorageVersion = "0.1";
    return LocalStorageConstants;
}());
var LocalStorageManager = (function () {
    function LocalStorageManager() {
    }
    LocalStorageManager.GetStoredNumber = function (key) {
        var value = localStorage.getItem(key);
        return Number(value);
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
    LocalStorageManager.StoreTargetScore = function (targetScore) {
        localStorage.setItem(LocalStorageConstants.TargetScoreKey, "" + targetScore);
    };
    LocalStorageManager.StoreGameState = function (gameState) {
        localStorage.setItem(LocalStorageConstants.GameStateKey, gameState);
    };
    LocalStorageManager.StorePlayerState = function (playerLabel, playerInfo) {
        var storageKey = playerLabel == PlayerConstants.Player1 ? LocalStorageConstants.Player1StateKey : LocalStorageConstants.Player2StateKey;
        localStorage.setItem(storageKey, JSON.stringify(playerInfo));
    };
    LocalStorageManager.GetPlayerState = function (playerLabel) {
        var storageKey = playerLabel == PlayerConstants.Player1 ? LocalStorageConstants.Player1StateKey : LocalStorageConstants.Player2StateKey;
        var json = localStorage.getItem(storageKey);
        return JSON.parse(json);
    };
    LocalStorageManager.IsGameInProgress = function () {
        return localStorage.getItem(LocalStorageConstants.GameStateKey) === LocalStorageConstants.GameStateInProgress;
    };
    LocalStorageManager.StoreStorageVersion = function () {
        localStorage.setItem(LocalStorageConstants.StorageVersionKey, LocalStorageConstants.StorageVersion);
    };
    LocalStorageManager.IsStorageVersionUpToDate = function () {
        var storageVersion = localStorage.getItem(LocalStorageConstants.StorageVersionKey);
        if (storageVersion === null || storageVersion === "") {
            return true;
        }
        return storageVersion === LocalStorageConstants.StorageVersion;
    };
    LocalStorageManager.Clear = function () {
        localStorage.clear();
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
var PlayerState = (function () {
    function PlayerState(name) {
        this.Name = name;
        this.CurrentScore = 0;
        this.PreviousScore = 0;
        this.HighestSeries = 0;
        this.Take = 0;
        this.FoulCount = 0;
    }
    return PlayerState;
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
        GameViewManager.SetVisibilityOfElement(dialogId, true);
    };
    UserInputGateway.HideDialog = function (dialogId, event) {
        HtmlUtils.StopPropagation(event);
        GameViewManager.SetVisibilityOfElement(dialogId, false);
    };
    UserInputGateway.StopPropagation = function (event) {
        HtmlUtils.StopPropagation(event);
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
        GameViewManager.SetVisibilityOfElement("remaining_balls_selection_dialog", false);
        GameManager.SetRemainingBalls(remainingBalls);
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
        GameViewManager.SetVisibilityOfElement(dialogId, false);
    };
    UserInputGateway.ReloadStoredState = function () {
        GameManager.ReloadStoredState();
    };
    UserInputGateway.HandleBreakFoul = function () {
        GameViewManager.SetVisibilityOfElement("break_foul_dialog", false);
        GameManager.HandleBreakFoul();
    };
    UserInputGateway.HandleNormalFoul = function () {
        GameViewManager.SetVisibilityOfElement("break_foul_dialog", false);
        GameManager.HandleNormalFoul();
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