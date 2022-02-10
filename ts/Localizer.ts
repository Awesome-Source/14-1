class Localizer
{
    private static _germanTranslationByLanguageKey: { [id: string] : string } = {
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
    private static _englishTranslationByLanguageKey: { [id: string] : string } = {
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

    public static GetTranslation(languageKey: string)
    {
        if(/^de\b/.test(navigator.language))
        {
            return this.GetTranslationFromDictionary(languageKey, this._germanTranslationByLanguageKey);
        }

        return this.GetTranslationFromDictionary(languageKey, this._englishTranslationByLanguageKey);
    }

    private static GetTranslationFromDictionary(languageKey: string, dictionary: { [id: string] : string })
    {
        if(languageKey in dictionary)
        {
            return dictionary[languageKey];
        }

        return languageKey;
    }
}