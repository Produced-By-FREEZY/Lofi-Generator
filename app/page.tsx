import { RockerSwitch } from "@/components/rocker-switch";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Subtle grid overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(223 10% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(223 10% 50%) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Panel card */}
      <div className="relative z-10 flex flex-col items-center gap-16 bg-card border border-border rounded-2xl px-16 py-14 shadow-2xl"
        style={{ boxShadow: "0 0 80px -20px hsl(223 10% 5%), 0 0 0 1px hsl(223 10% 20%)" }}
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-xs font-mono tracking-[0.35em] text-muted-foreground uppercase">
            Lofi Generator
          </h1>
          <div className="h-px w-12 bg-border mt-2" />
        </div>

        {/* Switch */}
        <RockerSwitch />


      </div>
    </main>
  );
}
