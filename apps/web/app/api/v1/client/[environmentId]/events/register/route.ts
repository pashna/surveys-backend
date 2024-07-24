import { responses } from "@/app/lib/api/response";
import { transformErrorToDetails } from "@/app/lib/api/validator";

import { createActionClass, getActionClassByEnvironmentIdAndName } from "@formbricks/lib/actionClass/service";
import { ZActionClassInput } from "@formbricks/types/actionClasses";

interface Context {
  params: {
    environmentId: string;
  };
}

export async function OPTIONS(): Promise<Response> {
  return responses.successResponse({}, true);
}

export async function POST(req: Request, context: Context): Promise<Response> {
  try {
    const jsonInput = await req.json();
    const name = jsonInput?.name;
    const environmentId = context.params.environmentId;

    // validate using zod
    const inputValidation = ZActionClassInput.safeParse({
      name,
      type: "automatic",
      environmentId: context.params.environmentId,
    });

    if (!inputValidation.success) {
      return responses.badRequestResponse(
        "Fields are missing or incorrectly formatted",
        transformErrorToDetails(inputValidation.error),
        true
      );
    }

    const existingAC = await getActionClassByEnvironmentIdAndName(environmentId, name);

    if (existingAC) {
      return responses.successResponse(
        {
          registered: false,
          message: "No updates were necessary; the event is already registered.",
        },
        true
      );
    }

    await createActionClass(environmentId, {
      name,
      type: "automatic",
      environmentId,
    });

    return responses.successResponse(
      {
        registered: true,
        message: "The event was successfully registered.",
      },
      true
    );
  } catch (error) {
    console.error(error);
    return responses.internalServerErrorResponse("Unable to handle the request: " + error.message, true);
  }
}
