import { ArrowUpRight, Calendar, ShoppingBag, Sparkles, MessageSquare, Users, PenTool } from 'lucide-react';

const bookingLinks = [
  {
    title: 'Begin your Skin Assessment',
    description: 'Start with the Skin Intelligence pathway for professional analysis and corrective direction.',
    href: 'https://pocketsuite.io/link/vershantelynn/begin-your-skin-assessment',
    icon: Calendar,
  },
  {
    title: 'Begin Regenerative Skin Systems',
    description: 'Move into structured corrective care and skin renewal planning.',
    href: 'https://pocketsuite.io/link/vershantelynn/begin-regenerative-skin-systems',
    icon: Sparkles,
  },
  {
    title: 'Design Your Brows',
    description: 'Book brow design services with intentional shaping and refinement.',
    href: 'https://pocketsuite.io/link/vershantelynn/design-your-brows',
    icon: PenTool,
  },
  {
    title: 'Professional Skincare Shop',
    description: 'Access professional product guidance and curated skincare purchasing.',
    href: 'https://pocketsuite.io/link/vershantelynn/professional-skincare-shop',
    icon: ShoppingBag,
  },
  {
    title: 'Glow Architect Collective',
    description: 'Connect with the collective experience for education, strategy, and support.',
    href: 'https://pocketsuite.io/link/vershantelynn/glow-architect-collective',
    icon: Users,
  },
  {
    title: 'Direct Client Support',
    description: 'Use this path for direct client support, follow-up, and service communication.',
    href: 'https://pocketsuite.io/link/vershantelynn/direct-client-support',
    icon: MessageSquare,
  },
];

export default function BookNowPage() {
  return (
    <div className="min-h-screen bg-brand-cream pt-32 pb-24 px-6 clinical-grid">
      <div className="max-w-6xl mx-auto">
        <header className="max-w-3xl mb-14 space-y-5">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta">
            <Calendar size={14} />
            Book Now
          </div>
          <h1 className="text-5xl md:text-7xl font-serif italic text-brand-slate leading-[0.95]">
            Choose your next point of care.
          </h1>
          <p className="text-lg text-brand-moss/75 font-light leading-relaxed">
            Select the pathway that best matches what you need today. Each option opens through PocketSuite for booking, purchasing, or direct support.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-5">
          {bookingLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group bg-white border border-brand-sand rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl hover:border-brand-terracotta/60 transition-all"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-5">
                    <div className="w-12 h-12 rounded-xl bg-brand-sand/40 text-brand-terracotta flex items-center justify-center group-hover:bg-brand-terracotta group-hover:text-white transition-all">
                      <Icon size={20} />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-3xl font-serif italic text-brand-slate leading-tight">
                        {link.title}
                      </h2>
                      <p className="text-sm text-brand-moss/70 font-light leading-relaxed">
                        {link.description}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="text-brand-sand group-hover:text-brand-terracotta transition-all shrink-0" size={22} />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
