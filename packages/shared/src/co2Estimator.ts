import { FuelType, FuelEmissionsCalculation } from './types';
import { CO2_EMISSION_FACTORS } from './constants';
import { FuelEstimateResult } from './fuelEstimator';

export class Co2Estimator {
  /**
   * Calculates CO2 emissions and personal baseline savings based on fuel estimate, fuel type, and local price.
   */
  public static calculate(
    fuelResult: FuelEstimateResult,
    distanceKm: number,
    fuelType: FuelType = 'PETROL',
    fuelPricePerLitre: number = 100.0,
    baselineEfficiencyL100km: number = 8.5
  ): FuelEmissionsCalculation {
    const factor = CO2_EMISSION_FACTORS[fuelType] || 2.31;
    const safeDistance = Math.max(0.01, distanceKm);

    // Total CO2 emitted in kilograms
    const estimatedCo2Kg = Number((fuelResult.fuelUsedLitres * factor).toFixed(3));

    // CO2 grams per km (1 kg = 1000g)
    const co2GramsPerKm = Math.round((estimatedCo2Kg * 1000) / safeDistance);

    // Actual Trip Fuel Cost
    const fuelCost = Number((fuelResult.fuelUsedLitres * fuelPricePerLitre).toFixed(2));

    // Baseline calculation: what would this trip have cost at baseline efficiency?
    const baselineFuelLitres = Number(
      ((safeDistance * baselineEfficiencyL100km) / 100).toFixed(3)
    );

    // Fuel and Money saved (positive when driver drove better than baseline)
    const fuelDelta = baselineFuelLitres - fuelResult.fuelUsedLitres;
    const fuelSavedLitres = Number(Math.max(0, fuelDelta).toFixed(3));
    const moneySaved = Number(Math.max(0, fuelSavedLitres * fuelPricePerLitre).toFixed(2));
    const co2AvoidedKg = Number(Math.max(0, fuelSavedLitres * factor).toFixed(3));

    return {
      fuelUsedLitres: fuelResult.fuelUsedLitres,
      fuelEfficiencyL100km: fuelResult.fuelEfficiencyL100km,
      fuelEfficiencyKml: fuelResult.fuelEfficiencyKml,
      estimatedCo2Kg,
      co2GramsPerKm,
      fuelCost,
      baselineFuelLitres,
      fuelSavedLitres,
      moneySaved,
      co2AvoidedKg,
      confidence: fuelResult.confidence,
      estimatorVersion: fuelResult.estimatorVersion,
      isEstimated: fuelResult.isEstimated,
    };
  }
}
