var ActionIds = (function () {
    function ActionIds() {
    }
    ActionIds.Switch = 0;
    ActionIds.SetRemainingBalls = 1;
    ActionIds.Foul = 2;
    ActionIds.NewRack = 3;
    return ActionIds;
}());
var CompleteState = (function () {
    function CompleteState(GameState, PlayerState1, PlayerState2) {
        this.GameState = GameState;
        this.PlayerState1 = PlayerState1;
        this.PlayerState2 = PlayerState2;
    }
    return CompleteState;
}());
var GameAction = (function () {
    function GameAction(Id, Context) {
        this.Id = Id;
        this.Context = Context;
    }
    return GameAction;
}());
var GameLogic = (function () {
    function GameLogic() {
    }
    GameLogic.SwitchPlayer = function (state) {
        var activePlayerState = StateHelper.GetActivePlayerState(state);
        var nextPlayerState = StateHelper.GetInactivePlayerState(state);
        this.UpdateHighestSeriesIfNecessary(activePlayerState);
        activePlayerState.PreviousScore = activePlayerState.CurrentScore;
        nextPlayerState.Take += 1;
        state.GameState.ActivePlayer = nextPlayerState.Label;
    };
    GameLogic.NewRack = function (state) {
        var activePlayerState = StateHelper.GetActivePlayerState(state);
        var remainingBallsUntilReRack = state.GameState.RemainingBallsOnTable - 1;
        this.ChangePlayerScore(activePlayerState, remainingBallsUntilReRack);
        state.GameState.RemainingBallsOnTable = 15;
    };
    GameLogic.ApplyFoulPoints = function (isBreakFoul, state) {
        var activePlayerState = StateHelper.GetActivePlayerState(state);
        activePlayerState.FoulCount += 1;
        var negativePoints = -1;
        if (isBreakFoul) {
            negativePoints = -2;
        }
        if (activePlayerState.FoulCount % 3 === 0) {
            negativePoints = -16;
        }
        activePlayerState.CurrentScore += negativePoints;
        this.SwitchPlayer(state);
    };
    GameLogic.SetRemainingBalls = function (remainingBalls, state) {
        var activePlayerState = StateHelper.GetActivePlayerState(state);
        var remainingBallsBefore = state.GameState.RemainingBallsOnTable;
        var delta = remainingBallsBefore - remainingBalls;
        this.ChangePlayerScore(activePlayerState, delta);
        if (remainingBalls === 1 || remainingBalls === 0) {
            remainingBalls = 15;
        }
        state.GameState.RemainingBallsOnTable = remainingBalls;
    };
    GameLogic.ReplayActions = function (actions, state) {
        for (var i = 0; i < actions.length; i++) {
            var currentAction = actions[i];
            switch (currentAction.Id) {
                case ActionIds.Switch:
                    GameLogic.SwitchPlayer(state);
                    break;
                case ActionIds.SetRemainingBalls:
                    GameLogic.SetRemainingBalls(currentAction.Context, state);
                    break;
                case ActionIds.Foul:
                    GameLogic.ApplyFoulPoints(currentAction.Context === 1, state);
                    break;
                case ActionIds.NewRack:
                    GameLogic.NewRack(state);
                    break;
            }
        }
    };
    GameLogic.ChangePlayerScore = function (activePlayerState, delta) {
        if (delta > 0) {
            activePlayerState.FoulCount = 0;
        }
        activePlayerState.CurrentScore += delta;
    };
    GameLogic.UpdateHighestSeriesIfNecessary = function (playerState) {
        var currentSeries = playerState.CurrentScore - playerState.PreviousScore;
        if (currentSeries > playerState.HighestSeries) {
            playerState.HighestSeries = currentSeries;
        }
    };
    return GameLogic;
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
        GameViewManager.HighlightActivePlayer(PlayerConstants.Player1);
        GameViewManager.UnlockControls();
        var state = this.CreateCompleteState(startGameInfo.NameOfPlayer1, startGameInfo.NameOfPlayer2, startGameInfo.TargetScore);
        LocalStorageManager.StoreState(state);
        LocalStorageManager.StoreActiveView(LocalStorageConstants.GameView);
        this.ReloadStoredState();
        this.ShowActiveView();
    };
    GameManager.CreateCompleteState = function (nameOfPlayer1, nameOfPlayer2, targetScore) {
        var gameState = new GameState(PlayerConstants.Player1, targetScore, 15);
        var player1State = new PlayerState(nameOfPlayer1, PlayerConstants.Player1);
        var player2State = new PlayerState(nameOfPlayer2, PlayerConstants.Player2);
        player1State.Take = 1;
        return new CompleteState(gameState, player1State, player2State);
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
        var state = LocalStorageManager.GetState();
        GameLogic.SwitchPlayer(state);
        LocalStorageManager.StoreState(state);
        GameViewManager.HighlightActivePlayer(state.GameState.ActivePlayer);
        this.UpdateView();
        this.RecordAction(ActionIds.Switch, 0);
    };
    GameManager.Undo = function () {
        var actions = LocalStorageManager.GetActions();
        if (actions.length === 0) {
            return;
        }
        actions.pop();
        this.ReplayActions(actions);
        LocalStorageManager.StoreActions(actions);
    };
    GameManager.ReplayActions = function (actions) {
        var stateBefore = LocalStorageManager.GetState();
        var state = this.CreateCompleteState(stateBefore.PlayerState1.Name, stateBefore.PlayerState2.Name, stateBefore.GameState.TargetScore);
        GameLogic.ReplayActions(actions, state);
        LocalStorageManager.StoreState(state);
        GameViewManager.UnlockControls();
        this.UpdateView();
        GameViewManager.HighlightActivePlayer(state.GameState.ActivePlayer);
    };
    GameManager.NewRack = function () {
        var state = LocalStorageManager.GetState();
        GameLogic.NewRack(state);
        LocalStorageManager.StoreState(state);
        this.UpdateView();
        this.RecordAction(ActionIds.NewRack, 0);
    };
    GameManager.Foul = function () {
        var state = LocalStorageManager.GetState();
        var activePlayerState = StateHelper.GetActivePlayerState(state);
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
        var state = LocalStorageManager.GetState();
        GameLogic.ApplyFoulPoints(isBreakFoul, state);
        LocalStorageManager.StoreState(state);
        GameViewManager.HighlightActivePlayer(state.GameState.ActivePlayer);
        this.UpdateView();
        this.RecordAction(ActionIds.Foul, isBreakFoul ? 1 : 0);
    };
    GameManager.ReloadStoredState = function () {
        GameViewManager.LocalizeView();
        if (!LocalStorageManager.IsStorageVersionUpToDate()) {
            GameViewManager.ShowIncompatibleStorageVersionMessage();
            LocalStorageManager.Clear();
        }
        LocalStorageManager.StoreStorageVersion();
        this.ShowActiveView();
        if (!LocalStorageManager.IsGameInProgress()) {
            return;
        }
        var state = LocalStorageManager.GetState();
        GameViewManager.UpdatePlayerNames(state.PlayerState1.Name, state.PlayerState2.Name);
        this.UpdateView();
        GameViewManager.HighlightActivePlayer(state.GameState.ActivePlayer);
    };
    GameManager.SetRemainingBalls = function (remainingBalls) {
        var state = LocalStorageManager.GetState();
        GameLogic.SetRemainingBalls(remainingBalls, state);
        LocalStorageManager.StoreState(state);
        this.UpdateView();
        this.RecordAction(ActionIds.SetRemainingBalls, remainingBalls);
    };
    GameManager.ChangeAmountOfRemainingBalls = function (delta) {
        var state = LocalStorageManager.GetState();
        var remainingBallsBefore = state.GameState.RemainingBallsOnTable;
        var remainingBalls = remainingBallsBefore + delta;
        if (remainingBalls > 15) {
            return;
        }
        this.SetRemainingBalls(remainingBalls);
    };
    GameManager.UpdateView = function () {
        var state = LocalStorageManager.GetState();
        GameViewManager.SetRemainingBallsOnTableDisplayValue(state.GameState.RemainingBallsOnTable);
        this.UpdateViewForPlayer(PlayerConstants.Player1, state.PlayerState1, state.GameState.TargetScore);
        this.UpdateViewForPlayer(PlayerConstants.Player2, state.PlayerState2, state.GameState.TargetScore);
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
        HtmlUtils.SetInnerHtmlById(playerLabel + "_highest", "" + playerState.HighestSeries);
        HtmlUtils.SetInnerHtmlById(playerLabel + "_take", "" + playerState.Take);
        HtmlUtils.SetInnerHtmlById(playerLabel + "_score", "" + playerState.CurrentScore);
    };
    GameViewManager.UpdateCalculatedPlayerDetails = function (playerLabel, remainingBalls, average, series) {
        HtmlUtils.SetInnerHtmlById(playerLabel + "_remaining", "" + remainingBalls);
        HtmlUtils.SetInnerHtmlById(playerLabel + "_average", "Ø: " + average.toFixed(2));
        HtmlUtils.SetInnerHtmlById(playerLabel + "_series_counter", "" + series);
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
        HtmlUtils.SetInnerHtmlById("win_dialog_text", nameOfWinner + Localizer.GetTranslation("lkPlayerHasWonTheGame"));
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
            alert(Localizer.GetTranslation("lkMissingNamePlayer1"));
            return null;
        }
        if (nameOfPlayer2 === "") {
            alert(Localizer.GetTranslation("lkMissingNamePlayer2"));
            return null;
        }
        if (!Validator.IsNumeric(targetScoreString)) {
            alert(Localizer.GetTranslation("lkInvalidTargetScore"));
            return null;
        }
        var targetScore = Number(targetScoreString);
        if (targetScore < 20 || targetScore > 400) {
            alert(Localizer.GetTranslation("lkInvalidTargetScore"));
            return null;
        }
        return new StartGameInfo(nameOfPlayer1, nameOfPlayer2, targetScore);
    };
    GameViewManager.ShowIncompatibleStorageVersionMessage = function () {
        alert(Localizer.GetTranslation("lkStorageVersionIncompatible"));
    };
    GameViewManager.LocalizeView = function () {
        document.getElementById("menu_player1_name").setAttribute("placeholder", Localizer.GetTranslation("lkPlayer1"));
        document.getElementById("menu_player2_name").setAttribute("placeholder", Localizer.GetTranslation("lkPlayer2"));
        document.getElementById("menu_target_score").setAttribute("placeholder", Localizer.GetTranslation("lkTargetScore"));
        HtmlUtils.SetInnerHtmlByClass("text-yes", Localizer.GetTranslation("lkYes"));
        HtmlUtils.SetInnerHtmlByClass("text-no", Localizer.GetTranslation("lkNo"));
        HtmlUtils.SetInnerHtmlByClass("text-ok", Localizer.GetTranslation("lkOk"));
        HtmlUtils.SetInnerHtmlByClass("text-take", Localizer.GetTranslation("lkTake"));
        HtmlUtils.SetInnerHtmlByClass("text-highest", Localizer.GetTranslation("lkHighestSeries"));
        HtmlUtils.SetInnerHtmlByClass("text-remaining", Localizer.GetTranslation("lkRemainingBalls"));
        HtmlUtils.SetInnerHtmlByClass("text-series", Localizer.GetTranslation("lkSeries"));
        HtmlUtils.SetInnerHtmlById("abort_game_text", Localizer.GetTranslation("lkAbortGame"));
        HtmlUtils.SetInnerHtmlById("break_foul_text", Localizer.GetTranslation("lkBreakFoul"));
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
    HtmlUtils.SetInnerHtmlByClass = function (className, innerHtml) {
        var elements = document.querySelectorAll("." + className);
        elements.forEach(function (e) { return e.innerHTML = innerHtml; });
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
    LocalStorageConstants.StateKey = "state";
    LocalStorageConstants.ActionsKey = "actions";
    LocalStorageConstants.ActiveViewKey = "active_view";
    LocalStorageConstants.StorageVersionKey = "storage_verison";
    LocalStorageConstants.GameView = "game_view";
    LocalStorageConstants.MenuView = "menu_view";
    LocalStorageConstants.StorageVersion = "0.5";
    return LocalStorageConstants;
}());
var LocalStorageManager = (function () {
    function LocalStorageManager() {
    }
    LocalStorageManager.StoreState = function (state) {
        localStorage.setItem(LocalStorageConstants.StateKey, JSON.stringify(state));
    };
    LocalStorageManager.GetState = function () {
        var json = localStorage.getItem(LocalStorageConstants.StateKey);
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
    LocalStorageManager.StoreActiveView = function (viewId) {
        localStorage.setItem(LocalStorageConstants.ActiveViewKey, viewId);
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
var Localizer = (function () {
    function Localizer() {
    }
    Localizer.GetTranslation = function (languageKey) {
        if (/^de\b/.test(navigator.language)) {
            return this.GetTranslationFromDictionary(languageKey, this._germanTranslationByLanguageKey);
        }
        return this.GetTranslationFromDictionary(languageKey, this._englishTranslationByLanguageKey);
    };
    Localizer.GetTranslationFromDictionary = function (languageKey, dictionary) {
        if (languageKey in dictionary) {
            return dictionary[languageKey];
        }
        return languageKey;
    };
    Localizer._germanTranslationByLanguageKey = {
        "lkPlayer1": "Spieler 1",
        "lkPlayer2": "Spieler 2",
        "lkTargetScore": "Spiel auf",
        "lkYes": "Ja",
        "lkNo": "Nein",
        "lkOk": "Ok",
        "lkHighestSeries": "H:",
        "lkTake": "A:",
        "lkRemainingBalls": "R:",
        "lkSeries": "Serie:",
        "lkMissingNamePlayer1": "Bitte einen Namen für Spieler 1 eingeben.",
        "lkMissingNamePlayer2": "Bitte einen Namen für Spieler 2 eingeben.",
        "lkInvalidTargetScore": "Bitte eine gültige Zahl für die Zielpunktzahl eingeben.",
        "lkPlayerHasWonTheGame": " hat das Spiel gewonnen.",
        "lkAbortGame": "Soll das Spiel wirklich abgebrochen werden?",
        "lkBreakFoul": "War es ein Foul beim Break?",
        "lkStorageVersionIncompatible": "Der gespeicherte Zustand ist nicht mit der neuen Version kompatibel und wird zurückgesetzt."
    };
    Localizer._englishTranslationByLanguageKey = {
        "lkPlayer1": "Player 1",
        "lkPlayer2": "Player 2",
        "lkTargetScore": "Target score",
        "lkYes": "Yes",
        "lkNo": "No",
        "lkOk": "Ok",
        "lkHighestSeries": "H:",
        "lkTake": "T:",
        "lkRemainingBalls": "R:",
        "lkSeries": "Series:",
        "lkMissingNamePlayer1": "Please enter a name for player 1.",
        "lkMissingNamePlayer2": "Please enter a name for player 2.",
        "lkInvalidTargetScore": "Please enter a valid target score.",
        "lkPlayerHasWonTheGame": " has won the game.",
        "lkAbortGame": "Do you really want to abort the game?",
        "lkBreakFoul": "Was it a break foul?",
        "lkStorageVersionIncompatible": "The saved state is not compatible with the new version and will be reset."
    };
    return Localizer;
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
var StateHelper = (function () {
    function StateHelper() {
    }
    StateHelper.GetActivePlayerState = function (state) {
        return state.GameState.ActivePlayer === PlayerConstants.Player1 ? state.PlayerState1 : state.PlayerState2;
    };
    StateHelper.GetInactivePlayerState = function (state) {
        return state.GameState.ActivePlayer === PlayerConstants.Player1 ? state.PlayerState2 : state.PlayerState1;
    };
    return StateHelper;
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