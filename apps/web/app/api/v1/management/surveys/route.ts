import { authenticateRequest } from "@/app/api/v1/auth";
import { responses } from "@/app/lib/api/response";
import { transformErrorToDetails } from "@/app/lib/api/validator";

import { translateSurvey } from "@formbricks/lib/i18n/utils";
import { createSegment } from "@formbricks/lib/segment/service";
import { surveyCache } from "@formbricks/lib/survey/cache";
import { createSurvey, getSurvey, getSurveys } from "@formbricks/lib/survey/service";
import { DatabaseError } from "@formbricks/types/errors";
import { ZSurveyInput } from "@formbricks/types/surveys";

export async function GET(request: Request) {
  try {
    const authentication = await authenticateRequest(request);
    if (!authentication) return responses.notAuthenticatedResponse();

    const searchParams = new URL(request.url).searchParams;
    const limit = searchParams.has("limit") ? Number(searchParams.get("limit")) : undefined;
    const offset = searchParams.has("offset") ? Number(searchParams.get("offset")) : undefined;

    const surveys = await getSurveys(authentication.environmentId!, limit, offset);
    return responses.successResponse(surveys);
  } catch (error) {
    if (error instanceof DatabaseError) {
      return responses.badRequestResponse(error.message);
    }
    throw error;
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const authentication = await authenticateRequest(request);
    if (!authentication) return responses.notAuthenticatedResponse();
    let surveyInput = await request.json();
    if (surveyInput?.questions && surveyInput.questions[0].headline) {
      const questionHeadline = surveyInput.questions[0].headline;
      if (typeof questionHeadline === "string") {
        // its a legacy survey
        surveyInput = translateSurvey(surveyInput, []);
      }
    }
    const inputValidation = ZSurveyInput.safeParse(surveyInput);

    if (!inputValidation.success) {
      return responses.badRequestResponse(
        "Fields are missing or incorrectly formatted",
        transformErrorToDetails(inputValidation.error),
        true
      );
    }

    const environmentId = authentication.environmentId;
    const surveyData = { ...inputValidation.data, environmentId: undefined, segment: undefined };

    const survey = await createSurvey(environmentId, surveyData);

    const segment = {
      environmentId,
      surveyId: survey.id,
      title: inputValidation.data.segment?.title || survey.id,
      description: inputValidation.data.segment?.description || "",
      isPrivate: inputValidation.data.segment?.isPrivate || true,
      filters: inputValidation.data.segment?.filters || [],
    };
    await createSegment(segment);

    surveyCache.revalidate({ id: survey.id });

    const responseSurvey = await getSurvey(survey.id);
    if (responseSurvey) {
      return responses.successResponse(responseSurvey);
    } else {
      return responses.badRequestResponse("can't find survey");
    }
  } catch (error) {
    if (error instanceof DatabaseError) {
      return responses.badRequestResponse(error.message);
    }
    throw error;
  }
}
