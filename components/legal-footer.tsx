"use client";

type LegalFooterProps = {
  className?: string;
};

export function LegalFooter({ className = "" }: LegalFooterProps) {
  return (
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
        <a
          href="mailto:zappermash1@gamil.com"
          className="font-semibold text-cyan-300 underline decoration-cyan-400/60 underline-offset-4 hover:text-cyan-200"
          aria-label="Email developer zorscode"
        >
          zorscode
        </a>
      </p>
      <p className="mt-1">
        If any issues or improvements,{" "}
        <a
          href="mailto:zappermash1@gamil.com"
          className="text-cyan-300 underline decoration-cyan-400/60 underline-offset-4 hover:text-cyan-200"
          aria-label="Contact developer by email"
        >
          contact developer
        </a>
        .
      </p>
      <p className="mt-1 text-slate-500">© 2026 GSB Connect. All rights reserved.</p>
    </footer>
  );
}
