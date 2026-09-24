import React, { useState } from 'react';
import { Check, Zap, ShieldAlert, Cpu, Award, Sparkles, Building2, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Pricing() {
  const [selectedPlanModal, setSelectedPlanModal] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      tagline: 'Essential predictive monitoring for small workshop floors',
      priceMonthly: '₹5,000',
      priceAnnual: '₹4,200',
      period: '/ month',
      machineLimit: 'Up to 10 Machines',
      badge: 'Starter',
      badgeStyle: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      buttonText: 'Select Basic Plan',
      buttonStyle: 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white',
      features: [
        'Up to 10 Monitored Machines',
        'Real-time Sensor Telemetry (Temp, Vib, Press)',
        'Basic Control Center Dashboard',
        'Machine Risk & Status Alerts',
        'Standard Email Notifications',
        'Edge / Offline Mode Capabilities'
      ],
      notIncluded: [
        'AI Incident Root Cause Investigation',
        'Cost-Impact & Loss Estimations',
        'What-If Operational Simulator',
        'Custom ERP / PLC Integrations'
      ]
    },
    {
      id: 'standard',
      name: 'Standard Plan',
      tagline: 'Comprehensive Industry 4.0 suite for growing manufacturing plants',
      priceMonthly: '₹20,000',
      priceAnnual: '₹17,000',
      period: '/ month',
      machineLimit: 'Up to 50 Machines',
      popular: true,
      badge: 'Most Popular / Recommended',
      badgeStyle: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      buttonText: 'Start Standard Plan Demo',
      buttonStyle: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30',
      features: [
        'Up to 50 Monitored Machines',
        'Everything in Basic Plan',
        '🔎 AI Incident Investigation Engine',
        '💰 Estimated Production Loss & Cost Impact',
        'Historical Telemetry & Trend Analytics',
        'Automated Maintenance Work Orders',
        '2D Digital Twin Floor Visualizer',
        'Full Offline Edge Processing Sync'
      ],
      notIncluded: [
        'Dedicated On-Premise Hardware Integration',
        'Custom ML Model Retraining'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      tagline: 'Tailored edge AI infrastructure for large multi-site industrial plants',
      priceMonthly: 'Custom Pricing',
      priceAnnual: 'Custom Pricing',
      period: '',
      machineLimit: '50+ Machines (Unlimited)',
      customizable: true,
      badge: 'Custom Integration',
      badgeStyle: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      buttonText: 'Contact Enterprise Team',
      buttonStyle: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30',
      features: [
        'Unlimited Machines & Multi-Factory Sites',
        'Everything in Standard Plan',
        'Custom PLC / SCADA / IoT Sensor Integrations',
        'On-Premise ML Risk Model Training',
        'What-If Operational Simulator Engine',
        'Dedicated 24/7 Technical Support & SLA',
        'Custom ERP & Maintenance System Connectors',
        'Customized Security & Role-Based Control'
      ],
      notIncluded: []
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16 text-slate-900 dark:text-white">
      
      {/* Top Banner & Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SaaS Monetization Business Model</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Factory Subscription & Package Pricing
        </h1>
        
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Flexible, scalable SaaS tiers designed for Industry 4.0 predictive maintenance, from single assembly lines to enterprise multi-plant operations.
        </p>

        {/* Demo Disclaimer Alert Box */}
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-800 dark:text-amber-300 text-xs font-medium text-center space-y-0.5 shadow-sm max-w-2xl mx-auto">
          <div className="font-bold flex items-center justify-center space-x-1">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>DEMO / EXAMPLE PRICING NOTICE</span>
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400">
            Note: These price points and features represent our proposed SaaS monetization business model for demonstration purposes only. They are not live commercial rates.
          </p>
        </div>
      </div>

      {/* Monthly / Annual Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-1 rounded-2xl flex items-center space-x-1 text-xs font-bold shadow-inner">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-xl transition ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-1.5 ${
              billingCycle === 'annual'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500 text-white rounded-md font-bold uppercase">Save 15%</span>
          </button>
        </div>
      </div>

      {/* 3 SaaS Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
        {plans.map((plan) => {
          const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between p-6 bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-200 shadow-sm hover:shadow-xl ${
                plan.popular
                  ? 'border-indigo-500 dark:border-indigo-500/80 ring-2 ring-indigo-500/20 scale-102'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Card Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${plan.badgeStyle}`}>
                  {plan.badge}
                </span>
                <span className="text-xs font-mono text-slate-400 font-semibold">{plan.machineLimit}</span>
              </div>

              {/* Title & Price */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[36px]">{plan.tagline}</p>
                
                <div className="py-2 border-y border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">{price}</span>
                    {plan.period && <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{plan.period}</span>}
                  </div>
                  {billingCycle === 'annual' && plan.period && (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      Billed annually (₹{(parseInt(price.replace(/[^\d]/g, '')) * 12).toLocaleString()}/yr)
                    </div>
                  )}
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 my-6 flex-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Included Features</div>
                <ul className="space-y-2 text-xs">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start space-x-2 text-slate-700 dark:text-slate-200">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {plan.notIncluded.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <ul className="space-y-1.5 text-[11px] text-slate-400">
                      {plan.notIncluded.map((feat, i) => (
                        <li key={i} className="flex items-center space-x-2 line-through opacity-60">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => setSelectedPlanModal(plan)}
                className={`w-full py-3 px-4 text-xs font-bold rounded-2xl transition flex items-center justify-center space-x-2 active:scale-95 ${plan.buttonStyle}`}
              >
                <span>{plan.buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          );
        })}
      </div>

      {/* Enterprise Customization & ROI Value Proposition Box */}
      <div className="max-w-6xl mx-auto p-6 rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Need Custom Industry 4.0 Integration?</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
            We provide custom hardware sensor deployments, edge gateway installations, private cloud connectivity, and custom ML risk model training for industrial manufacturing facilities.
          </p>
        </div>

        <button
          onClick={() => setSelectedPlanModal(plans[2])}
          className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition shrink-0 whitespace-nowrap"
        >
          Request Custom Enterprise Quote
        </button>
      </div>

      {/* Subscription Selection Simulation Modal */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Selected Plan: {selectedPlanModal.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">SaaS Monetization Model Simulation</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span>Selected Tier:</span>
                <span className="text-indigo-600 dark:text-indigo-400">{selectedPlanModal.name}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Billing Period:</span>
                <span className="capitalize">{billingCycle} ({selectedPlanModal.machineLimit})</span>
              </div>
              <div className="flex justify-between font-mono font-bold text-sm text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Estimated Cost:</span>
                <span>{selectedPlanModal.priceMonthly}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] space-y-1">
              <div className="font-bold">Judge Demo Information:</div>
              <p>In a real deployment, selecting this plan provisions API credentials, provisions edge gateway licenses, and configures SMS/Email alert routing for factory engineers.</p>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedPlanModal(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
              >
                Close Demo Window
              </button>
              <button
                onClick={() => {
                  alert(`Demo Subscription Confirmed for ${selectedPlanModal.name}!`);
                  setSelectedPlanModal(null);
                }}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition"
              >
                Confirm SaaS Selection (Demo)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
