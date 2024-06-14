import { SurveyDefaultModal } from "@/components/general/SurveyDefaultModal.tsx";
import { SurveyWidgetModal } from "@/components/general/SurveyWidgetModal.tsx";

import { SurveyModalProps } from "@formbricks/types/formbricksSurveys";

export function SurveyModal(props: SurveyModalProps) {
  if (props.placement === "widget") {
    return <SurveyWidgetModal {...props} />;
  }

  return <SurveyDefaultModal {...props} />;
}
