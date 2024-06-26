import { FormbricksAPI } from "@formbricks/api";
import { ResponseQueue } from "@formbricks/lib/responseQueue";
import SurveyState from "@formbricks/lib/surveyState";
import { TJSStateDisplay } from "@formbricks/types/js";
import { TResponseUpdate } from "@formbricks/types/responses";
import { TSurvey } from "@formbricks/types/surveys";

import { Config } from "./config";
import { ErrorHandler } from "./errors";
import { ErrorsLogger } from "./errorsLogger.ts";
import { putFormbricksInErrorState } from "./initialize";
import { Logger } from "./logger";
import { SurveyList } from "./surveyList.ts";
import { filterPublicSurveys, sync } from "./sync";
import { getDefaultLanguageCode, getLanguageCode } from "./utils";

// const getContainerId = (surveyId: string) => {
//   const containerId = "formbricks-web-container";
//
//   return containerId + "-" + surveyId;
// }

const config = Config.getInstance();
const logger = Logger.getInstance();
const errorHandler = ErrorHandler.getInstance();
const surveysRunningList = SurveyList.getInstance();
let setIsError = (_: boolean) => {};
let setIsResponseSendingFinished = (_: boolean) => {};

const getIsSurveyRunning = (surveyId: string) => {
  return surveysRunningList.getIsSurveyRunning(surveyId);
};

const setIsSurveyRunning = (surveyId: string, value: boolean) => {
  surveysRunningList.setIsSurveyRunning(surveyId, value);
};

const shouldDisplayBasedOnPercentage = (displayPercentage: number) => {
  const randomNum = Math.floor(Math.random() * 100) + 1;
  return randomNum <= displayPercentage;
};

export const triggerSurvey = async (survey: TSurvey, action?: string): Promise<void> => {
  // Check if the survey should be displayed based on displayPercentage
  if (survey.displayPercentage) {
    const shouldDisplaySurvey = shouldDisplayBasedOnPercentage(survey.displayPercentage);
    if (!shouldDisplaySurvey) {
      logger.debug("Survey display skipped based on displayPercentage.");
      return; // skip displaying the survey
    }
  }

  await renderWidget(survey, action);
};

