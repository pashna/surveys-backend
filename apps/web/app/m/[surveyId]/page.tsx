import MobileSurveyWrapper from "@/app/m/[surveyId]/components/MobileSurveyWrapper";
import { getMetadataForMobileSurvey } from "@/app/m/[surveyId]/metadata";
import type { Metadata } from "next";

import { WEBAPP_URL } from "@formbricks/lib/constants";
import { getProductByEnvironmentId } from "@formbricks/lib/product/service";
import { getResponseCountBySurveyId } from "@formbricks/lib/response/service";
import { getSurvey } from "@formbricks/lib/survey/service";
import { ZId } from "@formbricks/types/environment";

interface LinkSurveyPageProps {
  params: {
    surveyId: string;
  };
}

export async function generateMetadata({ params }: LinkSurveyPageProps): Promise<Metadata | null> {
  const validId = ZId.safeParse(params.surveyId);

  if (!validId.success) {
    return null;
  }

  return getMetadataForMobileSurvey(params.surveyId);
}

export default async function LinkSurveyPage({ params }: LinkSurveyPageProps) {
  const validId = ZId.safeParse(params.surveyId);
  const survey = validId.success ? await getSurvey(params.surveyId) : null;

  // // verify email: Check if the survey requires email verification
  let emailVerificationStatus: string = "";
  let verifiedEmail: string | undefined = undefined;

  // get product and person
  const product = survey ? await getProductByEnvironmentId(survey.environmentId) : null;

  const responseCount = survey && (await getResponseCountBySurveyId(survey.id));

  return (
    <MobileSurveyWrapper
      survey={survey}
      product={product}
      emailVerificationStatus={emailVerificationStatus}
      webAppUrl={WEBAPP_URL}
      responseCount={
        survey?.welcomeCard?.showResponseCount ? (responseCount as number | undefined) : undefined
      }
      verifiedEmail={verifiedEmail}
    />
  );
}
