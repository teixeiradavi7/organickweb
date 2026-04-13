/**
 * Urgency Classification System
 * Maps each plant type to urgency level and diagnostic content
 */

export type PlantType = "broto-promissor" | "broto-risco" | "planta-tracao" | "tracao-instavel" | "planta-escalavel" | "gigante-exausta";
export type UrgencyLevel = "muito_baixa" | "baixa" | "moderada" | "alta" | "muito_alta";

export interface UrgencyClassification {
  plantType: PlantType;
  label: string;
  urgencyLevel: UrgencyLevel;
  urgencyLabel: string;
  urgencyColor: string;
  positivos: string[];
  negativos: string[];
  resumo: string;
}

export function getUrgencyClassification(plantType: PlantType, agencyName: string = "sua agência"): UrgencyClassification {
  const classifications: Record<PlantType, Omit<UrgencyClassification, "resumo">> = {
    "broto-promissor": {
      plantType: "broto-promissor",
      label: "Broto Promissor",
      urgencyLevel: "moderada",
      urgencyLabel: "Moderada",
      urgencyColor: "oklch(0.65 0.18 145)",
      positivos: [
        "Pequena, mas saudável",
        "Estágio coerente",
        "Boa base de crescimento",
      ],
      negativos: [
        "Pouco volume",
        "Pouca margem para erro",
        "Possível dependência do fundador",
      ],
    },
    "broto-risco": {
      plantType: "broto-risco",
      label: "Broto em Risco",
      urgencyLevel: "muito_alta",
      urgencyLabel: "Muito Alta",
      urgencyColor: "oklch(0.7 0.2 30)",
      positivos: [
        "Ainda é fácil corrigir",
        "Baixa complexidade",
        "Ainda dá tempo de reorganizar",
      ],
      negativos: [
        "Base frágil",
        "Baixa tração",
        "Estrutura instável",
      ],
    },
    "planta-tracao": {
      plantType: "planta-tracao",
      label: "Planta em Tração",
      urgencyLevel: "baixa",
      urgencyLabel: "Baixa",
      urgencyColor: "oklch(0.6 0.15 250)",
      positivos: [
        "Crescimento real",
        "Equilíbrio entre clientes, faturamento e estrutura",
        "Tração saudável",
      ],
      negativos: [
        "Ainda não está totalmente consolidada",
        "Precisa de processos mais fortes para a próxima fase",
      ],
    },
    "tracao-instavel": {
      plantType: "tracao-instavel",
      label: "Tração Instável",
      urgencyLevel: "alta",
      urgencyLabel: "Alta",
      urgencyColor: "oklch(0.65 0.18 60)",
      positivos: [
        "Já tem tração",
        "Crescimento real de mercado",
        "Ainda pode se reorganizar",
      ],
      negativos: [
        "O crescimento passou da saúde",
        "Sobrecarga",
        "Instabilidade",
      ],
    },
    "planta-escalavel": {
      plantType: "planta-escalavel",
      label: "Planta Escalável",
      urgencyLevel: "muito_baixa",
      urgencyLabel: "Muito Baixa",
      urgencyColor: "oklch(0.7 0.2 120)",
      positivos: [
        "Porte forte",
        "Operação saudável",
        "Pronta para expansão sustentável",
      ],
      negativos: [
        "Exige disciplina",
        "A complexidade é maior neste estágio",
      ],
    },
    "gigante-exausta": {
      plantType: "gigante-exausta",
      label: "Gigante Exausta",
      urgencyLevel: "alta",
      urgencyLabel: "Alta",
      urgencyColor: "oklch(0.6 0.15 30)",
      positivos: [
        "Escala real",
        "Força comercial",
        "Grande potencial de recuperação",
      ],
      negativos: [
        "Estrutura cansada",
        "Ineficiência",
        "Crescimento pouco saudável",
      ],
    },
  };

  const classification = classifications[plantType];
  const resumoTemplates: Record<PlantType, string> = {
    "broto-promissor": `${agencyName} é pequena, mas saudável, com bom potencial de crescimento.`,
    "broto-risco": `${agencyName} está em estágio inicial e já mostra fragilidades importantes.`,
    "planta-tracao": `${agencyName} está crescendo bem, mas agora precisa de mais estrutura.`,
    "tracao-instavel": `${agencyName} está crescendo, mas de forma instável.`,
    "planta-escalavel": `${agencyName} é forte, saudável e escalável.`,
    "gigante-exausta": `${agencyName} tem escala, mas mostra sinais de desgaste.`,
  };

  return {
    ...classification,
    resumo: resumoTemplates[plantType],
  };
}

export function getUrgencyColor(urgencyLevel: UrgencyLevel): string {
  const colorMap: Record<UrgencyLevel, string> = {
    muito_baixa: "oklch(0.7 0.2 120)",
    baixa: "oklch(0.6 0.15 250)",
    moderada: "oklch(0.65 0.18 145)",
    alta: "oklch(0.65 0.18 60)",
    muito_alta: "oklch(0.7 0.2 30)",
  };
  return colorMap[urgencyLevel];
}

export function getUrgencyBadgeLabel(urgencyLevel: UrgencyLevel): string {
  const labelMap: Record<UrgencyLevel, string> = {
    muito_baixa: "Muito Baixa",
    baixa: "Baixa",
    moderada: "Moderada",
    alta: "Alta",
    muito_alta: "Muito Alta",
  };
  return labelMap[urgencyLevel];
}
