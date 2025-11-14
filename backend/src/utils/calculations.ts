// backend/src/utils/calculations.ts
import Decimal from 'decimal.js';

export interface PricingInput {
  fixedCosts: number;
  proLabor: number;
  productiveHours: number;
  estimatedHours: number;
  adjustmentPersonalization: number;
  adjustmentRisk: number;
  adjustmentSeniority: number;
  volumeDiscount: number;
  discountGeneral: number;
  displacementFee: number;
  taxRateByRegime: number;
}

export class PricingCalculator {
  /**
   * Calcula a hora técnica
   * Formula: (Custos Fixos + Pró-labore) / Horas Produtivas
   */
  static calculateTechnicalHour(
    fixedCosts: number,
    proLabor: number,
    productiveHours: number
  ): number {
    const result = new Decimal(fixedCosts)
      .plus(new Decimal(proLabor))
      .dividedBy(new Decimal(productiveHours));
    return result.toNumber();
  }

  /**
   * Calcula valor com impostos
   * Formula: Hora Técnica × (1 + Taxa Tributária)
   */
  static calculateValueWithTaxes(
    technicalHour: number,
    taxRate: number
  ): number {
    const result = new Decimal(technicalHour)
      .times(new Decimal(1).plus(new Decimal(taxRate).dividedBy(100)));
    return result.toNumber();
  }

  /**
   * Calcula valor base
   * Formula: Hora Técnica × Horas Estimadas
   */
  static calculateBaseValue(
    technicalHour: number,
    estimatedHours: number
  ): number {
    const result = new Decimal(technicalHour).times(new Decimal(estimatedHours));
    return result.toNumber();
  }

  /**
   * Calcula valor com ajustes
   * Formula: Valor Base × (1 + Personalização) × (1 + Risco) × (1 + Senioridade)
   */
  static calculateWithAdjustments(
    baseValue: number,
    personalization: number,
    risk: number,
    seniority: number
  ): number {
    const result = new Decimal(baseValue)
      .times(new Decimal(1).plus(new Decimal(personalization).dividedBy(100)))
      .times(new Decimal(1).plus(new Decimal(risk).dividedBy(100)))
      .times(new Decimal(1).plus(new Decimal(seniority).dividedBy(100)));
    return result.toNumber();
  }

  /**
   * Calcula valor com desconto de volume
   * Formula: Com Ajustes × (1 - Desconto por Volume)
   */
  static calculateWithVolumeDiscount(
    adjustedValue: number,
    volumeDiscount: number
  ): number {
    const result = new Decimal(adjustedValue)
      .times(new Decimal(1).minus(new Decimal(volumeDiscount).dividedBy(100)));
    return result.toNumber();
  }

  /**
   * Calcula valor total da proposta
   * Formula: Com Desconto - Desconto Geral + Taxa Deslocamento
   */
  static calculateTotal(
    discountedValue: number,
    generalDiscount: number,
    displacementFee: number
  ): number {
    const result = new Decimal(discountedValue)
      .minus(new Decimal(generalDiscount))
      .plus(new Decimal(displacementFee));
    return result.toNumber();
  }

  /**
   * Realiza cálculo completo de item de proposta
   */
  static calculateProposalItem(input: {
    basePrice: number;
    estimatedHours: number;
    taxRate: number;
    adjustmentPersonalization: number;
    adjustmentRisk: number;
    adjustmentSeniority: number;
    volumeDiscount: number;
  }): {
    technicalHour: number;
    valueWithTaxes: number;
    baseValue: number;
    adjustedValue: number;
    discountedValue: number;
  } {
    const technicalHour = this.calculateTechnicalHour(
      input.basePrice,
      input.basePrice * 0.2,
      160
    );

    const valueWithTaxes = this.calculateValueWithTaxes(technicalHour, input.taxRate);
    const baseValue = this.calculateBaseValue(valueWithTaxes, input.estimatedHours);
    const adjustedValue = this.calculateWithAdjustments(
      baseValue,
      input.adjustmentPersonalization,
      input.adjustmentRisk,
      input.adjustmentSeniority
    );
    const discountedValue = this.calculateWithVolumeDiscount(
      adjustedValue,
      input.volumeDiscount
    );

    return {
      technicalHour,
      valueWithTaxes,
      baseValue,
      adjustedValue,
      discountedValue
    };
  }

  /**
   * Calcula taxa de imposto baseado no regime tributário
   */
  static getTaxRateByRegime(
    regime: string,
    taxRates: Record<string, number>
  ): number {
    const rateMap: Record<string, string> = {
      'MEI': 'taxRateMEI',
      'Simples Nacional': 'taxRateSimples',
      'Lucro Presumido': 'taxRateLucroPresumido',
      'Autônomo': 'taxRateAutonomo'
    };

    const key = rateMap[regime];
    return key ? taxRates[key] : 0;
  }
}

export default PricingCalculator;
