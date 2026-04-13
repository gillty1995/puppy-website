"use client";

import { useEffect, useId, useRef, useState } from "react";
import Script from "next/script";

type TurnstileWidgetProps = {
  onTokenChange: (token: string) => void;
  resetKey?: number;
};

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";

export default function TurnstileWidget({
  onTokenChange,
  resetKey = 0,
}: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerId = useId().replace(/:/g, "");
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!siteKey || !scriptReady || !window.turnstile) return;
    if (widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(`#${containerId}`, {
      sitekey: siteKey,
      theme: "light",
      callback: (token: string) => onTokenChange(token),
      "expired-callback": () => onTokenChange(""),
      "error-callback": () => onTokenChange(""),
    });
  }, [containerId, onTokenChange, scriptReady, siteKey]);

  useEffect(() => {
    if (!widgetIdRef.current || !window.turnstile) return;
    window.turnstile.reset(widgetIdRef.current);
    onTokenChange("");
  }, [onTokenChange, resetKey]);

  if (!siteKey) {
    return (
      <p className="text-sm text-amber-700">
        Bot protection is not configured yet. Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
        to enable contact submissions.
      </p>
    );
  }

  return (
    <>
      <Script
        id={TURNSTILE_SCRIPT_ID}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div id={containerId} />
    </>
  );
}
