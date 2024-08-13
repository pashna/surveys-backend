import { authenticateRequest } from "@/app/api/v1/auth";
import { responses } from "@/app/lib/api/response";

import { getAttributeClassesWithValues } from "@formbricks/lib/attributeClass/service";
import { TAttributeClass } from "@formbricks/types/attributeClasses";
import { DatabaseError } from "@formbricks/types/errors";

export async function GET(request: Request) {
  try {
    const authentication = await authenticateRequest(request);
    if (!authentication) return responses.notAuthenticatedResponse();
    const attributeClasses: TAttributeClass[] = await getAttributeClassesWithValues(
      authentication.environmentId!
    );
    return responses.successResponse(attributeClasses);
  } catch (error) {
    if (error instanceof DatabaseError) {
      console.log("error", error);
      return responses.badRequestResponse(error.message);
    }
    throw error;
  }
}
