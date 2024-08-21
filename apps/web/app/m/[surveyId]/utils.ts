export type WebkitType = {
  messageHandlers: {
    anecdoteBridge: {
      postMessage: (data: string) => void;
      onMessage: (data: string) => void;
    };
  };
};

const _messageHandlers: Array<(message: string) => void> = [];

export const getAnecdoteBridge = () => {
  let windowBridge: { postMessage: (msg: string) => void; onMessage: (msg: string) => void } | null = null;

  // @ts-ignore
  if (typeof webkit === "object") {
    // ios
    // @ts-ignore
    windowBridge = (webkit as WebkitType)?.messageHandlers?.anecdoteBridge;
  } else if (
    // @ts-ignore
    typeof window.AnecdoteBridge === "object"
  ) {
    // android
    // @ts-ignore
    windowBridge = window.AnecdoteBridge;
  }

  const bridge = windowBridge;

  if (!bridge) {
    return;
  }

  const wrapper = {
    postMessage: (data: string) => {
      bridge.postMessage(data);
    },
    addMessageHandler: (handler: (msg: string) => void) => {
      _messageHandlers.push(handler);
    },
    removeMessageHandler: (handler: (msg: string) => void) => {
      const index = _messageHandlers.findIndex((element) => element === handler);
      if (index !== -1) {
        _messageHandlers.splice(index, 1);
      }
    },
  };

  bridge.onMessage = (msg: string) => {
    _messageHandlers.forEach((handler) => {
      handler && handler(msg);
    });
  };
  return wrapper;
};
