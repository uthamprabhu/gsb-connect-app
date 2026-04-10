import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms & Conditions | GSB Connect",
  description: "Terms and conditions for using GSB Connect.",
};

const LAST_UPDATED = "April 10, 2026";

export default function TermsPage() {
  return (
    <main className="screen-shell gap-4">
      <Card className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight">Terms & Conditions</h1>
        <p className="text-xs text-slate-300">Last updated: {LAST_UPDATED}</p>
      </Card>

      <Card className="space-y-4 text-sm leading-6 text-slate-200">
        <section>
          <h2 className="text-base font-semibold text-white">1. Acceptance of Terms</h2>
          <p>
            By using GSB Connect, you agree to these terms and to use the platform in a respectful, lawful, and
            responsible way.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white">2. Eligibility</h2>
          <p>
            You must be legally eligible to use this service in your location. You are responsible for keeping your
            login credentials and Magic Key secure.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white">3. User Conduct</h2>
          <p>
            Harassment, abuse, impersonation, spam, or any harmful behavior is strictly prohibited. We may suspend or
            remove accounts that violate platform rules.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white">4. Match & Freeze Logic</h2>
          <p>
            After a successful mutual match, a temporary freeze period applies before new matches can be initiated.
            This is designed to encourage meaningful conversations.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white">5. Privacy</h2>
          <p>
            We store only the data required to operate the service, including profile data you provide and essential
            authentication information from approved login providers.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white">6. Service Availability</h2>
          <p>
            We may update, pause, or discontinue features at any time. We are not liable for temporary outages or
            interruptions.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white">7. Limitation of Liability</h2>
          <p>
            GSB Connect is provided on an &quot;as is&quot; basis without warranties. Use the platform at your own discretion
            and risk.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white">8. Contact</h2>
          <p>
            For support or policy questions, contact the developer:{" "}
            <a
              href="mailto:zappermash1@gmail.com"
              className="font-semibold text-cyan-300 underline decoration-cyan-400/60 underline-offset-4 hover:text-cyan-200"
            >
              zorscode
            </a>
            .
          </p>
        </section>
      </Card>

      <Card className="text-center text-xs text-slate-400">
        <p>© 2026 GSB Connect. All rights reserved.</p>
        <p className="mt-2">
          <Link href="/" className="text-cyan-300 underline decoration-cyan-400/60 underline-offset-4 hover:text-cyan-200">
            Back to App
          </Link>
        </p>
      </Card>
    </main>
  );
}
