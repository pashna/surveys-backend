import { cn } from "@/lib/utils";
import { VNode } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

interface ModalProps {
  children: VNode;
  isOpen: boolean;
  onClick: () => void;
  onClose: () => void;
  hideCloseBtn?: boolean;
  additionalClasses?: string;
}

export default function SuggestionModal({ children, isOpen, onClick, onClose, hideCloseBtn }: ModalProps) {
  const [show, setShow] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    setShow(isOpen);
  }, [isOpen]);

  if (!show) return null;

  return (
    <div aria-live="assertive" className={cn("pointer-events-none", "z-999999 fixed inset-0 flex items-end")}>
      <div className={cn("relative h-full w-full", "bg-none transition-all duration-500 ease-in-out")}>
        <div
          ref={modalRef}
          onClick={onClick}
          style={{ border: "1px solid rgba(7, 10, 38, 0.70)", borderRadius: "12px 12px 0 0" }}
          className={cn(
            "absolute right-0 top-3/4 -translate-y-1/2 translate-x-1/2 -rotate-90 transform sm:top-1/2",
            "w-186 m-0 bg-white shadow-md transition-all duration-500 ease-in-out",
            "opacity-100",
            "group pointer-events-auto",
            "cursor-pointer"
          )}>
          {!hideCloseBtn && (
            <div class="absolute right-0 top-0 block">
              <button
                type="button"
                onClick={onClose}
                class="text-close-button hover:text-close-button-focus focus:ring-close-button-focus relative h-5 w-5 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2">
                <span class="sr-only">Close survey</span>
                <svg
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4L20 20M4 20L20 4" />
                </svg>
              </button>
            </div>
          )}
          <div className="transition-height h-0 duration-300 ease-in-out sm:group-hover:h-2.5" />
          <div className="pl-2 pr-2">{children}</div>
          <div className="transition-height h-0 duration-300 ease-in-out sm:group-hover:h-2.5" />

          <div style={{ height: 2, background: "rgba(7, 10, 38, 0.70)" }} />

          <div className="transition-height h-0 duration-300 ease-in-out sm:group-hover:h-2.5" />
          <div style={{ pointerEvents: "none", opacity: 0 }}>{children}</div>
          <div className="transition-height h-0 duration-300 ease-in-out sm:group-hover:h-2.5" />
        </div>
      </div>
    </div>
  );
}
