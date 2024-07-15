export type WebkitType = {
  messageHandlers: {
    anecdoteBridge: {
      postMessage: (data: string) => void;
      onMessage: (data: string) => void;
    };
  };
};

export const getAnecdoteBridge = () => {
  // @ts-ignore
  if (typeof webkit !== "object") return;
  // @ts-ignore
  const bridge = (webkit as WebkitType)?.messageHandlers?.anecdoteBridge;

  if (bridge) return bridge;
  return null;
};
