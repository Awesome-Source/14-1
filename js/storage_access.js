const _player1NameKey = "player1_name";
const _player2NameKey = "player2_name";
const _player1ScoreKey = "player1_score";
const _player2ScoreKey = "player2_score";
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