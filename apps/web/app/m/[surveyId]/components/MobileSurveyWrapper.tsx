"use client";

import MobileSurvey from "@/app/m/[surveyId]/components/MobileSurvey";
import { getAnecdoteBridge } from "@/app/m/[surveyId]/utils";
import { useEffect, useMemo, useState } from "react";

import { RTL_LANGUAGES } from "@formbricks/surveys";
import { TMobileSDKUser, ZMobileSDKUserAction } from "@formbricks/types/mobileSdk";
import { TProduct } from "@formbricks/types/product";
import { TSurvey } from "@formbricks/types/surveys";

interface MobileSurveyProps {
  survey?: TSurvey | null;
  product?: TProduct | null;
  emailVerificationStatus?: string;
  prefillAnswer?: string;
  webAppUrl: string;
  responseCount?: number;
  verifiedEmail?: string;
}

export default function MobileSurveyWrapper({
  survey,
  product,
  emailVerificationStatus,
  prefillAnswer,
  webAppUrl,
  responseCount,
  verifiedEmail,
}: MobileSurveyProps) {
  const [sdkUser, setSdkUser] = useState<TMobileSDKUser | null>(null);

  const languageCode = useMemo(() => {
    let lang = "default";

    const attrLang = sdkUser?.attributes.language;
    if (!attrLang) {
      return lang;
    }

    const firstQuestion = survey?.questions?.at(0);

    if (firstQuestion?.headline && typeof firstQuestion.headline === "object") {
      const availableLanguages = Object.keys(firstQuestion.headline);

      for (let i = 0; i < availableLanguages.length; i++) {
        if (availableLanguages[i] === attrLang) {
          lang = attrLang;
          break;
        }
      }
    }

    return lang;
  }, [sdkUser?.attributes.language, survey?.questions]);

  useEffect(() => {
    const bridge = getAnecdoteBridge();

    if (!bridge) return;

    if (RTL_LANGUAGES.includes(languageCode)) {
      bridge.postMessage(
        JSON.stringify({
          action: "contentTextDirectionDidChange",
          isRTL: true,
        })
      );
    }
  }, [languageCode]);

  useEffect(() => {
    const bridge = getAnecdoteBridge();

    if (!bridge) return;

    const handler = (msg: string) => {
      const obj = JSON.parse(msg);
      const validMobileSDKUser = ZMobileSDKUserAction.safeParse(obj);
      if (!validMobileSDKUser.success) {
        return;
      }

      if (validMobileSDKUser.data.action === "setUser") {
        setSdkUser(validMobileSDKUser.data.user);
      }
    };

    bridge.addMessageHandler(handler);

    return () => {
      if (bridge) {
        bridge.removeMessageHandler(handler);
      }
    };
  }, []);

  useEffect(() => {
    const bridge = getAnecdoteBridge();

    if (!bridge) return;

    if (!survey) {
      bridge.postMessage(
        JSON.stringify({
          action: "pageLoadedError",
          error: {
            code: 404,
            message: "Survey not found",
          },
        })
      );

      return;
    }

    if (survey.type !== "mobile") {
      bridge.postMessage(
        JSON.stringify({
          action: "pageLoadedError",
          error: {
            code: 400,
            message: "Invalid Survey Type",
          },
        })
      );

      return;
    }

    if (survey.status !== "inProgress") {
      bridge.postMessage(
        JSON.stringify({
          action: "pageLoadedError",
          error: {
            code: 400,
            message: "Invalid Survey status",
          },
        })
      );

      return;
    }

    bridge.postMessage(
      JSON.stringify({
        action: "pageLoaded",
      })
    );
  }, [survey]);

  if (!survey || survey.type !== "mobile" || survey.status !== "inProgress" || !product) {
    return <></>;
  }

  return (
    <MobileSurvey
      survey={survey}
      userId={sdkUser?.id}
      emailVerificationStatus={emailVerificationStatus}
      prefillAnswer={prefillAnswer}
      webAppUrl={webAppUrl}
      responseCount={responseCount}
      verifiedEmail={verifiedEmail}
      languageCode={languageCode}
      product={product}
      sdkUser={sdkUser}
    />
  );
}
