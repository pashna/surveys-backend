"use client";

// Error components must be Client components
import { getAnecdoteBridge } from "@/app/m/[surveyId]/utils";
import { useEffect } from "react";

import { ErrorComponent } from "@formbricks/ui/ErrorComponent";

export default function Error({ error }: { error: Error; reset: () => void }) {
  if (process.env.NODE_ENV === "development") {
    console.error(error.message);
  }

  useEffect(() => {
    const bridge = getAnecdoteBridge();

    if (!bridge) return;

    bridge.postMessage(
      JSON.stringify({
        action: "surveyFillingOutError",
        error: {
          code: 500,
          message: "Error loading resources",
        },
      })
    );
  }, []);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <ErrorComponent />
    </div>
  );
}
