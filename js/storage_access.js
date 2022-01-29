const _player1NameKey = "player1_name";
const _player2NameKey = "player2_name";
const _player1ScoreKey = "player1_score";
const _player2ScoreKey = "player2_score";
const _player1PreviousScoreKey = "player1_previous_score";
const _player2PreviousScoreKey = "player2_previous_score";
const _player1HighestSeriesKey = "player1_highest_series";
const _player2HighestSeriesKey = "player2_highest_series";
const _player1TakeKey = "player1_take";
const _player2TakeKey = "player2_take";
const _player1FoulsKey = "player1_fouls";
const _player2FoulsKey = "player2_fouls";
const _targetScoreKey = "target_score";
const _activePlayerKey = "active_player";
const _remainingBallsOnTableKey = "remaining_balls";
const _gameStateKey = "game_state";

const _gameStateInProgress = "in_progress";
const _gameStateNoGame = "no_game";

function GetCurrentScoreOfPlayer(playerLabel)
{
    const scoreStorageKey = playerLabel === _player1Label ? _player1ScoreKey : _player2ScoreKey;

    const playerScoreString = localStorage.getItem(scoreStorageKey);
    return Number(playerScoreString);
}

function SetCurrentScoreOfPlayer(playerLabel, score)
{
    const scoreStorageKey = playerLabel === _player1Label ? _player1ScoreKey : _player2ScoreKey;
    localStorage.setItem(scoreStorageKey, "" + score);
}

function GetPreviousScoreOfPlayer(playerLabel)
{
    const scoreStorageKey = playerLabel === _player1Label ? _player1PreviousScoreKey : _player2PreviousScoreKey;

    const playerScoreString = localStorage.getItem(scoreStorageKey);
    return Number(playerScoreString);
}

function SetPreviousScoreOfPlayer(playerLabel, score)
{
    const scoreStorageKey = playerLabel === _player1Label ? _player1PreviousScoreKey : _player2PreviousScoreKey;
    localStorage.setItem(scoreStorageKey, "" + score);
}

function GetHighestSeriesOfPlayer(playerLabel)
{
    const storageKey = playerLabel === _player1Label ? _player1HighestSeriesKey : _player2HighestSeriesKey;

    const playerScoreString = localStorage.getItem(storageKey);
    return Number(playerScoreString);
}

function SetHighestSeriesOfPlayer(playerLabel, score)
{
    const storageKey = playerLabel === _player1Label ? _player1HighestSeriesKey : _player2HighestSeriesKey;
    localStorage.setItem(storageKey, "" + score);
}

function GetStoredTakeOfPlayer(playerLabel)
{
    const takeStorageKey = playerLabel === _player1Label ? _player1TakeKey : _player2TakeKey;

    const playerScoreString = localStorage.getItem(takeStorageKey);
    return Number(playerScoreString);
}

function StoreTakeOfPlayer(playerLabel, score)
{
    const scoreStorageKey = playerLabel === _player1Label ? _player1TakeKey : _player2TakeKey;
    localStorage.setItem(scoreStorageKey, "" + score);
}

function GetStoredFoulCountOfPlayer(playerLabel)
{
    const foulStorageKey = playerLabel === _player1Label ? _player1FoulsKey : _player2FoulsKey;

    const playerScoreString = localStorage.getItem(foulStorageKey);
    return Number(playerScoreString);
}

function StoreFoulCountOfPlayer(playerLabel, score)
{
    const foulStorageKey = playerLabel === _player1Label ? _player1FoulsKey : _player2FoulsKey;
    localStorage.setItem(foulStorageKey, "" + score);
}

function GetStoredTargetScore()
{
    const targetScore = localStorage.getItem(_targetScoreKey);

    return Number(targetScore);
}

function GetActivePlayer()
{
    return localStorage.getItem(_activePlayerKey);
}

function StoreActivePlayer(playerLabel)
{
    localStorage.setItem(_activePlayerKey, playerLabel);
}

function GetStoredAmountOfRemainingBallsOnTable()
{
    const remainingBallsOnTable = localStorage.getItem(_remainingBallsOnTableKey);

    return Number(remainingBallsOnTable);
}

function StoreAmountOfRemainingBallsOnTable(remainingBalls)
{
    localStorage.setItem(_remainingBallsOnTableKey, "" + remainingBalls);
}

function StorePlayerName(playerLabel, playerName)
{
    const nameStorageKey = playerLabel === _player1Label ? _player1NameKey : _player2NameKey;
    localStorage.setItem(nameStorageKey, playerName);
}

function GetStoredPlayerName(playerLabel)
{
    const nameStorageKey = playerLabel === _player1Label ? _player1NameKey : _player2NameKey;
    return localStorage.getItem(nameStorageKey);
}

function StoreTargetScore(targetScoreString)
{
    localStorage.setItem(_targetScoreKey, targetScoreString);
}

function StoreGameState(gameState)
{
    localStorage.setItem(_gameStateKey, gameState);
}

function IsGameInProgress()
{
    return localStorage.getItem(_gameStateKey) === _gameStateInProgress;
}