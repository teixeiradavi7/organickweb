import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import Navbar from "@/components/Navbar";

// ─── Schema ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Por favor, insira um email válido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      toast.success(`Bem-vindo de volta, ${data.user?.name ?? ""}!`);
      utils.auth.me.invalidate();
      navigate("/members");
    },
    onError: (err) => {
      toast.error(err.message || "Falha no login. Tente novamente.");
    },
  });

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginForm) => loginMutation.mutate(data);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-24 px-6 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663539164565/SCcHJ9kMbHptCUSEK4niWe/logo-organick_9080e848.png"
              alt="Organick"
              className="h-10 w-auto mx-auto mb-8"
            />
            <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-foreground/40 mb-3">
              Acesse sua conta
            </p>
            <h2 className="text-headline text-foreground">
              Entrar
            </h2>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl border border-border shadow-sm shadow-black/5 p-8 animate-fade-in-up animate-delay-100">
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-foreground/60 tracking-wide">
                  Qual o seu email?
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className={`w-full h-12 px-4 rounded-xl bg-white border text-[15px] text-foreground placeholder:text-foreground/30 outline-none transition-all duration-200
                    focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8
                    ${form.formState.errors.email ? "border-red-400 focus:border-red-400" : "border-border"}`}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-[12px] text-red-500 mt-0.5">{form.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-foreground/60 tracking-wide">
                  Qual sua senha?
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full h-12 px-4 pr-12 rounded-xl bg-white border text-[15px] text-foreground placeholder:text-foreground/30 outline-none transition-all duration-200
                      focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8
                      ${form.formState.errors.password ? "border-red-400 focus:border-red-400" : "border-border"}`}
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-[12px] text-red-500 mt-0.5">{form.formState.errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="mt-2 w-full h-12 rounded-xl bg-foreground text-background text-[15px] font-semibold flex items-center justify-center gap-2 hover:opacity-80 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loginMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Acessar
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[12px] text-foreground/30 font-medium">ou</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Link to onboarding */}
            <p className="text-center text-[14px] text-foreground/50">
              Ainda não tem conta?{" "}
              <Link href="/onboarding">
                <span className="text-foreground font-semibold hover:opacity-60 transition-opacity cursor-pointer">
                  Meu Primeiro Login
                </span>
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
