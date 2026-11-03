import type { SVGProps } from "react";
import { Mail } from "lucide-react";

type P = SVGProps<SVGSVGElement>;

export function GithubIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function XIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.57l11.1 14.43Z" />
    </svg>
  );
}

export function LinkedinIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h3.96V21H3V9.75Zm6.44 0h3.8v1.54h.05c.53-1 1.82-2.06 3.75-2.06 4 0 4.74 2.63 4.74 6.05V21h-3.96v-4.9c0-1.17-.02-2.67-1.63-2.67-1.63 0-1.88 1.27-1.88 2.59V21H9.44V9.75Z" />
    </svg>
  );
}

export function SocialIcon({ name, ...props }: { name: string } & P) {
  switch (name) {
    case "github":
      return <GithubIcon {...props} />;
    case "x":
      return <XIcon {...props} />;
    case "linkedin":
      return <LinkedinIcon {...props} />;
    default:
      return <Mail aria-hidden="true" {...(props as object)} />;
  }
}

export function CrownIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M3.5 18.5 2.5 7l5.2 4.6L12 4l4.3 7.6L21.5 7l-1 11.5h-17Z"
        fill="currentColor"
        stroke="var(--bg)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <rect x="3.5" y="19.5" width="17" height="2" rx="1" fill="currentColor" stroke="var(--bg)" strokeWidth="1" />
    </svg>
  );
}

/** Real Pakistan flag — crisp 3:2 proportions, proper crescent + star. */
export function PakistanFlag({ size = 16, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={Math.round(size * 2 / 3)}
      viewBox="0 0 30 20"
      role="img"
      aria-label="Pakistan flag"
      shapeRendering="geometricPrecision"
      {...props}
    >
      <rect width="30" height="20" rx="2.5" fill="#01411c" />
      <path d="M0 2.5 A2.5 2.5 0 0 1 2.5 0 H7.5 V20 H2.5 A2.5 2.5 0 0 1 0 17.5 Z" fill="#fff" />
      <circle cx="18" cy="10" r="5.4" fill="#fff" />
      <circle cx="20" cy="8.6" r="4.6" fill="#01411c" />
      <path
        d="M22.70 7.10 L23.39 9.05 L25.46 9.10 L23.82 10.36 L24.40 12.35 L22.70 11.18 L21.00 12.35 L21.58 10.36 L19.94 9.10 L22.01 9.05 Z"
        fill="#fff"
      />
      <rect x=".5" y=".5" width="29" height="19" rx="2.3" fill="none" stroke="currentColor" strokeOpacity=".3" strokeWidth="1" />
    </svg>
  );
}
