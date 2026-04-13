import Navbar from "@/components/Navbar";

const values = [
  {
    title: "Método",
    description:
      "Cada passo do programa é construído com intencionalidade. Acreditamos que os detalhes separam o bom do extraordinário.",
  },
  {
    title: "Simplicidade",
    description:
      "Complexidade é fácil. Simplicidade é difícil. Trabalhamos para remover o desnecessário para que o necessário possa falar.",
  },
  {
    title: "Resultado",
    description:
      "Construímos para o longo prazo. Agências que crescem de forma saudável, sustentável e que nunca param de evoluir.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-foreground/40 mb-4 animate-fade-in-up">
            Sobre nós
          </p>
          <h1
            className="text-display text-foreground animate-fade-in-up animate-delay-100"
          >
            Feito para quem
            <br />
            quer crescer.
          </h1>
          <p className="text-subhead mt-6 max-w-xl mx-auto animate-fade-in-up animate-delay-200">
            O Programa Organick é para donos de agências que querem estruturar,
            escalar e transformar seus negócios com método e acompanhamento.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="h-px bg-border" />
      </div>

      {/* Values */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-foreground/40 mb-12">
            Nossos valores
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <div
                key={v.title}
                className={`animate-fade-in-up animate-delay-${(i + 1) * 100}`}
              >
                <h3 className="text-[20px] font-semibold tracking-tight text-foreground mb-3">
                  {v.title}
                </h3>
                <p className="text-[15px] text-foreground/55 leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="h-px bg-border" />
      </div>

      {/* Mission statement */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <blockquote className="text-[clamp(1.4rem,2.5vw,2rem)] font-medium tracking-tight text-foreground leading-snug">
            "O objetivo sempre foi o mesmo: criar algo que funcione, que dure e
            que faça as pessoas sentirem que estão no caminho certo."
          </blockquote>
          <p className="mt-6 text-[14px] text-foreground/40 font-medium">
            — Equipe Organick
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663539164565/SCcHJ9kMbHptCUSEK4niWe/logo-organick_9080e848.png"
            alt="Organick"
            className="h-7 w-auto"
          />
          <p className="text-[13px] text-foreground/40">
            © {new Date().getFullYear()} Organick. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
