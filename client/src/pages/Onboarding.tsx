import { useState } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { ChevronRight, ChevronLeft, Loader2, Sprout, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

// ─── Step definitions ────────────────────────────────────────────────────────

interface StepOption {
  id: string;
  label: string;
}

interface Step {
  id: string;
  title: string;
  type: "text" | "password" | "number" | "currency" | "single-choice";
  placeholder?: string;
  options?: StepOption[];
}

const STEPS: Step[] = [
  {
    id: "email",
    title: "Qual o seu email?",
    type: "text",
    placeholder: "seu@email.com",
  },
  {
    id: "password",
    title: "Crie uma senha",
    type: "password",
    placeholder: "Mínimo 8 caracteres",
  },
  {
    id: "agencyName",
    title: "Qual o nome da sua agência?",
    type: "text",
    placeholder: "Nome da sua agência",
  },
  {
    id: "agencyAge",
    title: "Há quanto tempo você tem sua agência?",
    type: "single-choice",
    options: [
      { id: "less_3m", label: "Menos de 3 meses" },
      { id: "3_to_6m", label: "Entre 3 e 6 meses" },
      { id: "6m_to_1y", label: "Entre 6 meses e 1 ano" },
      { id: "more_1y", label: "Mais de 1 ano" },
    ],
  },
  {
    id: "agencySize",
    title: "Quantas pessoas trabalham na sua agência?",
    type: "single-choice",
    options: [
      { id: "solo", label: "Somente eu" },
      { id: "2_to_5", label: "De 2 a 5 pessoas" },
      { id: "6_to_12", label: "De 6 a 12 pessoas" },
      { id: "more_12", label: "Mais de 12 pessoas" },
    ],
  },
  {
    id: "clientCount",
    title: "Quantos clientes sua agência já atende?",
    type: "number",
    placeholder: "Ex: 10",
  },
  {
    id: "monthlyRevenue",
    title: "Qual o seu faturamento médio mensal da sua agência?",
    type: "currency",
    placeholder: "Ex: 15000",
  },
  {
    id: "onboardingCallTime",
    title: "Qual o melhor horário para sua call de onboarding?",
    type: "single-choice",
    options: [
      { id: "monday_15", label: "Segunda-feira, 15h às 16h" },
      { id: "thursday_18", label: "Quinta-feira, 18h30 às 19h30" },
    ],
  },
];

// ─── Empty Pot SVG Component ──────────────────────────────────────────────────

function EmptyPot() {
  return (
    <svg
      viewBox="0 0 200 240"
      className="w-full h-full max-w-xs mx-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 50 80 L 60 180 Q 60 200 80 200 L 120 200 Q 140 200 140 180 L 150 80 Z"
        stroke="oklch(0.13 0 0)"
        strokeWidth="2"
        fill="none"
      />
      <ellipse cx="100" cy="80" rx="50" ry="12" stroke="oklch(0.13 0 0)" strokeWidth="2" fill="none" />
      <ellipse cx="100" cy="185" rx="38" ry="8" fill="oklch(0.55 0 0)" opacity="0.4" />
      <path
        d="M 65 185 Q 100 190 135 185"
        stroke="oklch(0.55 0 0)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.3"
      />
      <line x1="70" y1="100" x2="68" y2="160" stroke="oklch(0.13 0 0)" strokeWidth="0.5" opacity="0.2" />
      <line x1="100" y1="85" x2="98" y2="195" stroke="oklch(0.13 0 0)" strokeWidth="0.5" opacity="0.2" />
      <line x1="130" y1="100" x2="132" y2="160" stroke="oklch(0.13 0 0)" strokeWidth="0.5" opacity="0.2" />
    </svg>
  );
}

// ─── Format currency ──────────────────────────────────────────────────────────

function formatCurrency(value: string): string {
  const num = value.replace(/\D/g, "");
  if (!num) return "";
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(num));
  return formatted;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Onboarding() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const utils = trpc.useUtils();

  const step = STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;
  const currentValue = answers[step.id] ?? "";

  // Validation
  const isStepValid = (): boolean => {
    if (!currentValue) return false;
    if (step.id === "email") {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentValue);
    }
    if (step.id === "password") {
      return currentValue.length >= 8;
    }
    return true;
  };

  const handleTextChange = (value: string) => {
    if (step.type === "currency") {
      // Store raw number, display formatted
      const raw = value.replace(/\D/g, "");
      setAnswers((prev) => ({ ...prev, [step.id]: raw }));
    } else {
      setAnswers((prev) => ({ ...prev, [step.id]: value }));
    }
  };

  const handleSelectOption = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [step.id]: optionId }));
  };

  // Register mutation
  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Falha ao criar conta. Tente novamente.");
      setIsSubmitting(false);
    },
  });

  // Complete onboarding mutation
  const completeOnboardingMutation = trpc.members.completeOnboarding.useMutation({
    onSuccess: () => {
      setShowCompletion(true);
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    },
    onError: (err) => {
      toast.error(err.message || "Falha ao completar cadastro.");
      setIsSubmitting(false);
    },
  });

  const handleNext = () => {
    if (!isStepValid()) return;

    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Step 1: Create account
      await registerMutation.mutateAsync({
        email: answers.email,
        password: answers.password,
        name: answers.agencyName || answers.email.split("@")[0],
      });

      // Step 2: Save onboarding data and complete
      const surveyAnswers: Record<string, string> = {};
      for (const s of STEPS) {
        if (s.id !== "email" && s.id !== "password") {
          surveyAnswers[s.id] = answers[s.id] || "";
        }
      }

      await completeOnboardingMutation.mutateAsync({ answers: surveyAnswers });
    } catch {
      // Errors handled by mutation callbacks
    }
  };

  // Handle Enter key for text inputs
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isStepValid()) {
      e.preventDefault();
      handleNext();
    }
  };

  // ─── Completion Screen ──────────────────────────────────────────────────────

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-6">
            <Sprout size={28} className="text-foreground" />
          </div>
          <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-foreground/40 mb-4">
            Quase lá
          </p>
          <h1 className="text-headline text-foreground mb-4">
            Sua agência está ganhando vida.
          </h1>
          <p className="text-subhead mb-8">
            Estamos preparando sua experiência personalizada. Você será redirecionado em instantes.
          </p>
          <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // ─── Main Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 animate-fade-in-up">
            <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-foreground/40 mb-3">
              Primeiro acesso
            </p>
            <h1 className="text-headline text-foreground">
              Vamos começar.
            </h1>
            <p className="text-subhead mt-2">
              Passo {currentStep + 1} de {STEPS.length}
            </p>
          </div>

          {/* Main layout: Question on left, Pot on right */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left: Question */}
            <div className="animate-fade-in-up animate-delay-100">
              {/* Question title */}
              <div className="mb-8">
                <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
                  {step.title}
                </h2>
              </div>

              {/* Input area */}
              <div className="mb-8">
                {step.type === "single-choice" && step.options ? (
                  /* Option cards */
                  <div className="flex flex-col gap-3">
                    {step.options.map((option) => {
                      const isSelected = currentValue === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleSelectOption(option.id)}
                          className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                            isSelected
                              ? "border-foreground bg-foreground/5 shadow-sm"
                              : "border-border hover:border-foreground/30 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-[15px] font-semibold text-foreground">
                              {option.label}
                            </p>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center shrink-0 ml-3">
                                <svg
                                  className="w-3 h-3 text-background"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : step.type === "password" ? (
                  /* Password field */
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentValue}
                      onChange={(e) => handleTextChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={step.placeholder}
                      autoFocus
                      className="w-full h-14 px-5 pr-12 rounded-2xl bg-white border-2 border-border text-[16px] text-foreground placeholder:text-foreground/30 outline-none transition-all duration-200 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                ) : step.type === "currency" ? (
                  /* Currency field */
                  <div>
                    <input
                      type="text"
                      value={currentValue ? formatCurrency(currentValue) : ""}
                      onChange={(e) => handleTextChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="R$ 0"
                      autoFocus
                      className="w-full h-14 px-5 rounded-2xl bg-white border-2 border-border text-[16px] text-foreground placeholder:text-foreground/30 outline-none transition-all duration-200 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8"
                    />
                    <p className="text-[12px] text-foreground/40 mt-2">
                      Informe o valor em reais (R$)
                    </p>
                  </div>
                ) : step.type === "number" ? (
                  /* Number field */
                  <input
                    type="number"
                    value={currentValue}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={step.placeholder}
                    autoFocus
                    min="0"
                    className="w-full h-14 px-5 rounded-2xl bg-white border-2 border-border text-[16px] text-foreground placeholder:text-foreground/30 outline-none transition-all duration-200 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8"
                  />
                ) : (
                  /* Text / email field */
                  <input
                    type={step.id === "email" ? "email" : "text"}
                    value={currentValue}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={step.placeholder}
                    autoFocus
                    className="w-full h-14 px-5 rounded-2xl bg-white border-2 border-border text-[16px] text-foreground placeholder:text-foreground/30 outline-none transition-all duration-200 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8"
                  />
                )}

                {/* Validation hints */}
                {step.id === "password" && currentValue && currentValue.length < 8 && (
                  <p className="text-[12px] text-red-500 mt-2">
                    A senha deve ter pelo menos 8 caracteres
                  </p>
                )}
                {step.id === "email" && currentValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentValue) && (
                  <p className="text-[12px] text-red-500 mt-2">
                    Por favor, insira um email válido
                  </p>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3">
                {!isFirstStep && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1 px-6 h-12 rounded-xl border border-border text-[14px] font-medium text-foreground/70 hover:bg-neutral-50 active:scale-[0.98] transition-all"
                  >
                    <ChevronLeft size={16} />
                    Voltar
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!isStepValid() || isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-foreground text-background text-[14px] font-semibold flex items-center justify-center gap-2 hover:opacity-80 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Criando sua conta...
                    </>
                  ) : isLastStep ? (
                    <>
                      <Sprout size={16} />
                      Dar vida à minha agência
                    </>
                  ) : (
                    <>
                      Próximo
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>

              {/* Progress indicator */}
              <div className="mt-8 flex gap-1">
                {STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      idx < currentStep
                        ? "bg-foreground"
                        : idx === currentStep
                          ? "bg-foreground/60"
                          : "bg-border"
                    }`}
                  />
                ))}
              </div>

              {/* Link to login */}
              <p className="text-center text-[13px] text-foreground/40 mt-8">
                Já tem uma conta?{" "}
                <Link href="/login">
                  <span className="text-foreground font-semibold hover:opacity-60 transition-opacity cursor-pointer">
                    Entrar
                  </span>
                </Link>
              </p>
            </div>

            {/* Right: Empty Pot Visual */}
            <div className="hidden lg:flex flex-col items-center justify-center animate-fade-in-up animate-delay-200">
              <div className="w-64 h-80 flex items-center justify-center">
                <EmptyPot />
              </div>
              <p className="text-[13px] text-foreground/40 text-center mt-6">
                Sua agência está prestes a ganhar vida.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
