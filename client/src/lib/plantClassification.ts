/**
 * Plant classification system based on agency metrics.
 * Maps agency health/size to corresponding plant visuals.
 */

export type PlantType =
  | "broto-risco"
  | "broto-promissor"
  | "planta-tracao"
  | "tracao-instavel"
  | "planta-escalavel"
  | "gigante-exausta";

export interface PlantInfo {
  type: PlantType;
  label: string;
  description: string;
  imageUrl: string;
}

const PLANT_URLS = {
  "broto-risco": "https://d2xsxph8kpxj0f.cloudfront.net/310519663539164565/SCcHJ9kMbHptCUSEK4niWe/plant-broto-em-risco_cca043a2.png",
  "broto-promissor": "https://d2xsxph8kpxj0f.cloudfront.net/310519663539164565/SCcHJ9kMbHptCUSEK4niWe/plant-broto-promissor_18dc116c.png",
  "planta-tracao": "https://d2xsxph8kpxj0f.cloudfront.net/310519663539164565/SCcHJ9kMbHptCUSEK4niWe/plant-planta-em-tracao_ee5bd711.png",
  "tracao-instavel": "https://d2xsxph8kpxj0f.cloudfront.net/310519663539164565/SCcHJ9kMbHptCUSEK4niWe/plant-tracao-instavel_8a27bacb.png",
  "planta-escalavel": "https://d2xsxph8kpxj0f.cloudfront.net/310519663539164565/SCcHJ9kMbHptCUSEK4niWe/plant-planta-escalavel_b0470cc3.png",
  "gigante-exausta": "https://d2xsxph8kpxj0f.cloudfront.net/310519663539164565/SCcHJ9kMbHptCUSEK4niWe/plant-gigante-exausta_fd83838b.png",
};

/**
 * Classify agency based on size (team count) and health metrics.
 * Returns the appropriate plant type.
 */
export function classifyAgency(
  teamSize: number,
  clientCount: number,
  monthlyRevenue: number,
  agencyAge: string
): PlantType {
  // Broto em Risco: Very new, very small, struggling
  if (teamSize <= 1 && clientCount <= 2 && monthlyRevenue < 5000) {
    return "broto-risco";
  }

  // Broto Promissor: New but showing promise
  if (teamSize <= 2 && clientCount <= 5 && monthlyRevenue < 15000) {
    return "broto-promissor";
  }

  // Planta em Tração: Growing, gaining momentum
  if (teamSize <= 5 && clientCount <= 15 && monthlyRevenue < 50000) {
    return "planta-tracao";
  }

  // Tração Instável: Growing but inconsistent metrics
  if (teamSize <= 10 && clientCount <= 30) {
    return "tracao-instavel";
  }

  // Planta Escalável: Healthy growth, good metrics
  if (teamSize <= 20 && clientCount <= 50 && monthlyRevenue < 200000) {
    return "planta-escalavel";
  }

  // Gigante Exausta: Large but potentially overextended
  return "gigante-exausta";
}

/**
 * Get plant info (label, description, image URL) by type.
 */
export function getPlantInfo(plantType: PlantType): PlantInfo {
  const plantInfoMap: Record<PlantType, Omit<PlantInfo, "type">> = {
    "broto-risco": {
      label: "Broto em Risco",
      description: "Agência muito nova, precisa de cuidados especiais",
      imageUrl: PLANT_URLS["broto-risco"],
    },
    "broto-promissor": {
      label: "Broto Promissor",
      description: "Agência nova com potencial de crescimento",
      imageUrl: PLANT_URLS["broto-promissor"],
    },
    "planta-tracao": {
      label: "Planta em Tração",
      description: "Agência em crescimento, ganhando tração",
      imageUrl: PLANT_URLS["planta-tracao"],
    },
    "tracao-instavel": {
      label: "Tração Instável",
      description: "Agência crescendo mas com métricas inconsistentes",
      imageUrl: PLANT_URLS["tracao-instavel"],
    },
    "planta-escalavel": {
      label: "Planta Escalável",
      description: "Agência saudável com crescimento consistente",
      imageUrl: PLANT_URLS["planta-escalavel"],
    },
    "gigante-exausta": {
      label: "Gigante Exausta",
      description: "Agência grande, pode estar sobrecarregada",
      imageUrl: PLANT_URLS["gigante-exausta"],
    },
  };

  return {
    type: plantType,
    ...plantInfoMap[plantType],
  };
}
