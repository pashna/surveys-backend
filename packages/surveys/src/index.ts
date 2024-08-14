import { SurveyInline } from "@/components/general/SurveyInline";
import { SurveyMobileWrapper } from "@/components/general/SurveyMobileWrapper";
import { SurveyModal } from "@/components/general/SurveyModal";
import { addCustomThemeToDom, addStylesToDom } from "@/lib/styles";
import { RTL_LANGUAGES } from "@/lib/utils.ts";
import { h, render } from "preact";

import { SurveyInlineProps, SurveyModalProps } from "@formbricks/types/formbricksSurveys";

declare global {
  interface Window {
    formbricksSurveys: {
      renderSurveyInline: (props: SurveyInlineProps) => void;
      renderSurveyModal: (props: SurveyModalProps) => void;
      renderMobileSurvey: (props: SurveyInlineProps) => void;
    };
  }
}

export const renderSurveyInline = (props: SurveyInlineProps) => {
  addStylesToDom();
  addCustomThemeToDom({ styling: props.styling });

  const element = document.getElementById(props.containerId);
  if (!element) {
    throw new Error(`renderSurvey: Element with id ${props.containerId} not found.`);
  }
  render(h(SurveyInline, props), element);
};

export const renderSurveyModal = (props: SurveyModalProps) => {
  addStylesToDom();
  addCustomThemeToDom({ styling: props.styling });

  // add container element to DOM
  const element = document.createElement("div");
  element.id = "formbricks-modal-container" + props.survey.id;
  document.body.appendChild(element);
  render(h(SurveyModal, props), element);
};

export const renderMobileSurvey = (props: SurveyInlineProps) => {
  addStylesToDom();
  addCustomThemeToDom({ styling: props.styling, setBodyBgColor: true });

  const element = document.getElementById(props.containerId);
  if (!element) {
    throw new Error(`renderSurvey: Element with id ${props.containerId} not found.`);
  }
  render(h(SurveyMobileWrapper, props), element);
};

export { RTL_LANGUAGES };

if (typeof window !== "undefined") {
  window.formbricksSurveys = {
    renderSurveyInline,
    renderSurveyModal,
    renderMobileSurvey,
  };
}
