export type WebkitType = {
  messageHandlers: {
    anecdoteBridge: {
      postMessage: (data: string) => void;
    };
  };
};

export const getAnecdoteBridge = () => {
  // return {
  //   postMessage: (_data: string) => console.log(_data)
  // }
  if (typeof "window" !== "object") return;
  const _window = window as typeof window & { webkit: WebkitType };
  const bridge = _window?.webkit?.messageHandlers?.anecdoteBridge;

  if (bridge) return bridge;
  return null;
};
