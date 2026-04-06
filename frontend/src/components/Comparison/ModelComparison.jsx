import React, { useState } from 'react';
import { RiskBadge, BehaviorTag, ScoreBar, GuardrailBadge, Card } from '../ui/Badge';
import { ChevronDown, ChevronUp, Eye, Shield, Zap, BarChart3, MessageSquare } from 'lucide-react';

function ResponseCard({ response, index }) {
    const [expanded, setExpanded] = useState(false);
    const fullText = response.full_text || response.text || '';
    const isLong = fullText.length > 300;
    const displayText = expanded ? fullText : fullText.slice(0, 300);

    return (
        <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${
            response.guardrail_status === 'PASSED'
                ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white'
                : response.guardrail_status === 'WARNING'
                    ? 'border-amber-200 bg-gradient-to-br from-amber-50/50 to-white'
                    : 'border-red-200 bg-gradient-to-br from-red-50/50 to-white'
        }`}>
            {/* Response header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-white/50">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500">Response {index + 1}</span>
                    {response.is_refusal && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            🛡️ Proper Refusal
                        </span>
                    )}
                </div>
                <GuardrailBadge status={response.guardrail_status} />
            </div>

            {/* Response text - FULL TEXT visible */}
            <div className="px-4 py-3">
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {displayText}
                    {isLong && !expanded && '...'}
                </div>
                {isLong && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2 font-semibold transition-colors"
                    >
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {expanded ? 'Show Less' : `Show Full Response (${fullText.length} chars)`}
                    </button>
                )}
            </div>

            {/* Score and analysis */}
            <div className="px-4 py-3 border-t border-gray-100 space-y-2.5 bg-white/30">
                <ScoreBar score={response.safety_score} />

                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Risk Level</span>
                    <RiskBadge level={response.risk_level} />
                </div>

                {response.violations && response.violations.length > 0 && (
                    <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1.5">⚠️ Violations Detected:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {response.violations.map((v, i) => (
                                <span key={i} className="bg-red-100 text-red-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-red-200">
                                    {v}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <p className="text-xs text-gray-500 leading-relaxed pt-1 border-t border-gray-100">
                    {response.explanation}
                </p>
            </div>
        </div>
    );
}

export function ModelCard({ model }) {
    const safetyPct = ((1 - model.avg_safety_score) * 100).toFixed(0);
    const riskTendencyColors = {
        'Very Safe': 'text-emerald-600 bg-emerald-50',
        'Cautious': 'text-green-600 bg-green-50',
        'Balanced': 'text-blue-600 bg-blue-50',
        'Risk-Taking': 'text-orange-600 bg-orange-50',
        'Very Risky': 'text-red-600 bg-red-50',
    };
    const tendencyStyle = riskTendencyColors[model.analysis?.risk_tendency] || 'text-gray-600 bg-gray-50';

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Model header */}
            <div className={`p-5 border-b ${
                safetyPct >= 80 ? 'bg-gradient-to-r from-emerald-50 to-white border-emerald-100' :
                safetyPct >= 50 ? 'bg-gradient-to-r from-amber-50 to-white border-amber-100' :
                'bg-gradient-to-r from-red-50 to-white border-red-100'
            }`}>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-black text-gray-900">{model.name}</h3>
                    <div className={`text-2xl font-black ${
                        safetyPct >= 80 ? 'text-emerald-600' :
                        safetyPct >= 50 ? 'text-amber-600' :
                        'text-red-600'
                    }`}>{safetyPct}%</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <BehaviorTag tag={model.behavior_tag} />
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tendencyStyle}`}>
                        {model.analysis?.risk_tendency}
                    </span>
                </div>
            </div>

            {/* Model stats */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                <div className="p-3 text-center">
                    <p className="text-xs text-gray-400 mb-0.5">Safety</p>
                    <p className={`text-lg font-bold ${
                        safetyPct >= 80 ? 'text-emerald-600' :
                        safetyPct >= 50 ? 'text-amber-600' :
                        'text-red-600'
                    }`}>{safetyPct}%</p>
                </div>
                <div className="p-3 text-center">
                    <p className="text-xs text-gray-400 mb-0.5">Consistency</p>
                    <p className="text-lg font-bold text-blue-600">
                        {(model.analysis?.consistency * 100).toFixed(0)}%
                    </p>
                </div>
                <div className="p-3 text-center">
                    <p className="text-xs text-gray-400 mb-0.5">Responses</p>
                    <p className="text-lg font-bold text-gray-700">
                        {model.responses?.length || 0}
                    </p>
                </div>
            </div>

            {/* Responses */}
            <div className="p-4 space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Model Responses
                </p>
                {model.responses && model.responses.map((response, idx) => (
                    <ResponseCard key={idx} response={response} index={idx} />
                ))}
            </div>
        </div>
    );
}

export function ModelComparison({ models }) {
    if (!models || models.length === 0) {
        return (
            <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-300">
                <p className="text-gray-400 text-lg">No model responses available</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-blue-500" />
                        Model Comparison
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Detailed analysis of each model's response with full text and safety scores
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Shield className="w-4 h-4" />
                    {models.length} models analyzed
                </div>
            </div>

            {/* Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {models.map((model) => (
                    <ModelCard key={model.name} model={model} />
                ))}
            </div>
        </div>
    );
}
