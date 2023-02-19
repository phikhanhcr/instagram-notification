export enum Country {
    VIETNAM = 'VN',
    THAILAND = 'TH',
}

export enum Language {
    VI = 'vi',
    TH = 'th',
    EN = 'en',
}

export const DefaultLanguageByCountry = {
    [Country.VIETNAM]: Language.VI,
    [Country.THAILAND]: Language.TH,
};

export function getMatchedLanguageFromUserLanguage(lang: string): Language {
    if (lang === Language.VI) {
        return Language.VI;
    }
    if (lang === Language.TH) {
        return Language.TH;
    }
    return Language.EN;
}
