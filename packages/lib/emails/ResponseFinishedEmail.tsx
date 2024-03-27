import { Column, Container, Hr, Img, Link, Row, Section, Text } from "@react-email/components";
import React from "react";

import { TResponse } from "@formbricks/types/responses";
import { TSurvey, TSurveyQuestionType } from "@formbricks/types/surveys";
import { TTeam } from "@formbricks/types/teams";

import { getQuestionResponseMapping } from "../responses";
import { getOriginalFileNameFromUrl } from "../storage/utils";
import { EmailButton } from "./EmailButton";

interface ResponseFinishedEmailProps {
  survey: TSurvey;
  responseCount: number;
  response: TResponse;
  WEBAPP_URL: string;
  environmentId: string;
  team: TTeam | null;
}

export const ResponseFinishedEmail = ({
  survey,
  responseCount,
  response,
  WEBAPP_URL,
  environmentId,
  team,
}: ResponseFinishedEmailProps) => {
  const questions = getQuestionResponseMapping(survey, response);

  return (
    <Container>
      <Row>
        <Column>
          <Text className="mb-4 text-3xl font-bold">Hey 👋</Text>
          <Text className="mb-4">
            Congrats, you received a new response to your survey! Someone just completed your survey{" "}
            <strong>{survey.name}</strong>:
          </Text>
          <Hr />
          {questions.map((question) => (
            <Row key={question.question}>
              <Column className="w-full">
                <Text className="mb-2 font-medium">{question.question}</Text>
                {question.type === TSurveyQuestionType.FileUpload ? (
                  <div>
                    {typeof question.answer !== "string" &&
                      question.answer.map((answer) => (
                        <div
                          key={answer}
                          className="flex items-center justify-center rounded-lg bg-gray-200 p-2 shadow-sm">
                          <Img
                            src="/icons/file-icon.svg" // Replace with actual SVG path
                            alt="File attachment"
                            width={24}
                            height={24}
                            className="mr-2"
                          />
                          <Text className="truncate">{getOriginalFileNameFromUrl(answer)}</Text>
                        </div>
                      ))}
                  </div>
                ) : (
                  <Text className="mt-0 whitespace-pre-wrap break-words font-bold">{question.answer}</Text>
                )}
              </Column>
            </Row>
          ))}
          <EmailButton
            href={`${WEBAPP_URL}/environments/${environmentId}/surveys/${survey.id}/responses?utm_source=email_notification&utm_medium=email&utm_content=view_responses_CTA`}
            label={
              responseCount > 1
                ? `View ${responseCount - 1} more ${responseCount === 2 ? "response" : "responses"}`
                : `View survey summary`
            }
          />
          <Hr />
          <Section className="mt-4 text-center text-sm">
            <Text className="font-bold">Don&apos;t want to get these notifications?</Text>
            <Text className="mb-0">
              Turn off notifications for{" "}
              <Link
                className="text-black underline"
                href={`${WEBAPP_URL}/environments/${environmentId}/settings/notifications?type=alert&elementId=${survey.id}`}>
                this form
              </Link>
            </Text>
            <Text className="mt-0">
              Turn off notifications for{" "}
              <Link
                className="text-black underline"
                href={`${WEBAPP_URL}/environments/${environmentId}/settings/notifications?type=unsubscribedTeamIds&elementId=${team?.id}`}>
                all newly created forms{" "}
              </Link>
            </Text>
          </Section>
        </Column>
      </Row>
    </Container>
  );
};
