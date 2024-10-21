import Script from "next/script";

export default async function SurveyLayout({ children }) {
  return (
    <div>
      {children}

      <Script src={"/scripts/polyfillStructuredClone.js"} />

      <Script
        id={"structured-clone"}
        strategy={"beforeInteractive"}
        dangerouslySetInnerHTML={{
          __html: `
            function structuredClone(obj) {
              if (typeof obj !== 'object' || obj === null) {
                // If the input is not an object or is null, return it directly
                return obj;
              }
            
              try {
                // Use JSON.stringify to serialize the object to a JSON string
                // Then use JSON.parse to deserialize it back to a new object
                return JSON.parse(JSON.stringify(obj));
              } catch (e) {
                console.error('Failed to clone object:', e);
                return null; // Return null if cloning fails
              }
            }

            if (typeof structuredClone !== 'function' && typeof window !== 'undefined') {
              window.structuredClone = structuredClone;
            }
          `,
        }}
      />

      {/* Yandex.Metrika counter */}
      <Script
        id={"yandex-metrika-script"}
        dangerouslySetInnerHTML={{
          __html: `
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    
            ym(96974915, "init", {
              clickmap:true,
              trackLinks:true,
              accurateTrackBounce:true,
              webvisor:true
            });
          `,
        }}
      />

      <Script
        id={"anecdoteMessageHandler"}
        dangerouslySetInnerHTML={{
          __html: `
              typeof webkit === "object" && webkit?.messageHandlers?.anecdoteBridge?.onMessage = () => {}
          `,
        }}
      />
      <noscript>
        <div>
          <img
            src="https://mc.yandex.ru/watch/96974915"
            style={{ position: "absolute", left: "-9999" }}
            alt=""
          />
        </div>
      </noscript>
      {/* Yandex.Metrika counter */}

      {/* Google tag (gtag.js */}
      <Script
        id={"google-tag-load-script"}
        src={"https://www.googletagmanager.com/gtag/js?id=G-X2Q3QZGP2W"}
      />
      <Script
        id={"google-tag-init-script"}
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          
            gtag('config', 'G-X2Q3QZGP2W');
          `,
        }}
      />
      {/* Google tag (gtag.js */}
    </div>
  );
}
