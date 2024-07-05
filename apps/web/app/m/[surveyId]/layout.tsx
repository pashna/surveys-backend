import Script from "next/script";

export default async function SurveyLayout({ children }) {
  return (
    <div>
      {children}

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
