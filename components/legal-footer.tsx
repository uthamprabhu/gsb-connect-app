"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";

type LegalFooterProps = {
  className?: string;
};

export function LegalFooter({ className = "" }: LegalFooterProps) {
  const [contactOpen, setContactOpen] = useState(false);
  const developerEmail = "zappermash1@gmail.com";

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(developerEmail);
      toast.success("Email copied.");
    } catch {
      toast.error("Could not copy email. Please copy it manually.");
    }
  }

  const gmailCompose = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(developerEmail)}`;
  const outlookCompose = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(developerEmail)}`;

  return (
    <>
      <footer className={`mt-6 pb-20 text-center text-xs text-slate-400 ${className}`.trim()}>
        <p>
          <a
            href="/terms"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-cyan-300 underline decoration-cyan-400/60 underline-offset-4 hover:text-cyan-200"
          >
            Terms & Conditions
          </a>
        </p>
        <p className="mt-1">
          Developed by{" "}
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="font-semibold text-cyan-300 underline decoration-cyan-400/60 underline-offset-4 hover:text-cyan-200"
            aria-label="Contact developer zorscode"
          >
            zorscode
          </button>
        </p>
        <p className="mt-1">
          If any issues or improvements,{" "}
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="text-cyan-300 underline decoration-cyan-400/60 underline-offset-4 hover:text-cyan-200"
            aria-label="Open developer contact options"
          >
            contact developer
          </button>
          .
        </p>
        <p className="mt-1 text-slate-500">&copy; 2026 GSB Connect. All rights reserved.</p>
      </footer>

      <Modal open={contactOpen} onClose={() => setContactOpen(false)} title="Contact Developer">
        <div className="space-y-3 text-sm">
          <p className="text-slate-300">Choose how you want to contact zorscode.</p>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-200">
            <span>{developerEmail}</span>
            <button
              type="button"
              onClick={() => void copyEmail()}
              className="rounded-md p-1 text-cyan-300 hover:bg-white/10 hover:text-cyan-200"
              aria-label="Copy developer email"
              title="Copy email"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={gmailCompose}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center rounded-xl bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/15"
            >
              Open Gmail
            </a>
            <a
              href={outlookCompose}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center rounded-xl bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/15"
            >
              Open Outlook
            </a>
            <a
              href={`mailto:${developerEmail}`}
              className="inline-flex h-9 items-center rounded-xl bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/15"
            >
              Default Mail App
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
}

