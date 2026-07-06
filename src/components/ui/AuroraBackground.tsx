export default function AuroraBackground({ rays = true, stars = true }: { rays?: boolean; stars?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* glowing aurora blobs */}
      <div className="absolute -left-40 -top-40 h-[38rem] w-[38rem] rounded-full bg-electric/25 blur-[140px] animate-aurora" />
      <div className="absolute right-[-10rem] top-20 h-[34rem] w-[34rem] rounded-full bg-cyan/20 blur-[150px] animate-aurora [animation-delay:-6s]" />
      <div className="absolute bottom-[-12rem] left-1/3 h-[40rem] w-[40rem] rounded-full bg-energy/10 blur-[160px] animate-aurora [animation-delay:-11s]" />

      {/* volumetric light rays */}
      {rays && (
        <div
          className="absolute left-1/2 top-[-20%] h-[80%] w-[120%] -translate-x-1/2 animate-aurora opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_0%,black,transparent)]"
          style={{
            background:
              "conic-gradient(from 200deg at 50% 0%, transparent 0deg, rgba(34,224,255,0.12) 20deg, transparent 40deg, rgba(46,107,255,0.12) 70deg, transparent 100deg, rgba(56,246,164,0.08) 140deg, transparent 180deg)",
          }}
        />
      )}

      {/* faint star field */}
      {stars && (
        <div
          className="absolute inset-0 opacity-40 dark:opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.6) 50%, transparent), radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.5) 50%, transparent), radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.45) 50%, transparent), radial-gradient(1.5px 1.5px at 85% 25%, rgba(34,224,255,0.6) 50%, transparent), radial-gradient(1px 1px at 55% 15%, rgba(255,255,255,0.4) 50%, transparent)",
            backgroundSize: "cover",
          }}
        />
      )}

      {/* grid */}
      <div className="absolute inset-0 bg-grid-lines [background-size:64px_64px] opacity-40 [mask-image:radial-gradient(70%_60%_at_50%_40%,black,transparent)]" />
    </div>
  );
}
