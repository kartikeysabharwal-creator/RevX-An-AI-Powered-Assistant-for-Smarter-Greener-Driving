import { runFullTripSimulation } from '../apps/api/src/simulators/run_simulation_cli';

if (require.main === module) {
  runFullTripSimulation('SMOOTH_ECO', true);
  runFullTripSimulation('AGGRESSIVE_SPEED', false);
}

export { runFullTripSimulation };