const renderWidget = async (survey: TSurvey, action?: string) => {
  if (getIsSurveyRunning(survey.id)) {
    logger.debug("A survey is already running. Skipping.");
    return;
  }
  setIsSurveyRunning(survey.id, true);

  if (survey.delay) {
    logger.debug(`Delaying survey by ${survey.delay} seconds.`);
  }

  const product = config.get().state.product;
  const attributes = config.get().state.attributes;

  const isMultiLanguageSurvey = true;
  let languageCode = "default";

  if (isMultiLanguageSurvey) {
    const displayLanguage = getLanguageCode(survey, attributes);
    //if survey is not available in selected language, survey wont be shown
    if (!displayLanguage) {
      logger.debug("Survey not available in specified language.");
      setIsSurveyRunning(survey.id, true);
      return;
    }
    languageCode = displayLanguage;
  }

  const surveyState = new SurveyState(survey.id, null, null, config.get().userId);

  const responseQueue = new ResponseQueue(
    {
      apiHost: config.get().apiHost,
      environmentId: config.get().environmentId,
      retryAttempts: 2,
      onResponseSendingFailed: () => {
        setIsError(true);
      },
      onResponseSendingFinished: () => {
        setIsResponseSendingFinished(true);
      },
    },
    surveyState
  );
  const productOverwrites = survey.productOverwrites ?? {};
  const clickOutside = productOverwrites.clickOutsideClose ?? product.clickOutsideClose;
  const darkOverlay = productOverwrites.darkOverlay ?? product.darkOverlay;
  const placement = productOverwrites.placement ?? product.placement;
  const isBrandingEnabled = product.inAppSurveyBranding;
  const formbricksSurveys = await loadFormbricksSurveysExternally();

  const getStyling = () => {
    // allow style overwrite is disabled from the product
    if (!product.styling.allowStyleOverwrite) {
      return product.styling;
    }

    // allow style overwrite is enabled from the product
    if (product.styling.allowStyleOverwrite) {
      // survey style overwrite is disabled
      if (!survey.styling?.overwriteThemeStyling) {
        return product.styling;
      }

      // survey style overwrite is enabled
      return survey.styling;
    }

    return product.styling;
  };

  setTimeout(() => {
    formbricksSurveys.renderSurveyModal({
      survey: survey,
      isBrandingEnabled: isBrandingEnabled,
      clickOutside,
      darkOverlay,
      languageCode,
      placement,
      styling: getStyling(),
      getSetIsError: (f: (value: boolean) => void) => {
        setIsError = f;
      },
      getSetIsResponseSendingFinished: (f: (value: boolean) => void) => {
        setIsResponseSendingFinished = f;
      },
      onDisplay: async () => {
        const { userId } = config.get();
        // if config does not have a person, we store the displays in local storage
        if (!userId) {
          const localDisplay: TJSStateDisplay = {
            createdAt: new Date(),
            surveyId: survey.id,
            responded: false,
          };

          const existingDisplays = config.get().state.displays;
          const displays = existingDisplays ? [...existingDisplays, localDisplay] : [localDisplay];
          const previousConfig = config.get();
          let state = filterPublicSurveys({
            ...previousConfig.state,
            displays,
          });
          config.update({
            ...previousConfig,
            state,
          });
        }

        const api = new FormbricksAPI({
          apiHost: config.get().apiHost,
          environmentId: config.get().environmentId,
        });
        const res = await api.client.display.create({
          surveyId: survey.id,
          userId,
        });
        if (!res.ok) {
          throw new Error("Could not create display");
        }
        const { id } = res.data;

        surveyState.updateDisplayId(id);
        responseQueue.updateSurveyState(surveyState);
      },
      onResponse: (responseUpdate: TResponseUpdate) => {
        const { userId } = config.get();
        // if user is unidentified, update the display in local storage if not already updated
        if (!userId) {
          const displays = config.get().state.displays;
          const lastDisplay = displays && displays[displays.length - 1];
          if (!lastDisplay) {
            throw new Error("No lastDisplay found");
          }
          if (!lastDisplay.responded) {
            lastDisplay.responded = true;
            const previousConfig = config.get();
            let state = filterPublicSurveys({
              ...previousConfig.state,
              displays,
            });
            config.update({
              ...previousConfig,
              state,
            });
          }
        }

        if (userId) {
          surveyState.updateUserId(userId);
        }
        responseQueue.updateSurveyState(surveyState);
        responseQueue.add({
          data: responseUpdate.data,
          ttc: responseUpdate.ttc,
          finished: responseUpdate.finished,
          language: languageCode === "default" ? getDefaultLanguageCode(survey) : languageCode,
          meta: {
            url: window.location.href,
            action,
            anecdoteai: {
              type: "web",
              userAgent: navigator.userAgent,
              consoleErrors: ErrorsLogger.getInstance().getErrors(),
              viewport: `${window.innerWidth} x ${window.innerHeight}`,
              locale: navigator.language,
              currentUrl: window.location.href,
              onlineStatus: navigator.onLine ? "Online" : "Offline",
            },
          },
        });
      },
      onClose: closeSurvey,
      onFileUpload: async (file: File, params) => {
        const api = new FormbricksAPI({
          apiHost: config.get().apiHost,
          environmentId: config.get().environmentId,
        });

        return await api.client.storage.uploadFile(file, params);
      },
      onRetry: () => {
        setIsError(false);
        responseQueue.processQueue();
      },
    });
  }, survey.delay * 1000);
};

export const closeSurvey = async (): Promise<void> => {
  // remove container element from DOM
  // removeWidgetContainer();
  // addWidgetContainer();

  // if unidentified user, refilter the surveys
  if (!config.get().userId) {
    const state = config.get().state;
    const updatedState = filterPublicSurveys(state);
    config.update({
      ...config.get(),
      state: updatedState,
    });
    return;
  }

  // for identified users we sync to get the latest surveys
  try {
    await sync(
      {
        apiHost: config.get().apiHost,
        environmentId: config.get().environmentId,
        userId: config.get().userId,
      },
      true
    );
  } catch (e: any) {
    errorHandler.handle(e);
    putFormbricksInErrorState();
  }
};

// export const addWidgetContainer = (surveyId: string): void => {
//   const containerElement = document.createElement("div");
//   containerElement.id = getContainerId(surveyId)
//   document.body.appendChild(containerElement);
// };

// export const removeWidgetContainer = (surveyId: string): void => {
//   document.getElementById(getContainerId(surveyId))?.remove();
// };

const loadFormbricksSurveysExternally = (): Promise<typeof window.formbricksSurveys> => {
  return new Promise((resolve, reject) => {
    if (window.formbricksSurveys) {
      resolve(window.formbricksSurveys);
    } else {
      const script = document.createElement("script");
      script.src = `${config.get().apiHost}/api/packages/surveys`;
      script.async = true;
      script.onload = () => resolve(window.formbricksSurveys);
      script.onerror = (error) => {
        console.error("Failed to load Formbricks Surveys library:", error);
        reject(error);
      };
      document.head.appendChild(script);
    }
  });
};
