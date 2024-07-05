import { responses } from "@/app/lib/api/response";
import { transformErrorToDetails } from "@/app/lib/api/validator";

import { getActionClasses } from "@formbricks/lib/actionClass/service";
import { getEnvironment, updateEnvironment } from "@formbricks/lib/environment/service";
import { getProductByEnvironmentId } from "@formbricks/lib/product/service";
import { COLOR_DEFAULTS } from "@formbricks/lib/styling/constants";
import { getMobileSurveys } from "@formbricks/lib/survey/service";
import { getTeamByEnvironmentId } from "@formbricks/lib/team/service";
import { TJsStateSync, ZJsPublicSyncInput } from "@formbricks/types/js";
import { TProduct } from "@formbricks/types/product";

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

    const [surveys, noCodeActionClasses, product] = await Promise.all([
      getMobileSurveys(environmentId),
      getActionClasses(environmentId),
      getProductByEnvironmentId(environmentId),
    ]);
    if (!product) {
      throw new Error("Product not found");
    }

    // Common filter condition for selecting surveys that are in progress, are of type 'web' and have no active segment filtering.
    let filteredSurveys = surveys.filter(
      (survey) =>
        survey.status === "inProgress" &&
        survey.type === "mobile" &&
        (!survey.segment || survey.segment.filters.length === 0)
    );

    const updatedProduct: TProduct = {
      ...product,
      brandColor: product.styling.brandColor?.light ?? COLOR_DEFAULTS.brandColor,
      ...(product.styling.highlightBorderColor?.light && {
        highlightBorderColor: product.styling.highlightBorderColor.light,
      }),
    };

    // Create the 'state' object with surveys, noCodeActionClasses, product, and person.
    const state: TJsStateSync = {
      surveys: filteredSurveys,
      noCodeActionClasses: noCodeActionClasses.filter((actionClass) => actionClass.type === "noCode"),
      product: updatedProduct,
      person: null,
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
