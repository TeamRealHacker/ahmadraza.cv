import type { Metadata } from "next";
import dynamic from "next/dynamic";

/** The console is client-only (cookie session, localStorage) — never SSR it. */
const AdminConsole = dynamic(() => import("@/components/admin-console").then((m) => m.AdminConsole), {
  loading: () => (
    <div className="admin-loading" aria-busy="true" aria-label="Loading console">
      <span className="admin-pulse" /> Loading console…
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Control",
  description: "Private console.",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return <AdminConsole />;
}
