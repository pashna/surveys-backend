import { SurveyMobile } from "@/components/general/SurveyMobile.tsx";

import { SurveyInlineProps } from "@formbricks/types/formbricksSurveys";

export function SurveyMobileWrapper(props: SurveyInlineProps) {
  return (
    <div id="fbjs" className="formbricks-form h-full w-full">
      <SurveyMobile {...props} />
    </div>
  );
}
