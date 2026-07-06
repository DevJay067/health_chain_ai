// @ts-ignore
import LogoLoop from './LogoLoop';

const sponsors = [
  "SYMPL.CM",
  "IREMOS",
  "ADVANCECM",
  "S WE'SHARE",
  "HEALTH AI",
  "VITAL LINK",
  "GENESIS"
];

const logoItems = sponsors.map((sponsor) => ({
  node: (
    <div className="flex items-center space-x-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default h-full">
      <div className="w-8 h-8 rounded bg-slate-300 shrink-0" />
      <span className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">{sponsor}</span>
    </div>
  ),
  title: sponsor
}));

export default function SponsorMarquee() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
        <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">
          TRUSTED BY FOUNDERS, BUILDERS, AND HEALTH TEAMS
        </h4>
      </div>
      
      <LogoLoop
        logos={logoItems}
        speed={80}
        direction="left"
        logoHeight={48}
        gap={96}
        pauseOnHover={false}
        fadeOut
        fadeOutColor="#fcfcfc"
      />
    </div>
  );
}
