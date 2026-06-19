import type React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

type LegalPageProps = {
  type: 'privacy' | 'terms';
};

const updatedDate = 'June 19, 2026';

export default function LegalPage({ type }: LegalPageProps) {
  const isPrivacy = type === 'privacy';
  const Icon = isPrivacy ? ShieldCheck : FileText;

  return (
    <div className="min-h-screen bg-brand-cream pt-32 pb-24 px-6 clinical-grid">
      <article className="max-w-4xl mx-auto bg-white border border-brand-sand rounded-[2.5rem] p-8 md:p-12 shadow-xl">
        <header className="space-y-5 mb-12">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta">
            <Icon size={14} />
            Vershanté Lynn Aesthetics
          </div>
          <h1 className="text-5xl md:text-6xl font-serif italic text-brand-slate leading-tight">
            {isPrivacy ? 'Privacy Policy' : 'Terms of Use'}
          </h1>
          <p className="text-sm text-brand-moss/60 font-light">Last updated: {updatedDate}</p>
        </header>

        {isPrivacy ? <PrivacyPolicy /> : <TermsOfUse />}
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border-t border-brand-sand/70 pt-8">
      <h2 className="text-2xl font-serif italic text-brand-slate">{title}</h2>
      <div className="space-y-3 text-sm md:text-base text-brand-moss/75 font-light leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function PrivacyPolicy() {
  return (
    <div className="space-y-8">
      <Section title="Information We Collect">
        <p>
          We collect information you choose to share through this website, including your name, email address, phone number, messages, screening responses, assessment details, scheduling preferences, and skin concerns.
        </p>
        <p>
          If you use the client or admin portal, authentication details may be processed through Firebase to help protect access to records.
        </p>
      </Section>

      <Section title="How We Use Information">
        <p>
          Information is used to respond to inquiries, review screening and assessment submissions, support scheduling, prepare professional skincare guidance, manage client history, and improve the service experience.
        </p>
        <p>
          Submissions may be emailed to the business inbox and stored in the secure administrative dashboard for follow-up.
        </p>
      </Section>

      <Section title="Skincare and Health Information">
        <p>
          Screening and assessment responses are used for esthetic consultation and skincare planning. This website does not provide medical diagnosis, medical treatment, or emergency care.
        </p>
        <p>
          Please consult a licensed medical provider for medical concerns, prescriptions, skin disease, infection, severe reactions, or urgent symptoms.
        </p>
      </Section>

      <Section title="Sharing and Service Providers">
        <p>
          We do not sell personal information. We may use trusted platforms such as Firebase, PocketSuite, Resend, and website hosting tools to operate forms, portals, scheduling, email notifications, and client communication.
        </p>
      </Section>

      <Section title="Your Choices">
        <p>
          You may contact us to request updates, corrections, or deletion of your submitted information where legally and operationally appropriate.
        </p>
        <p>
          For privacy requests, email <a href="mailto:artbrowbeautycle@gmail.com" className="text-brand-terracotta font-medium hover:text-brand-slate">artbrowbeautycle@gmail.com</a>.
        </p>
      </Section>

      <Section title="Security">
        <p>
          We use reasonable administrative and technical safeguards to protect submitted information. No internet system can be guaranteed completely secure, so please avoid submitting highly sensitive medical or financial information through general contact forms.
        </p>
      </Section>
    </div>
  );
}

function TermsOfUse() {
  return (
    <div className="space-y-8">
      <Section title="Use of This Website">
        <p>
          By using this website, you agree to use it for lawful purposes and to provide accurate information when submitting forms, screenings, assessments, or scheduling requests.
        </p>
      </Section>

      <Section title="Esthetic Services and Educational Content">
        <p>
          Website content, screening results, and assessment language are for education and professional esthetic guidance. They are not medical advice, diagnosis, or treatment.
        </p>
        <p>
          Results and recommendations vary by individual skin history, lifestyle, consistency, product tolerance, and professional treatment plan.
        </p>
      </Section>

      <Section title="Bookings, Payments, and Third-Party Tools">
        <p>
          Booking, payment, purchasing, and scheduling links may open third-party services such as PocketSuite. Those services may have their own terms, privacy policies, cancellation rules, and payment requirements.
        </p>
      </Section>

      <Section title="Client Responsibility">
        <p>
          Clients are responsible for sharing accurate skin history, product use, allergies, medications, recent procedures, and relevant health information before receiving services or recommendations.
        </p>
      </Section>

      <Section title="Intellectual Property">
        <p>
          The website design, copy, images, Skin Intelligence language, The Lynn Method™ language, and brand materials belong to Vershanté Lynn Aesthetics unless otherwise stated. They may not be copied, republished, or reused without permission.
        </p>
      </Section>

      <Section title="Limitation of Liability">
        <p>
          Vershanté Lynn Aesthetics is not responsible for issues caused by inaccurate client information, misuse of products, failure to follow guidance, third-party platforms, or technical interruptions outside our control.
        </p>
      </Section>

      <Section title="Questions">
        <p>
          For questions about these terms, email <a href="mailto:artbrowbeautycle@gmail.com" className="text-brand-terracotta font-medium hover:text-brand-slate">artbrowbeautycle@gmail.com</a>.
        </p>
      </Section>
    </div>
  );
}
