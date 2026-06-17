import Link from "next/link";
import { mr } from "@/lib/i18n/mr";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-brand to-brand-dark px-6 py-10 text-center text-white shadow-lg">
        <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
          {mr.home.heroTitle}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-teal-50">
          {mr.home.heroSubtitle}
        </p>
        <div className="mt-7 flex flex-col items-center gap-3">
          <Link
            href="/report"
            className="w-full max-w-xs rounded-2xl bg-white px-6 py-4 text-lg font-bold text-brand-dark shadow-md active:scale-[0.99]"
          >
            🚨 {mr.home.reportCta}
          </Link>
          <Link
            href="/map"
            className="text-sm font-medium text-teal-50 underline underline-offset-4"
          >
            {mr.home.viewMap}
          </Link>
        </div>
      </section>

      {/* Safety note */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        ⚠️ {mr.home.safetyNote}
      </div>

      {/* How it works */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-800">
          {mr.home.howTitle}
        </h2>
        <div className="grid gap-3">
          <Step
            emoji="📷"
            title={mr.home.step1Title}
            desc={mr.home.step1Desc}
          />
          <Step
            emoji="📍"
            title={mr.home.step2Title}
            desc={mr.home.step2Desc}
          />
          <Step
            emoji="✅"
            title={mr.home.step3Title}
            desc={mr.home.step3Desc}
          />
        </div>
      </section>
    </div>
  );
}

function Step({
  emoji,
  title,
  desc,
}: {
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="card flex items-start gap-3">
      <span className="text-2xl">{emoji}</span>
      <div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-600">{desc}</p>
      </div>
    </div>
  );
}
