"use client";

import MobileSurvey from "@/app/m/[surveyId]/components/MobileSurvey";
import { getAnecdoteBridge } from "@/app/m/[surveyId]/utils";
import { useEffect, useState } from "react";

import { TMobileSDKUser, ZMobileSDKUserAction } from "@formbricks/types/mobileSdk";
import { TProduct } from "@formbricks/types/product";
import { TSurvey } from "@formbricks/types/surveys";

interface MobileSurveyProps {
  survey?: TSurvey | null;
  product?: TProduct | null;
  userId?: string;
  emailVerificationStatus?: string;
  prefillAnswer?: string;
  webAppUrl: string;
  responseCount?: number;
  verifiedEmail?: string;
  languageCode: string;
}

export default function MobileSurveyWrapper({
  survey,
  product,
  userId,
  emailVerificationStatus,
  prefillAnswer,
  webAppUrl,
  responseCount,
  verifiedEmail,
  languageCode,
}: MobileSurveyProps) {
  const [sdkUser, setSdkUser] = useState<TMobileSDKUser | null>(null);

  useEffect(() => {
    const bridge = getAnecdoteBridge();

    if (!bridge) return;

    // @ts-ignore
    bridge.onMessage = (msg) => {
      const obj = JSON.parse(msg);
      const validMobileSDKUser = ZMobileSDKUserAction.safeParse(obj);
      if (!validMobileSDKUser.success) {
        return;
      }

      if (validMobileSDKUser.data.action === "setUser") {
        setSdkUser(validMobileSDKUser.data.user);
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
      userId={userId}
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
