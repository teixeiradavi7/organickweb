import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { LogOut, Building2, Users, TrendingUp, Calendar, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { classifyAgency, getPlantInfo } from "@/lib/plantClassification";
import { getUrgencyClassification, type PlantType } from "@/lib/urgencyClassification";

// ─── Empty Pot SVG (same as onboarding) ──────────────────────────────────────

function PlantPot() {
  return (
    <svg
      viewBox="0 0 200 280"
      className="w-full h-full max-w-[180px] mx-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Small sprout */}
      <path
        d="M 100 75 Q 90 50 75 40 Q 95 45 100 60"
        stroke="oklch(0.55 0.15 145)"
        strokeWidth="1.5"
        fill="oklch(0.55 0.15 145)"
        opacity="0.6"
      />
      <path
        d="M 100 75 Q 110 45 130 38 Q 108 48 100 65"
        stroke="oklch(0.55 0.15 145)"
        strokeWidth="1.5"
        fill="oklch(0.55 0.15 145)"
        opacity="0.6"
      />
      <line x1="100" y1="80" x2="100" y2="60" stroke="oklch(0.45 0.12 145)" strokeWidth="2" />

      {/* Pot body */}
      <path
        d="M 50 100 L 60 200 Q 60 220 80 220 L 120 220 Q 140 220 140 200 L 150 100 Z"
        stroke="oklch(0.13 0 0)"
        strokeWidth="2"
        fill="none"
      />
      {/* Pot rim */}
      <ellipse cx="100" cy="100" rx="50" ry="12" stroke="oklch(0.13 0 0)" strokeWidth="2" fill="none" />
      {/* Soil */}
      <ellipse cx="100" cy="205" rx="38" ry="8" fill="oklch(0.55 0 0)" opacity="0.4" />
    </svg>
  );
}

// ─── Health / Size Bar Component ──────────────────────────────────────────────

function ProgressBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const percentage = Math.min(100, (value / maxValue) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-medium text-foreground/60">{label}</span>
        <span className="text-[12px] font-semibold text-foreground/40">{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Utility: calculate "health" score from onboarding data ──────────────────

function calculateScores(answers: Record<string, string> | null) {
  if (!answers) return { health: 30, size: 20 };

  let health = 40; // baseline
  let size = 20;

  // Agency age contributes to health
  const ageMap: Record<string, number> = { less_3m: 10, "3_to_6m": 20, "6m_to_1y": 30, more_1y: 40 };
  health += ageMap[answers.agencyAge] || 0;

  // Client count
  const clients = parseInt(answers.clientCount || "0", 10);
  if (clients > 20) health += 15;
  else if (clients > 10) health += 10;
  else if (clients > 5) health += 5;

  // Agency size
  const sizeMap: Record<string, number> = { solo: 15, "2_to_5": 35, "6_to_12": 60, more_12: 90 };
  size = sizeMap[answers.agencySize] || 20;

  return { health: Math.min(100, health), size: Math.min(100, size) };
}

// ─── Agency age label ────────────────────────────────────────────────────────

function getAgencyAgeLabel(id: string): string {
  const map: Record<string, string> = {
    less_3m: "Menos de 3 meses",
    "3_to_6m": "3 a 6 meses",
    "6m_to_1y": "6 meses a 1 ano",
    more_1y: "Mais de 1 ano",
  };
  return map[id] || "Agência";
}

// ─── Agency size label ───────────────────────────────────────────────────────

function getAgencySizeLabel(id: string): string {
  const map: Record<string, string> = {
    solo: "Solo",
    "2_to_5": "2–5 pessoas",
    "6_to_12": "6–12 pessoas",
    more_12: "13+ pessoas",
  };
  return map[id] || "—";
}

// ─── Placeholder content block ───────────────────────────────────────────────

function PlaceholderBlock({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-default">
      <span className="text-[14px] font-medium text-foreground/60">{label}</span>
      <span className="text-[12px] font-semibold text-foreground/30">Em breve</span>
    </div>
  );
}

// ─── Main Members Component ──────────────────────────────────────────────────

export default function Members() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();

  const dashboardQuery = trpc.members.getDashboard.useQuery(undefined, {
    enabled: !!user,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      navigate("/");
    },
    onError: () => {
      toast.error("Erro ao sair. Tente novamente.");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.onboardingCompleted === "false") {
    return null;
  }

  const dashData = dashboardQuery.data;
  const agencyAnswers = dashData?.surveyAnswers ?? null;
  const agencyName = agencyAnswers?.agencyName || user.name || "Minha Agência";
  const scores = calculateScores(agencyAnswers);

  // Compute urgency once for use in both left sidebar and bottom section
  const teamSize = agencyAnswers?.agencySize
    ? parseInt(agencyAnswers.agencySize.split("_")[1] || "1", 10)
    : 1;
  const clientCount = agencyAnswers?.clientCount ? parseInt(agencyAnswers.clientCount, 10) : 0;
  const monthlyRevenue = agencyAnswers?.monthlyRevenue ? parseFloat(agencyAnswers.monthlyRevenue) : 0;
  const agencyAge = agencyAnswers?.agencyAge || "less_3m";

  const plantType = classifyAgency(teamSize, clientCount, monthlyRevenue, agencyAge);
  const urgency = getUrgencyClassification(plantType, agencyName);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with logo */}
      <header className="fixed top-0 left-0 right-0 z-50 glass shadow-sm">
        <div className="container">
          <nav className="flex items-center justify-between h-16 md:h-[72px]">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663539164565/SCcHJ9kMbHptCUSEK4niWe/logo-organick_9080e848.png"
              alt="Organick"
              className="h-8 md:h-9 w-auto"
            />
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-2 text-[14px] font-medium text-foreground/60 hover:text-foreground transition-colors"
            >
              <LogOut size={16} />
              {logoutMutation.isPending ? "Saindo..." : "Sair"}
            </button>
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page title */}
          <div className="mb-12 animate-fade-in-up">
            <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-foreground/40 mb-3">
              Área do membro
            </p>
            <h1 className="text-headline text-foreground">
              Diagnóstico da sua agência
            </h1>
          </div>

          {/* Main layout: Left diagnostics + Center plant + Right agency info */}
          <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Left: Urgency diagnostics (1 col) */}
            <div className="lg:col-span-1 space-y-4 animate-fade-in-up">
              {/* Urgency Level Card */}
              <div className="bg-white rounded-3xl border border-border shadow-sm shadow-black/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: urgency.urgencyColor }}
                  >
                    <AlertCircle size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-foreground/40 mb-0.5">
                      Nível de Urgência
                    </p>
                    <p className="text-[16px] font-semibold text-foreground">{urgency.urgencyLabel}</p>
                  </div>
                </div>
                <p className="text-[13px] text-foreground/70 leading-relaxed">{urgency.resumo}</p>
              </div>

              {/* Pontos Positivos */}
              <div className="bg-white rounded-3xl border border-border shadow-sm shadow-black/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-foreground/40">
                    Pontos Positivos
                  </p>
                </div>
                <div className="space-y-2">
                  {urgency.positivos.map((ponto, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 shrink-0" />
                      <p className="text-[12px] text-foreground/70">{ponto}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pontos Negativos */}
              <div className="bg-white rounded-3xl border border-border shadow-sm shadow-black/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle size={16} className="text-red-600 shrink-0" />
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-foreground/40">
                    Pontos Negativos
                  </p>
                </div>
                <div className="space-y-2">
                  {urgency.negativos.map((ponto, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                      <p className="text-[12px] text-foreground/70">{ponto}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Center: Plant visual (2 cols) */}
            <div className="lg:col-span-2 flex flex-col items-center justify-start animate-fade-in-up animate-delay-200">
              <div className="w-full">
                <img
                  src={getPlantInfo(plantType).imageUrl}
                  alt={getPlantInfo(plantType).label}
                  className="w-full h-auto object-contain"
                />
              </div>
              <p className="text-[24px] font-semibold text-foreground text-center mt-8">
                {getPlantInfo(plantType).label}
              </p>
              <p className="text-[16px] text-foreground/50 text-center mt-3">
                {getPlantInfo(plantType).description}
              </p>
            </div>

            {/* Right: Agency info (1 col) */}
            <div className="lg:col-span-1 space-y-4 animate-fade-in-up animate-delay-100">
              {/* Agency Info Card */}
              <div className="bg-white rounded-3xl border border-border shadow-sm shadow-black/5 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-foreground flex items-center justify-center shrink-0">
                    <Building2 size={16} className="text-background" />
                  </div>
                  <div>
                    <h2 className="text-[14px] font-semibold tracking-tight text-foreground">
                      {agencyName}
                    </h2>
                    <p className="text-[11px] text-foreground/50 mt-0.5">
                      {agencyAnswers?.agencyAge ? getAgencyAgeLabel(agencyAnswers.agencyAge) : "Agência"}
                    </p>
                  </div>
                </div>

                {/* Health & Size bars */}
                <div className="space-y-3">
                  <ProgressBar
                    label="Saúde"
                    value={scores.health}
                    maxValue={100}
                    color="oklch(0.65 0.18 145)"
                  />
                  <ProgressBar
                    label="Tamanho"
                    value={scores.size}
                    maxValue={100}
                    color="oklch(0.6 0.15 250)"
                  />
                </div>
              </div>

              {/* Info Cards */}
              <div className="space-y-2">
                <InfoCard
                  icon={<Users size={14} />}
                  label="Equipe"
                  value={agencyAnswers?.agencySize ? getAgencySizeLabel(agencyAnswers.agencySize) : "—"}
                />
                <InfoCard
                  icon={<TrendingUp size={14} />}
                  label="Clientes"
                  value={agencyAnswers?.clientCount ? `${agencyAnswers.clientCount}` : "—"}
                />
                <InfoCard
                  icon={<Building2 size={14} />}
                  label="Faturamento"
                  value={
                    agencyAnswers?.monthlyRevenue
                      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(
                          Number(agencyAnswers.monthlyRevenue)
                        )
                      : "—"
                  }
                />
                <InfoCard
                  icon={<Calendar size={14} />}
                  label="Call"
                  value={
                    agencyAnswers?.onboardingCallTime === "monday_15"
                      ? "Seg 15h"
                      : agencyAnswers?.onboardingCallTime === "thursday_18"
                        ? "Qui 18h30"
                        : "—"
                  }
                />
              </div>
            </div>
          </div>

          {/* Bottom: Próximos passos section */}
          <div className="mt-12 bg-white rounded-3xl border border-border shadow-sm shadow-black/5 p-8 animate-fade-in-up animate-delay-300">
            <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-foreground/40 mb-4">
              Próximos passos
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <PlaceholderBlock label="Módulo 1 — Estrutura" />
              <PlaceholderBlock label="Módulo 2 — Captação" />
              <PlaceholderBlock label="Módulo 3 — Processos" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm shadow-black/5 p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center text-foreground/50">
          {icon}
        </div>
        <span className="text-[9px] font-semibold tracking-[0.15em] uppercase text-foreground/40">
          {label}
        </span>
      </div>
      <p className="text-[13px] font-semibold text-foreground">{value}</p>
    </div>
  );
}
