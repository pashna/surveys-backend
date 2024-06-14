import SuggestionModal from "@/components/wrappers/SuggestionModal.tsx";
import WidgetModal from "@/components/wrappers/WidgetModal.tsx";
import { useState } from "preact/hooks";

import { SurveyModalProps } from "@formbricks/types/formbricksSurveys";

import { Survey } from "./Survey";

export function SurveyWidgetModal({
  survey,
  activeQuestionId,
  getSetIsError,
  clickOutside,
  darkOverlay,
  onDisplay,
  getSetIsResponseSendingFinished,
  onActiveQuestionChange,
  onResponse,
  onClose,
  onFinished = () => {},
  onFileUpload,
  onRetry,
  isRedirectDisabled = false,
  languageCode,
  responseCount,
  styling,
}: SurveyModalProps) {
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const closeSurvey = () => {
    setIsSuggestionOpen(true);
    setIsOpen(false);
  };

  const closeSuggestionAndSurvey = () => {
    setIsSuggestionOpen(false);
    setIsOpen(false);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 10); // wait for animation to finish
  };

  const highlightBorderColor = styling?.highlightBorderColor?.light || null;

  return (
    <div id="fbjs" className="formbricks-form">
      <SuggestionModal
        isOpen={isSuggestionOpen}
        onClose={() => {
          setIsSuggestionOpen(false);
        }}
        onClick={() => {
          setIsSuggestionOpen(false);
          setIsOpen(true);
        }}
        hideCloseBtn>
        <div className="group flex items-center justify-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="hidden rotate-90 transform sm:block">
            <g clip-path="url(#clip0_189_4041)">
              <path
                d="M0.333497 5.996C0.333146 5.4708 0.436398 4.95069 0.637341 4.46546C0.838285 3.98022 1.13297 3.53939 1.50453 3.1682C1.87609 2.79702 2.31721 2.50277 2.80265 2.30231C3.28809 2.10185 4.3335 2 4.3335 2H11.6668C13.8755 2 15.6668 3.79667 15.6668 5.996V14H4.3335C2.12483 14 0.333497 12.2033 0.333497 10.004V5.996ZM14.3335 12.6667V5.996C14.3317 5.28967 14.0501 4.61283 13.5503 4.11375C13.0504 3.61467 12.3732 3.33404 11.6668 3.33333C10.9605 3.33263 4.3335 3.33333 4.3335 3.33333C4.3335 3.33333 3.63656 3.4007 3.31289 3.53415C2.98922 3.6676 2.69508 3.86364 2.44734 4.11101C2.19959 4.35838 2.00312 4.65223 1.86918 4.9757C1.73524 5.29917 1.66648 5.6459 1.66683 5.996V10.004C1.66859 10.7103 1.95024 11.3872 2.45007 11.8863C2.9499 12.3853 3.62716 12.666 4.3335 12.6667H14.3335ZM10.3335 7.33333H11.6668V8.66667H10.3335V7.33333ZM4.3335 7.33333H5.66683V8.66667H4.3335V7.33333Z"
                fill="black"
              />
              <path d="M7.3335 7.33333H8.66683V8.66667H7.3335V7.33333Z" fill="black" />
            </g>
            <defs>
              <clipPath id="clip0_189_4041">
                <rect width="16" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span className="hidden px-2.5 font-sans text-base font-normal leading-6 text-gray-900 sm:block">
            Feedback
          </span>
          <span className="px-2.5 font-sans text-base font-normal leading-6 text-gray-900 sm:hidden">
            Feedback
          </span>
          <svg
            className="duration-50 hidden opacity-0 transition-opacity ease-in-out group-hover:opacity-100 sm:block sm:-rotate-90"
            onClick={(e) => {
              e.stopPropagation();
              setIsSuggestionOpen(false);
            }}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <rect width="16" height="16" rx="8" fill="white" />
            <path
              d="M8.80901 8L12.9106 3.11094C12.9793 3.02969 12.9215 2.90625 12.8153 2.90625H11.5684C11.4949 2.90625 11.4246 2.93906 11.3762 2.99531L7.99339 7.02813L4.61057 2.99531C4.5637 2.93906 4.49339 2.90625 4.41839 2.90625H3.17151C3.06526 2.90625 3.00745 3.02969 3.0762 3.11094L7.17776 8L3.0762 12.8891C3.0608 12.9072 3.05092 12.9293 3.04773 12.9529C3.04454 12.9764 3.04818 13.0004 3.05822 13.022C3.06826 13.0435 3.08426 13.0617 3.10435 13.0745C3.12443 13.0872 3.14774 13.0939 3.17151 13.0938H4.41839C4.49182 13.0938 4.56214 13.0609 4.61057 13.0047L7.99339 8.97188L11.3762 13.0047C11.4231 13.0609 11.4934 13.0938 11.5684 13.0938H12.8153C12.9215 13.0938 12.9793 12.9703 12.9106 12.8891L8.80901 8Z"
              fill="#070A26"
            />
          </svg>
        </div>
      </SuggestionModal>

      <WidgetModal
        placement={"widget"}
        clickOutside={clickOutside}
        darkOverlay={darkOverlay}
        highlightBorderColor={highlightBorderColor}
        isOpen={isOpen}
        onCloseSurvey={closeSurvey}
        onCloseSuggestionAndSurvey={closeSuggestionAndSurvey}>
        <Survey
          survey={survey}
          isBrandingEnabled={false}
          activeQuestionId={activeQuestionId}
          onDisplay={onDisplay}
          getSetIsResponseSendingFinished={getSetIsResponseSendingFinished}
          onActiveQuestionChange={onActiveQuestionChange}
          onResponse={onResponse}
          languageCode={languageCode}
          onClose={closeSuggestionAndSurvey}
          onFinished={() => {
            onFinished();
            setTimeout(() => {
              if (!survey.redirectUrl) {
                closeSurvey();
              }
            }, 3000); // close modal automatically after 3 seconds
          }}
          onRetry={onRetry}
          getSetIsError={getSetIsError}
          onFileUpload={onFileUpload}
          isRedirectDisabled={isRedirectDisabled}
          responseCount={responseCount}
          styling={styling}
          isCardBorderVisible={!highlightBorderColor}
        />
      </WidgetModal>
    </div>
  );
}
