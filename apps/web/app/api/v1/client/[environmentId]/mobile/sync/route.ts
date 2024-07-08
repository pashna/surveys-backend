import { responses } from "@/app/lib/api/response";
import { transformErrorToDetails } from "@/app/lib/api/validator";

import { getEnvironment, updateEnvironment } from "@formbricks/lib/environment/service";
import { getMobileSurveys } from "@formbricks/lib/survey/service";
import { getTeamByEnvironmentId } from "@formbricks/lib/team/service";
import { TJsStateSync, ZJsPublicSyncInput } from "@formbricks/types/js";

export async function OPTIONS(): Promise<Response> {
  return responses.successResponse({}, true);
}

export async function GET(_, { params }: { params: { environmentId: string } }): Promise<Response> {
  try {
    const syncInputValidation = ZJsPublicSyncInput.safeParse({
      environmentId: params.environmentId,
    });

    if (!syncInputValidation.success) {
      return responses.badRequestResponse(
        "Fields are missing or incorrectly formatted",
        transformErrorToDetails(syncInputValidation.error),
        true
      );
    }

    const { environmentId } = syncInputValidation.data;

    const environment = await getEnvironment(environmentId);
    const team = await getTeamByEnvironmentId(environmentId);
    if (!team) {
      throw new Error("Team does not exist");
    }

    if (!environment) {
      throw new Error("Environment does not exist");
    }

    if (!environment?.widgetSetupCompleted) {
      // const firstSurvey = getExampleSurveyTemplate(WEBAPP_URL);
      // await createSurvey(environmentId, firstSurvey);
      await updateEnvironment(environment.id, { widgetSetupCompleted: true });
    }

    const [surveys] = await Promise.all([getMobileSurveys(environmentId)]);

    // Common filter condition for selecting surveys that are in progress, are of type 'web' and have no active segment filtering.
    let filteredSurveys: TJsStateSync["surveys"] = surveys.filter(
      (survey) => survey.status === "inProgress" && survey.type === "mobile"
    );

    // Create the 'state' object with surveys
    const state = {
      surveys: filteredSurveys,
    };

    return responses.successResponse(
      { ...state },
      true,
      "public, s-maxage=600, max-age=840, stale-while-revalidate=600, stale-if-error=600"
    );
  } catch (error) {
    console.error(error);
    return responses.internalServerErrorResponse(`Unable to complete response: ${error.message}`, true);
  }
}
