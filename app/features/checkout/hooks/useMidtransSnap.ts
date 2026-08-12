"use client";

import * as React from "react";

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: MidtransSnapCallbacks) => void;
    };
  }
}

export type MidtransSnapResult = {
  order_id: string;
  transaction_status: string;
  [key: string]: unknown;
};

export type MidtransSnapCallbacks = {
  onSuccess?: (result: MidtransSnapResult) => void;
  onPending?: (result: MidtransSnapResult) => void;
  onError?: (result: MidtransSnapResult) => void;
  onClose?: () => void;
};

const SNAP_SRC =
  process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

/** Loads the Midtrans Snap.js popup SDK once and exposes a `pay(token, callbacks)` helper. */
export function useMidtransSnap() {
  const [isReady, setIsReady] = React.useState(() => typeof window !== "undefined" && !!window.snap);

  React.useEffect(() => {
    if (isReady) return;

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SNAP_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => setIsReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src = SNAP_SRC;
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "");
    script.onload = () => setIsReady(true);
    document.body.appendChild(script);
  }, [isReady]);

  const pay = React.useCallback((token: string, callbacks?: MidtransSnapCallbacks) => {
    window.snap?.pay(token, callbacks);
  }, []);

  return { isReady, pay };
}
