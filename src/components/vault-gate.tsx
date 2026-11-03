"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CircleHelp, KeyRound, LockKeyhole } from "lucide-react";
import { ADMIN_PATH, VAULT_HINT_LOCATIONS, VAULT_RIDDLE } from "@/lib/vault";

export function VaultGate() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pass, setPass] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "wrong" | "locked" | "ok" | "already">("idle");
  const [tries, setTries] = useState(0);
  const [showHints, setShowHints] = useState(false);

  /* Already unlocked? Only the server can say — a valid session cookie
     makes /api/admin answer 200. Nothing is stored in the browser. */
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin", { cache: "no-store" })
      .then((res) => { if (!cancelled && res.ok) setState("already"); })
      .catch(() => { /* stay locked */ });
    return () => { cancelled = true; };
  }, []);

  const unlock = async () => {
    if (state === "checking" || !value.trim()) return;
    setState("checking");
    try {
      const res = await fetch("/api/admin/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: value, ...(pass ? { pass } : {}) }),
      });
      if (res.status === 429) {
        setState("locked");
        return;
      }
      if (!res.ok) {
        setTries((t) => t + 1);
        setState("wrong");
        setValue("");
        return;
      }
      setState("ok");
      window.setTimeout(() => router.push(ADMIN_PATH), 520);
    } catch {
      setTries((t) => t + 1);
      setState("wrong");
    }
  };

  return (
    <main className="vault-page">
      <div className="vault-glow" aria-hidden="true" />
      <div className="vault-shell">
        <div className="vault-top">
          <span className="vault-badge"><LockKeyhole size={13} /> RESTRICTED / 00</span>
          <span className="vault-node">AR://VAULT</span>
        </div>

        <div className="vault-body">
          <p className="vault-kicker">Not on any map. Not in any menu.</p>
          <h1 className="vault-title">A door,<br /><em>unlisted.</em></h1>
          <p className="vault-riddle">{VAULT_RIDDLE}</p>

          <form
            className={`vault-form ${state === "wrong" ? "is-wrong" : ""} ${state === "ok" ? "is-ok" : ""}`}
            onSubmit={(e) => { e.preventDefault(); void unlock(); }}
          >
            <label htmlFor="vault-key" className="sr-only">The key</label>
            <div className="vault-input-wrap">
              <KeyRound size={16} aria-hidden="true" />
              <input
                id="vault-key"
                value={value}
                onChange={(e) => { setValue(e.target.value); if (state === "wrong") setState("idle"); }}
                placeholder="the key"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                disabled={state === "checking" || state === "ok"}
              />
              <button type="submit" aria-label="Try the key" disabled={state === "checking" || state === "ok"}>
                <ArrowRight size={16} />
              </button>
            </div>
            <label htmlFor="vault-pass" className="sr-only">Second password (only if one is set)</label>
            <div className="vault-input-wrap">
              <LockKeyhole size={16} aria-hidden="true" />
              <input
                id="vault-pass"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="second password — only if one is set"
                autoComplete="off"
                disabled={state === "checking" || state === "ok"}
              />
            </div>
            <p className="vault-status" role="status">
              {state === "wrong" && <>Not it. <span>{tries} failed {tries === 1 ? "attempt" : "attempts"}</span></>}
              {state === "locked" && "Too many failed attempts — try again later."}
              {state === "checking" && "Checking…"}
              {state === "ok" && "Opening the door…"}
              {state === "already" && "Already unlocked this session."}
              {(state === "idle" || state === "already") && !showHints && "Three keys · one word · A–Z 0–9"}
            </p>
          </form>

          {state === "already" && (
            <button type="button" className="vault-enter" onClick={() => router.push(ADMIN_PATH)}>
              Enter the panel <ArrowRight size={15} />
            </button>
          )}

          <div className="vault-tools">
            <button type="button" onClick={() => setShowHints((v) => !v)} aria-expanded={showHints}>
              <CircleHelp size={13} /> {showHints ? "Hide" : "Where are the clues?"}
            </button>
          </div>

          {showHints && (
            <ul className="vault-hints">
              {VAULT_HINT_LOCATIONS.map((c, i) => <li key={c}><span>{String(i + 1).padStart(2, "0")}</span>{c}</li>)}
            </ul>
          )}
        </div>

        <div className="vault-foot">
          <Link href="/"><ArrowLeft size={13} /> back to the site</Link>
          <span>07 · 12 · 01</span>
        </div>
      </div>
      <p className="vault-fineprint">Restricted panel — unlock with the key.</p>
    </main>
  );
}
