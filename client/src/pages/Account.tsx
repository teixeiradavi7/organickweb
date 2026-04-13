import { useEffect } from "react";
import { useLocation } from "wouter";
import { LogOut, User, Mail, Calendar, Shield } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

export default function Account() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Você saiu com sucesso.");
      navigate("/");
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-12 animate-fade-in-up">
            <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-foreground/40 mb-3">
              Minha conta
            </p>
            <h1 className="text-headline text-foreground">
              Olá, {user.name?.split(" ")[0] ?? ""}
            </h1>
            <p className="text-subhead mt-1">Gerencie sua conta e preferências.</p>
          </div>

          {/* Profile card */}
          <div className="bg-white rounded-3xl border border-border shadow-sm shadow-black/5 overflow-hidden animate-fade-in-up animate-delay-100">
            {/* Avatar band */}
            <div className="h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 relative">
              <div className="absolute -bottom-8 left-8">
                <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center shadow-lg">
                  <span className="text-background text-xl font-semibold">
                    {(user.name ?? "U").charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-12 pb-8 px-8">
              <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
                {user.name ?? "Usuário"}
              </h2>
              <p className="text-[14px] text-foreground/50 mt-0.5 capitalize">
                {user.role ?? "user"}
              </p>

              {/* Info rows */}
              <div className="mt-8 flex flex-col gap-4">
                <InfoRow icon={<Mail size={15} />} label="Email" value={user.email ?? "—"} />
                <InfoRow
                  icon={<Shield size={15} />}
                  label="Método de login"
                  value={user.loginMethod === "local" ? "Email e senha" : (user.loginMethod ?? "local")}
                />
                <InfoRow
                  icon={<Calendar size={15} />}
                  label="Membro desde"
                  value={joinedDate}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 animate-fade-in-up animate-delay-200">
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-border text-[14px] font-medium text-foreground/70 hover:bg-neutral-50 hover:text-foreground active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <LogOut size={15} />
              {logoutMutation.isPending ? "Saindo…" : "Sair"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-foreground/50 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-foreground/40">
          {label}
        </p>
        <p className="text-[15px] text-foreground font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
