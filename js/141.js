var ActionIds = (function () {
    function ActionIds() {
    }
    ActionIds.Switch = 0;
    ActionIds.SetRemainingBalls = 1;
    ActionIds.Foul = 2;
    ActionIds.NewRack = 3;
    return ActionIds;
}());
var GameAction = (function () {
    function GameAction(Id, Context) {
        this.Id = Id;
        this.Context = Context;
    }
    return GameAction;
}());
var GameManager = (function () {
    function GameManager() {
    }
    GameManager.ReturnToMenu = function () {
        LocalStorageManager.StoreActiveView(LocalStorageConstants.MenuView);
        this.ShowActiveView();
    };
    GameManager.CreateNewGame = function () {
        LocalStorageManager.StoreActions([]);
        var startGameInfo = GameViewManager.ExtractStartGameInfo();
        if (startGameInfo === null) {
            return;
        }
        var gameState = new GameState(PlayerConstants.Player1, startGameInfo.TargetScore, 15);
        LocalStorageManager.StoreGameState(gameState);
        GameViewManager.HighlightActivePlayer(PlayerConstants.Player1);
        GameViewManager.UnlockControls();
        var player1State = new PlayerState(startGameInfo.NameOfPlayer1, PlayerConstants.Player1);
        var player2State = new PlayerState(startGameInfo.NameOfPlayer2, PlayerConstants.Player2);
        player1State.Take = 1;
        LocalStorageManager.StorePlayerState(PlayerConstants.Player1, player1State);
        LocalStorageManager.StorePlayerState(PlayerConstants.Player2, player2State);
        LocalStorageManager.StoreActiveView(LocalStorageConstants.GameView);
        this.ReloadStoredState();
        this.ShowActiveView();
    };
    GameManager.ShowActiveView = function () {
        var isGameInProgress = LocalStorageManager.IsGameInProgress();
        if (isGameInProgress) {
            GameViewManager.ShowGameView();
        }
        else {
            GameViewManager.ShowMenuView();
        }
    };
    GameManager.SwitchPlayer = function () {
        var gameState = LocalStorageManager.GetGameState();
        var playerState1 = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        var playerState2 = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);
        this.SwitchPlayerInternal(gameState, playerState1, playerState2);
        LocalStorageManager.StorePlayerState(playerState1.Label, playerState1);
        LocalStorageManager.StorePlayerState(playerState2.Label, playerState2);
        LocalStorageManager.StoreGameState(gameState);
        GameViewManager.HighlightActivePlayer(gameState.ActivePlayer);
        this.UpdateView();
        this.RecordAction(ActionIds.Switch, 0);
    };
    GameManager.SwitchPlayerInternal = function (gameState, playerState1, playerState2) {
        var activePlayerState = gameState.ActivePlayer === PlayerConstants.Player1 ? playerState1 : playerState2;
        var nextPlayerState = gameState.ActivePlayer === PlayerConstants.Player1 ? playerState2 : playerState1;
        this.UpdateHighestSeriesIfNecessary(activePlayerState);
        activePlayerState.PreviousScore = activePlayerState.CurrentScore;
        nextPlayerState.Take += 1;
        gameState.ActivePlayer = nextPlayerState.Label;
    };
    GameManager.Undo = function () {
        var actions = LocalStorageManager.GetActions();
        actions.pop();
        this.ReplayActions(actions);
        LocalStorageManager.StoreActions(actions);
    };
    GameManager.ReplayActions = function (actions) {
        var playerState1Before = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        var playerState2Before = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);
        var gameStateBefore = LocalStorageManager.GetGameState();
        var playerState1 = new PlayerState(playerState1Before.Name, PlayerConstants.Player1);
        var playerState2 = new PlayerState(playerState2Before.Name, PlayerConstants.Player2);
        var gameState = new GameState(PlayerConstants.Player1, gameStateBefore.TargetScore, 15);
        for (var i = 0; i < actions.length; i++) {
            var currentAction = actions[i];
            switch (currentAction.Id) {
                case ActionIds.Switch:
                    this.SwitchPlayerInternal(gameState, playerState1, playerState2);
                    break;
                case ActionIds.SetRemainingBalls:
                    this.SetRemainingBallsInternal(currentAction.Context, gameState, playerState1, playerState2);
                    break;
                case ActionIds.Foul:
                    this.ApplyFoulPointsInternal(currentAction.Context === 1, gameState, playerState1, playerState2);
                    break;
                case ActionIds.NewRack:
                    this.NewRackInternal(gameState, playerState1, playerState2);
                    break;
            }
        }
        LocalStorageManager.StoreGameState(gameState);
        LocalStorageManager.StorePlayerState(playerState1.Label, playerState1);
        LocalStorageManager.StorePlayerState(playerState2.Label, playerState2);
        this.UpdateView();
        GameViewManager.HighlightActivePlayer(gameState.ActivePlayer);
    };
    GameManager.NewRack = function () {
        var gameState = LocalStorageManager.GetGameState();
        var playerState1 = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        var playerState2 = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);
        this.NewRackInternal(gameState, playerState1, playerState2);
        LocalStorageManager.StorePlayerState(playerState1.Label, playerState1);
        LocalStorageManager.StorePlayerState(playerState2.Label, playerState2);
        this.UpdateView();
        this.RecordAction(ActionIds.NewRack, 0);
    };
    GameManager.NewRackInternal = function (gameState, playerState1, playerState2) {
        var activePlayerState = gameState.ActivePlayer === PlayerConstants.Player1 ? playerState1 : playerState2;
        this.ChangePlayerScore(activePlayerState, 14);
    };
    GameManager.Foul = function () {
        var gameState = LocalStorageManager.GetGameState();
        var activePlayerState = LocalStorageManager.GetPlayerState(gameState.ActivePlayer);
        if (activePlayerState.Take === 1) {
            GameViewManager.SetVisibilityOfElement("break_foul_dialog", true);
            return;
        }
        this.HandleNormalFoul();
    };
    GameManager.HandleBreakFoul = function () {
        this.ApplyFoulPoints(true);
    };
    GameManager.HandleNormalFoul = function () {
        this.ApplyFoulPoints(false);
    };
    GameManager.ApplyFoulPoints = function (isBreakFoul) {
        var gameState = LocalStorageManager.GetGameState();
        var playerState1 = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        var playerState2 = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);
        this.ApplyFoulPointsInternal(isBreakFoul, gameState, playerState1, playerState2);
        LocalStorageManager.StorePlayerState(playerState1.Label, playerState1);
        LocalStorageManager.StorePlayerState(playerState2.Label, playerState2);
        LocalStorageManager.StoreGameState(gameState);
        GameViewManager.HighlightActivePlayer(gameState.ActivePlayer);
        this.UpdateView();
        this.RecordAction(ActionIds.Foul, isBreakFoul ? 1 : 0);
    };
    GameManager.ApplyFoulPointsInternal = function (isBreakFoul, gameState, playerState1, playerState2) {
        var activePlayerState = gameState.ActivePlayer === PlayerConstants.Player1 ? playerState1 : playerState2;
        activePlayerState.FoulCount += 1;
        var negativePoints = -1;
        if (isBreakFoul) {
            negativePoints = -2;
        }
        if (activePlayerState.FoulCount % 3 === 0) {
            negativePoints = -16;
        }
        activePlayerState.CurrentScore += negativePoints;
        this.SwitchPlayerInternal(gameState, playerState1, playerState2);
    };
    GameManager.ReloadStoredState = function () {
        if (!LocalStorageManager.IsStorageVersionUpToDate()) {
            alert("Der gespeicherte Zustand ist nicht mit der aktuellen Version kompatibel.");
            LocalStorageManager.Clear();
        }
        LocalStorageManager.StoreStorageVersion();
        this.ShowActiveView();
        if (!LocalStorageManager.IsGameInProgress()) {
            return;
        }
        var playerState1 = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        var playerState2 = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);
        GameViewManager.UpdatePlayerNames(playerState1.Name, playerState2.Name);
        this.UpdateView();
        var gameState = LocalStorageManager.GetGameState();
        GameViewManager.HighlightActivePlayer(gameState.ActivePlayer);
    };
    GameManager.UpdateHighestSeriesIfNecessary = function (playerState) {
        var currentSeries = playerState.CurrentScore - playerState.PreviousScore;
        if (currentSeries > playerState.HighestSeries) {
            playerState.HighestSeries = currentSeries;
        }
    };
    GameManager.SetRemainingBalls = function (remainingBalls) {
        var gameState = LocalStorageManager.GetGameState();
        var playerState1 = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        var playerState2 = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);
        this.SetRemainingBallsInternal(remainingBalls, gameState, playerState1, playerState2);
        LocalStorageManager.StoreGameState(gameState);
        LocalStorageManager.StorePlayerState(playerState1.Label, playerState1);
        LocalStorageManager.StorePlayerState(playerState2.Label, playerState2);
        this.UpdateView();
        this.RecordAction(ActionIds.SetRemainingBalls, remainingBalls);
    };
    GameManager.SetRemainingBallsInternal = function (remainingBalls, gameState, playerState1, playerState2) {
        var activePlayerState = gameState.ActivePlayer === PlayerConstants.Player1 ? playerState1 : playerState2;
        var remainingBallsBefore = gameState.RemainingBallsOnTable;
        var delta = remainingBallsBefore - remainingBalls;
        this.ChangePlayerScore(activePlayerState, delta);
        if (remainingBalls === 1 || remainingBalls === 0) {
            remainingBalls = 15;
        }
        gameState.RemainingBallsOnTable = remainingBalls;
    };
    GameManager.ChangePlayerScore = function (activePlayerState, delta) {
        if (delta > 0) {
            activePlayerState.FoulCount = 0;
        }
        activePlayerState.CurrentScore += delta;
    };
    GameManager.ChangeAmountOfRemainingBalls = function (delta) {
        var gameState = LocalStorageManager.GetGameState();
        var remainingBallsBefore = gameState.RemainingBallsOnTable;
        var remainingBalls = remainingBallsBefore + delta;
        if (remainingBalls > 15) {
            return;
        }
        this.SetRemainingBalls(remainingBalls);
    };
    GameManager.UpdateView = function () {
        var gameState = LocalStorageManager.GetGameState();
        var playerState1 = LocalStorageManager.GetPlayerState(PlayerConstants.Player1);
        var playerState2 = LocalStorageManager.GetPlayerState(PlayerConstants.Player2);
        GameViewManager.SetRemainingBallsOnTableDisplayValue(gameState.RemainingBallsOnTable);
        this.UpdateViewForPlayer(PlayerConstants.Player1, playerState1, gameState.TargetScore);
        this.UpdateViewForPlayer(PlayerConstants.Player2, playerState2, gameState.TargetScore);
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
    GameManager.RecordAction = function (actionId, actionContext) {
        var actions = LocalStorageManager.GetActions();
        actions.push(new GameAction(actionId, actionContext));
        LocalStorageManager.StoreActions(actions);
    };
    return GameManager;
}());
var GameState = (function () {
    function GameState(ActivePlayer, TargetScore, RemainingBallsOnTable) {
        this.ActivePlayer = ActivePlayer;
        this.TargetScore = TargetScore;
        this.RemainingBallsOnTable = RemainingBallsOnTable;
    }
    return GameState;
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
    LocalStorageConstants.GameStateKey = "game_state";
    LocalStorageConstants.ActionsKey = "actions";
    LocalStorageConstants.ActiveViewKey = "active_view";
    LocalStorageConstants.StorageVersionKey = "storage_verison";
    LocalStorageConstants.GameView = "game_view";
    LocalStorageConstants.MenuView = "menu_view";
    LocalStorageConstants.StorageVersion = "0.4";
    return LocalStorageConstants;
}());
var LocalStorageManager = (function () {
    function LocalStorageManager() {
    }
    LocalStorageManager.StoreGameState = function (gameState) {
        var json = JSON.stringify(gameState);
        localStorage.setItem(LocalStorageConstants.GameStateKey, json);
    };
    LocalStorageManager.GetGameState = function () {
        var json = localStorage.getItem(LocalStorageConstants.GameStateKey);
        return JSON.parse(json);
    };
    LocalStorageManager.StoreActiveView = function (viewId) {
        localStorage.setItem(LocalStorageConstants.ActiveViewKey, viewId);
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
    LocalStorageManager.GetActions = function () {
        var json = localStorage.getItem(LocalStorageConstants.ActionsKey);
        return JSON.parse(json);
    };
    LocalStorageManager.StoreActions = function (actions) {
        var json = JSON.stringify(actions);
        localStorage.setItem(LocalStorageConstants.ActionsKey, json);
    };
    LocalStorageManager.IsGameInProgress = function () {
        return localStorage.getItem(LocalStorageConstants.ActiveViewKey) === LocalStorageConstants.GameView;
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
    function PlayerState(name, label) {
        this.Name = name;
        this.Label = label;
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