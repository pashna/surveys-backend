import "server-only";

import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { prisma } from "@formbricks/database";
import { ZOptionalNumber } from "@formbricks/types/common";
import { ZId } from "@formbricks/types/environment";
import { DatabaseError } from "@formbricks/types/errors";
import { TSegment } from "@formbricks/types/segment";
import { TSurvey, TSurveyFilterCriteria } from "@formbricks/types/surveys";

import { SERVICES_REVALIDATION_INTERVAL } from "../../constants";
import { validateInputs } from "../../utils/validate";
import { surveyCache } from "../cache";
import { buildOrderByClause, buildWhereClause, formatSurveyDateFields } from "../util";
import { selectSurvey } from "./select";

export const getMobileSurveys = async (
  environmentId: string,
  limit?: number,
  offset?: number,
  filterCriteria?: TSurveyFilterCriteria
): Promise<TSurvey[]> => {
  const surveys = await unstable_cache(
    async () => {
      validateInputs([environmentId, ZId], [limit, ZOptionalNumber], [offset, ZOptionalNumber]);
      let surveysPrisma;

      try {
        surveysPrisma = await prisma.survey.findMany({
          where: {
            environmentId,
            type: "mobile",
            ...buildWhereClause(filterCriteria),
          },
          select: selectSurvey,
          orderBy: buildOrderByClause(filterCriteria?.sortBy),
          take: limit ? limit : undefined,
          skip: offset ? offset : undefined,
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          console.error(error);
          throw new DatabaseError(error.message);
        }

        throw error;
      }

      const surveys: TSurvey[] = [];

      for (const surveyPrisma of surveysPrisma) {
        let segment: TSegment | null = null;

        if (surveyPrisma.segment) {
          segment = {
            ...surveyPrisma.segment,
            surveys: surveyPrisma.segment.surveys.map((survey) => survey.id),
          };
        }

        const transformedSurvey: TSurvey = {
          ...surveyPrisma,
          triggers: surveyPrisma.triggers.map((trigger) => trigger.actionClass.name),
          segment,
        };

        surveys.push(transformedSurvey);
      }
      return surveys;
    },
    [`getSurveys-${environmentId}-${limit}-${offset}-${JSON.stringify(filterCriteria)}`],
    {
      tags: [surveyCache.tag.byEnvironmentId(environmentId)],
      revalidate: SERVICES_REVALIDATION_INTERVAL,
    }
  )();

  // since the unstable_cache function does not support deserialization of dates, we need to manually deserialize them
  // https://github.com/vercel/next.js/issues/51613
  return surveys.map((survey) => formatSurveyDateFields(survey));
};
