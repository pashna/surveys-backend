declare global {
  interface Window {
    anecdoteai: any;
  }
}

let sdkLoadingPromise: Promise<void> | null = null;
let isErrorLoadingSdk = false;

async function loadSDK(apiHost: string) {
  if (!window.anecdoteai) {
    const res = await fetch(`${apiHost}/api/packages/sdk-core`);
    if (!res.ok) throw new Error("Failed to load Anecdoteai SDK");
    const sdkScript = await res.text();
    const scriptTag = document.createElement("script");
    scriptTag.innerHTML = sdkScript;
    document.head.appendChild(scriptTag);

    return new Promise<void>((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (window.anecdoteai) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Anecdoteai SDK loading timed out"));
      }, 10000);
    });
  }
}

const formbricksProxyHandler: ProxyHandler<any> = {
  get(_target, prop, _receiver) {
    return async (...args: any[]) => {
      if (!window.anecdoteai && !sdkLoadingPromise && !isErrorLoadingSdk) {
        const { apiHost } = args[0];
        sdkLoadingPromise = loadSDK(apiHost).catch((error) => {
          console.error(`🧱 Anecdoteai - Error loading SDK: ${error}`);
          sdkLoadingPromise = null;
          isErrorLoadingSdk = true;
          return;
        });
      }

      if (isErrorLoadingSdk) {
        return;
      }

      if (sdkLoadingPromise) {
        await sdkLoadingPromise;
      }

      if (!window.anecdoteai) {
        throw new Error("Anecdoteai SDK is not available");
      }

      if (typeof window.anecdoteai[prop] !== "function") {
        console.error(`🧱 Anecdoteai - SDK does not support method ${String(prop)}`);
        return;
      }

      try {
        return window.anecdoteai[prop](...args);
      } catch (error) {
        console.error(error);
        throw error;
      }
    };
  },
};

const anecdoteai = new Proxy({}, formbricksProxyHandler);

export default anecdoteai;
