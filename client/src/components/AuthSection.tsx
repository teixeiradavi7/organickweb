import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

// ─── Shared input style ───────────────────────────────────────────────────────

function InputField({
  label,
  error,
  type = "text",
  showToggle,
  onToggle,
  ...props
}: {
  label: string;
  error?: string;
  type?: string;
  showToggle?: boolean;
  onToggle?: () => void;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-foreground/60 tracking-wide uppercase">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          className={`w-full h-12 px-4 rounded-xl bg-white border text-[15px] text-foreground placeholder:text-foreground/30 outline-none transition-all duration-200
            focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8
            ${error ? "border-red-400 focus:border-red-400" : "border-border"}`}
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition-colors"
          >
            {type === "password" ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[12px] text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AuthSection() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  // Login mutation
  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      toast.success(`Welcome back, ${data.user?.name ?? "there"}!`);
      utils.auth.me.invalidate();
      navigate("/members");
    },
    onError: (err) => {
      toast.error(err.message || "Login failed. Please try again.");
    },
  });

  // Register mutation
  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: (data) => {
      toast.success(`Account created! Welcome, ${data.user?.name ?? "there"}!`);
      utils.auth.me.invalidate();
      navigate("/members");
    },
    onError: (err) => {
      toast.error(err.message || "Registration failed. Please try again.");
    },
  });

  // Login form
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Register form
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onLogin = (data: LoginForm) => loginMutation.mutate(data);
  const onRegister = (data: RegisterForm) =>
    registerMutation.mutate({ email: data.email, password: data.password, name: data.name });

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <section className="min-h-screen bg-background flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        {/* Section label */}
        <div className="text-center mb-12">
          <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-foreground/40 mb-3">
            {mode === "login" ? "Welcome back" : "Get started"}
          </p>
          <h2 className="text-headline text-foreground">
            {mode === "login" ? "Sign in." : "Create account."}
          </h2>
          <p className="text-subhead mt-2">
            {mode === "login"
              ? "Access your account securely."
              : "Join us — it only takes a moment."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-border shadow-sm shadow-black/5 p-8">
          {mode === "login" ? (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="flex flex-col gap-5">
              <InputField
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register("email")}
              />
              <InputField
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                showToggle
                onToggle={() => setShowPassword(!showPassword)}
                error={loginForm.formState.errors.password?.message}
                {...loginForm.register("password")}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full h-12 rounded-xl bg-foreground text-background text-[15px] font-semibold flex items-center justify-center gap-2 hover:opacity-80 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="flex flex-col gap-5">
              <InputField
                label="Full Name"
                type="text"
                placeholder="Jane Doe"
                error={registerForm.formState.errors.name?.message}
                {...registerForm.register("name")}
              />
              <InputField
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={registerForm.formState.errors.email?.message}
                {...registerForm.register("email")}
              />
              <InputField
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                showToggle
                onToggle={() => setShowPassword(!showPassword)}
                error={registerForm.formState.errors.password?.message}
                {...registerForm.register("password")}
              />
              <InputField
                label="Confirm Password"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat password"
                showToggle
                onToggle={() => setShowConfirm(!showConfirm)}
                error={registerForm.formState.errors.confirmPassword?.message}
                {...registerForm.register("confirmPassword")}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full h-12 rounded-xl bg-foreground text-background text-[15px] font-semibold flex items-center justify-center gap-2 hover:opacity-80 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[12px] text-foreground/30 font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Toggle mode */}
          <p className="text-center text-[14px] text-foreground/50">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setShowPassword(false);
                setShowConfirm(false);
              }}
              className="text-foreground font-semibold hover:opacity-60 transition-opacity"
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Privacy note */}
        <p className="text-center text-[12px] text-foreground/30 mt-6">
          By continuing, you agree to our{" "}
          <span className="underline cursor-pointer hover:text-foreground/50 transition-colors">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="underline cursor-pointer hover:text-foreground/50 transition-colors">
            Privacy Policy
          </span>
          .
        </p>
      </div>
    </section>
  );
}
