declare module 'heic2any';
declare module 'browser-image-compression';
declare module 'heic-convert';
declare module 'heic2any';

interface Window {
  turnstile?: {
    render: (
      container: string | HTMLElement,
      options: {
        sitekey: string;
        theme?: "light" | "dark" | "auto";
        callback?: (token: string) => void;
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
      }
    ) => string;
    reset: (widgetId?: string) => void;
  };
}
