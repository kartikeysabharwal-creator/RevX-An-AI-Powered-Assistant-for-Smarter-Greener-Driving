import { FuelType, FuelEmissionsCalculation } from './types';
import { FuelEstimateResult } from './fuelEstimator';
export declare class Co2Estimator {
    /**
     * Calculates CO2 emissions and personal baseline savings based on fuel estimate, fuel type, and local price.
     */
    static calculate(fuelResult: FuelEstimateResult, distanceKm: number, fuelType?: FuelType, fuelPricePerLitre?: number, baselineEfficiencyL100km?: number): FuelEmissionsCalculation;
}
