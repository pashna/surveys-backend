import { TPersonAttributes } from "@formbricks/types/people";
import { TSurvey } from "@formbricks/types/surveys";

export const getIsDebug = () => window.location.search.includes("formbricksDebug=true");

export const getLanguageCode = (survey: TSurvey, attributes: TPersonAttributes): string | undefined => {
  let lang = "default";

  const langParam = attributes.language;
  const browserLanguageCode = typeof window !== "undefined" ? navigator?.language?.slice(0, 2) || "" : "";

  const firstQuestion = survey?.questions?.at(0);

  if (firstQuestion?.headline && typeof firstQuestion.headline === "object") {
    const availableLanguages = Object.keys(firstQuestion.headline);

    for (let i = 0; i < availableLanguages.length; i++) {
      if (availableLanguages[i] === langParam) {
        lang = langParam;
        break;
      }

      if (availableLanguages[i] === browserLanguageCode) {
        lang = browserLanguageCode;
      }
    }
  }
  return lang;
};

export const getDefaultLanguageCode = (survey: TSurvey) => {
  const defaultSurveyLanguage = survey.languages?.find((surveyLanguage) => {
    return surveyLanguage.default === true;
  });
  if (defaultSurveyLanguage) return defaultSurveyLanguage.language.code;
};
