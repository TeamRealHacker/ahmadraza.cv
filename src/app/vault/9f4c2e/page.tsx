import type { Metadata } from "next";
import "@/styles/console.css";
import { VaultGate } from "@/components/vault-gate";

export const metadata: Metadata = {
  title: "Restricted",
  description: "An unlisted door.",
  robots: { index: false, follow: false, nocache: true },
};

export default function VaultPage() {
  return <VaultGate />;
}
