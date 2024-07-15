import MobileSurveyWrapper from "@/app/m/[surveyId]/components/MobileSurveyWrapper";
import { getMetadataForMobileSurvey } from "@/app/m/[surveyId]/metadata";
import type { Metadata } from "next";

import { WEBAPP_URL } from "@formbricks/lib/constants";
import { getProductByEnvironmentId } from "@formbricks/lib/product/service";
import { getResponseCountBySurveyId } from "@formbricks/lib/response/service";
import { getSurvey } from "@formbricks/lib/survey/service";
import { ZId } from "@formbricks/types/environment";

import { getEmailVerificationDetails } from "./lib/helpers";

interface LinkSurveyPageProps {
  params: {
    surveyId: string;
  };
  searchParams: {
    suId?: string;
    userId?: string;
    verify?: string;
    lang?: string;
  };
}

export async function generateMetadata({ params }: LinkSurveyPageProps): Promise<Metadata | null> {
  const validId = ZId.safeParse(params.surveyId);

  if (!validId.success) {
    return null;
  }

  return getMetadataForMobileSurvey(params.surveyId);
}

export default async function LinkSurveyPage({ params, searchParams }: LinkSurveyPageProps) {
  const validId = ZId.safeParse(params.surveyId);
  const survey = validId.success ? await getSurvey(params.surveyId) : null;

  const { userId, lang: langParam } = searchParams;

  // // verify email: Check if the survey requires email verification
  let emailVerificationStatus: string = "";
  let verifiedEmail: string | undefined = undefined;

  if (survey?.verifyEmail) {
    const token =
      searchParams && Object.keys(searchParams).length !== 0 && searchParams.hasOwnProperty("verify")
        ? searchParams.verify
        : undefined;

    if (token) {
      const emailVerificationDetails = await getEmailVerificationDetails(survey.id, token);
      emailVerificationStatus = emailVerificationDetails.status;
      verifiedEmail = emailVerificationDetails.email;
    }
  }

  // get product and person
  const product = survey ? await getProductByEnvironmentId(survey.environmentId) : null;

  const getLanguageCode = (): string => {
    let lang = "default";
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

  const languageCode = getLanguageCode();

  const responseCount = survey && (await getResponseCountBySurveyId(survey.id));

  return (
    <MobileSurveyWrapper
      survey={survey}
      product={product}
      userId={userId}
      emailVerificationStatus={emailVerificationStatus}
      webAppUrl={WEBAPP_URL}
      responseCount={
        survey?.welcomeCard?.showResponseCount ? (responseCount as number | undefined) : undefined
      }
      verifiedEmail={verifiedEmail}
      languageCode={languageCode}
    />
  );
}
