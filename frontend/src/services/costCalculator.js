// Cost Calculator Service for Estimated Potential Production Loss & Financial Impact
// Formula: Estimated Production Loss = Downtime Hours × Production Rate (units/hr) × Value Per Unit (₹)

const STORAGE_KEY = 'factory_cost_assumptions';

const DEFAULT_ASSUMPTIONS = {
  production_rate: 100, // units per hour
  unit_value: 100,       // ₹ per unit
  warning_downtime_hrs: 2.0,
  critical_downtime_hrs: 4.0
};

export function getCostAssumptions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_ASSUMPTIONS;
  } catch (err) {
    return DEFAULT_ASSUMPTIONS;
  }
}

export function saveCostAssumptions(newAssumptions) {
  try {
    const updated = { ...getCostAssumptions(), ...newAssumptions };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save cost assumptions:', err);
    return getCostAssumptions();
  }
}

export function calculateMachineProductionLoss(machine, customDowntime = null) {
  const assumptions = getCostAssumptions();
  const status = machine?.status || 'Normal';

  let downtimeHrs = 0;
  if (customDowntime !== null) {
    downtimeHrs = customDowntime;
  } else if (status === 'Critical') {
    downtimeHrs = assumptions.critical_downtime_hrs;
  } else if (status === 'Warning') {
    downtimeHrs = assumptions.warning_downtime_hrs;
  } else {
    downtimeHrs = 0;
  }

  const rate = Number(assumptions.production_rate) || 100;
  const value = Number(assumptions.unit_value) || 100;
  const totalLoss = Math.round(downtimeHrs * rate * value);

  return {
    status,
    downtime_hrs: downtimeHrs,
    production_rate: rate,
    unit_value: value,
    total_loss: totalLoss,
    formatted_loss: `₹${totalLoss.toLocaleString()}`,
    disclaimer: 'Estimated value based on configured production and downtime assumptions.'
  };
}

export function calculateFleetTotalPotentialLoss(machines = []) {
  const assumptions = getCostAssumptions();
  let totalLoss = 0;
  let totalDowntime = 0;

  machines.forEach(m => {
    const res = calculateMachineProductionLoss(m);
    totalLoss += res.total_loss;
    totalDowntime += res.downtime_hrs;
  });

  return {
    total_loss: totalLoss,
    formatted_total_loss: `₹${totalLoss.toLocaleString()}`,
    total_downtime_hrs: Number(totalDowntime.toFixed(1)),
    assumptions
  };
}
