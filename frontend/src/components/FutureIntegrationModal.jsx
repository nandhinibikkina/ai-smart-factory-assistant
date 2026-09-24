import React from 'react';
import { X, Globe, Cpu, Radio, Cloud, Bot, Layers, Sparkles } from 'lucide-react';

export default function FutureIntegrationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 overflow-hidden text-slate-900 dark:text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl shadow-lg text-slate-950 font-bold">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold">India-Japan Smart Manufacturing Vision</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full">
                Industry 4.0 Prototype
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Affordable AI-based Smart Manufacturing inspired by Japanese automation, Kaizen (Continuous Improvement), and Monozukuri philosophy.
            </p>
          </div>
        </div>

        {/* Vision Statement Alert */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
          <span className="font-semibold text-amber-700 dark:text-amber-300">💡 Innovation Context: </span>
          Designed to provide MSME manufacturing plants with enterprise-grade predictive AI monitoring at fractional costs. Built on Japanese quality principles and scalable cloud-edge architecture.
        </div>

        {/* Future Integration Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Future Hardware & System Integration Roadmap
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start space-x-3">
              <Radio className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Real IoT Sensors (MQTT/OPC-UA)</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Direct integration with industrial vibration, thermal imaging, and current transducers.</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start space-x-3">
              <Cpu className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">PLC / SCADA Integration</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Bi-directional telemetry streaming with Siemens, Omron, and Mitsubishi PLCs.</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start space-x-3">
              <Bot className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Robotics & Cobot Telemetry</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Joint torque and axis vibration tracking for Fanuc, Yaskawa, and ABB robot arms.</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start space-x-3">
              <Cloud className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Cloud & Digital Twin Engine</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">AWS / Azure IoT Hub synchronization with 3D CAD digital twin models.</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start space-x-3">
              <Layers className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Advanced Predictive Maintenance</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Remaining Useful Life (RUL) estimation using Deep Learning LSTM models.</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start space-x-3">
              <Sparkles className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Multilingual Factory Assistant</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Native voice & text support for English, Hindi, Japanese (Kanji/Kana), and regional languages.</div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition"
          >
            Got it, Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
