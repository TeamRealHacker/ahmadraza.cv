import type { ReactNode } from "react";

/**
 * A phone mockup: bezel, side buttons and a camera island, with the app
 * preview playing inside the screen. Used for Kite, which is an Android
 * app — its vertical recording belongs in a phone, not a browser frame.
 */
export function PhoneFrame({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="phone-wrap">
      <div className="phone-frame" role="presentation">
        <div className="phone-island" aria-hidden="true" />
        <div className="phone-screen">{children}</div>
      </div>
      {label ? <p className="phone-caption">{label}</p> : null}
    </div>
  );
}
