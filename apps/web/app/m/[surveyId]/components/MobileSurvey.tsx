"use client";

import SurveyLinkUsed from "@/app/m/[surveyId]/components/SurveyLinkUsed";
import VerifyEmail from "@/app/m/[surveyId]/components/VerifyEmail";
import { getPrefillResponseData } from "@/app/m/[surveyId]/lib/prefilling";
import { getAnecdoteBridge } from "@/app/m/[surveyId]/utils";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { FormbricksAPI } from "@formbricks/api";
import { ResponseQueue } from "@formbricks/lib/responseQueue";
import { SurveyState } from "@formbricks/lib/surveyState";
import { TMobileSDKUser } from "@formbricks/types/mobileSdk";
import { TProduct } from "@formbricks/types/product";
import { TResponse, TResponseData, TResponseUpdate } from "@formbricks/types/responses";
import { TUploadFileConfig } from "@formbricks/types/storage";
import { TSurvey } from "@formbricks/types/surveys";
import { SurveyMobileInline } from "@formbricks/ui/Survey";

let setIsError = (_: boolean) => {};
let setIsResponseSendingFinished = (_: boolean) => {};

const MIN_HEIGHT = 200;

interface MobileSurveyProps {
  survey: TSurvey;
  product: TProduct;
  userId?: string;
  emailVerificationStatus?: string;
  prefillAnswer?: string;
  singleUseId?: string;
  singleUseResponse?: TResponse;
  webAppUrl: string;
  responseCount?: number;
  verifiedEmail?: string;
  languageCode: string;
  sdkUser?: TMobileSDKUser | null;
}

