// backend/tests/calculations.test.ts
import { PricingCalculator } from '../src/utils/calculations';

describe('PricingCalculator', () => {
  describe('calculateTechnicalHour', () => {
    it('should calculate technical hour correctly', () => {
      const result = PricingCalculator.calculateTechnicalHour(5000, 2000, 160);
      expect(result).toBe(43.75);
    });

    it('should handle zero productive hours', () => {
      expect(() => {
        PricingCalculator.calculateTechnicalHour(5000, 2000, 0);
      }).toThrow();
    });

    it('should handle negative values gracefully', () => {
      const result = PricingCalculator.calculateTechnicalHour(5000, 2000, 160);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('calculateValueWithTaxes', () => {
    it('should apply tax rate correctly', () => {
      const result = PricingCalculator.calculateValueWithTaxes(100, 10);
      expect(result).toBe(110);
    });

    it('should handle zero tax rate', () => {
      const result = PricingCalculator.calculateValueWithTaxes(100, 0);
      expect(result).toBe(100);
    });

    it('should handle high tax rates', () => {
      const result = PricingCalculator.calculateValueWithTaxes(100, 50);
      expect(result).toBe(150);
    });
  });

  describe('calculateBaseValue', () => {
    it('should multiply technical hour by estimated hours', () => {
      const result = PricingCalculator.calculateBaseValue(50, 40);
      expect(result).toBe(2000);
    });

    it('should handle fractional hours', () => {
      const result = PricingCalculator.calculateBaseValue(50, 40.5);
      expect(result).toBe(2025);
    });
  });

  describe('calculateWithAdjustments', () => {
    it('should apply all adjustments correctly', () => {
      const result = PricingCalculator.calculateWithAdjustments(1000, 10, 5, 0);
      expect(result).toBeCloseTo(1155, 2);
    });

    it('should handle zero adjustments', () => {
      const result = PricingCalculator.calculateWithAdjustments(1000, 0, 0, 0);
      expect(result).toBe(1000);
    });

    it('should compound adjustments multiplicatively', () => {
      const result = PricingCalculator.calculateWithAdjustments(1000, 10, 10, 10);
      expect(result).toBeCloseTo(1331, 2);
    });
  });

  describe('calculateWithVolumeDiscount', () => {
    it('should apply volume discount correctly', () => {
      const result = PricingCalculator.calculateWithVolumeDiscount(1000, 10);
      expect(result).toBe(900);
    });

    it('should handle zero discount', () => {
      const result = PricingCalculator.calculateWithVolumeDiscount(1000, 0);
      expect(result).toBe(1000);
    });

    it('should handle 100% discount', () => {
      const result = PricingCalculator.calculateWithVolumeDiscount(1000, 100);
      expect(result).toBe(0);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total with general discount and displacement fee', () => {
      const result = PricingCalculator.calculateTotal(1000, 100, 50);
      expect(result).toBe(950);
    });

    it('should handle zero values', () => {
      const result = PricingCalculator.calculateTotal(1000, 0, 0);
      expect(result).toBe(1000);
    });
  });

  describe('calculateProposalItem', () => {
    it('should perform complete calculation correctly', () => {
      const result = PricingCalculator.calculateProposalItem({
        basePrice: 5000,
        estimatedHours: 40,
        taxRate: 6.0,
        adjustmentPersonalization: 10,
        adjustmentRisk: 5,
        adjustmentSeniority: 0,
        volumeDiscount: 5
      });

      expect(result).toHaveProperty('technicalHour');
      expect(result).toHaveProperty('valueWithTaxes');
      expect(result).toHaveProperty('baseValue');
      expect(result).toHaveProperty('adjustedValue');
      expect(result).toHaveProperty('discountedValue');
      
      expect(result.technicalHour).toBeGreaterThan(0);
      expect(result.discountedValue).toBeGreaterThan(0);
    });

    it('should handle minimal configuration', () => {
      const result = PricingCalculator.calculateProposalItem({
        basePrice: 1000,
        estimatedHours: 10,
        taxRate: 0,
        adjustmentPersonalization: 0,
        adjustmentRisk: 0,
        adjustmentSeniority: 0,
        volumeDiscount: 0
      });

      expect(result.discountedValue).toBeGreaterThan(0);
    });
  });

  describe('getTaxRateByRegime', () => {
    const taxRates = {
      taxRateMEI: 3.5,
      taxRateSimples: 6.0,
      taxRateLucroPresumido: 8.0,
      taxRateAutonomo: 11.0
    };

    it('should return correct tax rate for MEI', () => {
      const result = PricingCalculator.getTaxRateByRegime('MEI', taxRates);
      expect(result).toBe(3.5);
    });

    it('should return correct tax rate for Simples Nacional', () => {
      const result = PricingCalculator.getTaxRateByRegime('Simples Nacional', taxRates);
      expect(result).toBe(6.0);
    });

    it('should return correct tax rate for Lucro Presumido', () => {
      const result = PricingCalculator.getTaxRateByRegime('Lucro Presumido', taxRates);
      expect(result).toBe(8.0);
    });

    it('should return correct tax rate for Autônomo', () => {
      const result = PricingCalculator.getTaxRateByRegime('Autônomo', taxRates);
      expect(result).toBe(11.0);
    });

    it('should return 0 for unknown regime', () => {
      const result = PricingCalculator.getTaxRateByRegime('Unknown', taxRates);
      expect(result).toBe(0);
    });
  });
});
