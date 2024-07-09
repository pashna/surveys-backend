"use client";

import MobileSurvey from "@/app/m/[surveyId]/components/MobileSurvey";
import { getAnecdoteBridge } from "@/app/m/[surveyId]/utils";
import { useEffect } from "react";

import { TProduct } from "@formbricks/types/product";
import { TSurvey } from "@formbricks/types/surveys";

interface MobileSurveyProps {
  survey?: TSurvey | null;
  product?: TProduct;
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
  useEffect(() => {
    const bridge = getAnecdoteBridge();

    if (!bridge) return;
    if (!survey) {
      bridge.postMessage(
        JSON.stringify({
          action: "pageLoadedError",
          errorPayload: {
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
          errorPayload: {
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
          errorPayload: {
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
    />
  );
}