export default function MobileSurvey({
  survey,
  product,
  userId,
  emailVerificationStatus,
  prefillAnswer,
  singleUseId,
  singleUseResponse,
  webAppUrl,
  responseCount,
  verifiedEmail,
  languageCode,
  sdkUser,
}: MobileSurveyProps) {
  const responseId = singleUseResponse?.id;
  const searchParams = useSearchParams();
  const isPreview = searchParams?.get("preview") === "true";
  const sourceParam = searchParams?.get("source");
  const suId = searchParams?.get("suId");
  const defaultLanguageCode = survey.languages?.find((surveyLanguage) => {
    return surveyLanguage.default === true;
  })?.language.code;
  const parentRef = useRef<HTMLDivElement>(null);

  const startAt = searchParams?.get("startAt");
  const isStartAtValid = useMemo(() => {
    if (!startAt) return false;
    if (survey?.welcomeCard.enabled && startAt === "start") return true;

    const isValid = survey?.questions.some((question) => question.id === startAt);

    // To remove startAt query param from URL if it is not valid:
    if (!isValid && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("startAt");
      window.history.replaceState({}, "", url.toString());
    }

    return isValid;
  }, [survey, startAt]);

  // pass in the responseId if the survey is a single use survey, ensures survey state is updated with the responseId
  const [surveyState, setSurveyState] = useState(new SurveyState(survey.id, singleUseId, responseId, userId));
  const [activeQuestionId, setActiveQuestionId] = useState<string>(
    startAt && isStartAtValid ? startAt : survey.welcomeCard.enabled ? "start" : survey?.questions[0]?.id
  );

  const prefillResponseData: TResponseData | undefined = prefillAnswer
    ? getPrefillResponseData(survey.questions[0], survey, prefillAnswer, languageCode)
    : undefined;

  const responseQueue = useMemo(
    () =>
      new ResponseQueue(
        {
          apiHost: webAppUrl,
          environmentId: survey.environmentId,
          retryAttempts: 2,
          onResponseSendingFailed: () => {
            setIsError(true);
          },
          onResponseSendingFinished: () => {
            // when response of current question is processed successfully
            setIsResponseSendingFinished(true);
          },
          setSurveyState: setSurveyState,
        },
        surveyState
      ),
    [webAppUrl, survey.environmentId, surveyState]
  );
  const [autoFocus, setAutofocus] = useState(false);
  const hasFinishedSingleUseResponse = useMemo(() => {
    if (singleUseResponse && singleUseResponse.finished) {
      return true;
    }
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Not in an iframe, enable autofocus on input fields.
  useEffect(() => {
    if (window.self === window.top) {
      setAutofocus(true);
    }
  }, []);

  useEffect(() => {
    const bridge = getAnecdoteBridge();

    if (!parentRef.current || !bridge) return;

    const initHeight = parentRef.current.getBoundingClientRect().height;

    if (initHeight > MIN_HEIGHT) {
      bridge.postMessage(
        JSON.stringify({
          action: "contentHeightDidChange",
          height: initHeight,
        })
      );
    }

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.contentRect.height;

        if (height > MIN_HEIGHT) {
          bridge.postMessage(
            JSON.stringify({
              action: "contentHeightDidChange",
              height,
            })
          );
        }
      }
    });
    observer.observe(parentRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const hiddenFieldsRecord = useMemo<Record<string, string | number | string[]> | null>(() => {
    const fieldsRecord: Record<string, string | number | string[]> = {};
    let fieldsSet = false;

    survey.hiddenFields?.fieldIds?.forEach((field) => {
      const answer = searchParams?.get(field);
      if (answer) {
        fieldsRecord[field] = answer;
        fieldsSet = true;
      }
    });

    // Only return the record if at least one field was set.
    return fieldsSet ? fieldsRecord : null;
  }, [searchParams, survey.hiddenFields?.fieldIds]);

  const getVerifiedEmail = useMemo<Record<string, string> | null>(() => {
    if (survey.verifyEmail && verifiedEmail) {
      return { verifiedEmail: verifiedEmail };
    } else {
      return null;
    }
  }, [survey.verifyEmail, verifiedEmail]);

  useEffect(() => {
    responseQueue.updateSurveyState(surveyState);
  }, [responseQueue, surveyState]);

  if (!surveyState.isResponseFinished() && hasFinishedSingleUseResponse) {
    return <SurveyLinkUsed singleUseMessage={survey.singleUse} />;
  }
  if (survey.verifyEmail && emailVerificationStatus !== "verified") {
    if (emailVerificationStatus === "fishy") {
      return <VerifyEmail survey={survey} isErrorComponent={true} languageCode={languageCode} />;
    }
    //emailVerificationStatus === "not-verified"
    return <VerifyEmail singleUseId={suId ?? ""} survey={survey} languageCode={languageCode} />;
  }

  const determineStyling = () => {
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

  const onFinished = () => {
    const bridge = getAnecdoteBridge();

    if (!bridge) return;

    bridge.postMessage(
      JSON.stringify({
        action: "surveyFillingOutSuccess",
      })
    );
  };

  return (
    <div ref={parentRef}>
      <SurveyMobileInline
        survey={survey}
        styling={determineStyling()}
        onFinished={onFinished}
        languageCode={languageCode}
        isBrandingEnabled={false}
        getSetIsError={(f: (value: boolean) => void) => {
          setIsError = f;
        }}
        getSetIsResponseSendingFinished={
          !isPreview
            ? (f: (value: boolean) => void) => {
                setIsResponseSendingFinished = f;
              }
            : undefined
        }
        onRetry={() => {
          setIsError(false);
          responseQueue.processQueue();
        }}
        onDisplay={async () => {
          if (!isPreview) {
            const api = new FormbricksAPI({
              apiHost: webAppUrl,
              environmentId: survey.environmentId,
            });
            const res = await api.client.display.create({
              surveyId: survey.id,
            });
            if (!res.ok) {
              throw new Error("Could not create display");
            }
            const { id } = res.data;

            const newSurveyState = surveyState.copy();
            newSurveyState.updateDisplayId(id);
            setSurveyState(newSurveyState);
          }
        }}
        onResponse={(responseUpdate: TResponseUpdate) => {
          !isPreview &&
            responseQueue.add({
              data: {
                ...responseUpdate.data,
                ...hiddenFieldsRecord,
                ...getVerifiedEmail,
              },
              ttc: responseUpdate.ttc,
              finished: responseUpdate.finished,
              language:
                languageCode === "default" && defaultLanguageCode ? defaultLanguageCode : languageCode,
              meta: {
                url: window.location.href,
                source: sourceParam || "",
                anecdoteai: {
                  ...sdkUser?.attributes,
                },
              },
            });
        }}
        onFileUpload={async (file: File, params: TUploadFileConfig) => {
          const api = new FormbricksAPI({
            apiHost: webAppUrl,
            environmentId: survey.environmentId,
          });

          const uploadedUrl = await api.client.storage.uploadFile(file, params);
          return uploadedUrl;
        }}
        onActiveQuestionChange={(questionId) => setActiveQuestionId(questionId)}
        activeQuestionId={activeQuestionId}
        autoFocus={autoFocus}
        prefillResponseData={prefillResponseData}
        responseCount={responseCount}
      />
      <div style={{ height: 20, width: "100%" }}></div>
    </div>
  );
}
