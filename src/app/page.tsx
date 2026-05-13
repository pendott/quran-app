import { Audience } from "@/components/landing/audience";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { PricingTeaser } from "@/components/landing/pricing-teaser";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--landing-bg)] text-slate-900">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <Audience />
        <PricingTeaser />
      </main>
      <SiteFooter />
    </div>
  );
}
