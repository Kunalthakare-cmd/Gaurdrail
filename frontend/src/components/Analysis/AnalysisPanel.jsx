import React, { useState } from 'react';
import { RiskBadge, Card } from '../ui/Badge';
import { AlertTriangle, CheckCircle, TrendingUp, Shield, ChevronDown, ChevronUp, Info } from 'lucide-react';

// Severity color mapping
const severityColors = {
    NONE: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', bar: 'bg-gray-400' },
    SAFE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500' },
    LOW: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', bar: 'bg-green-500' },
    MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500' },
    HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', bar: 'bg-orange-500' },
    CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: 'bg-red-600' },
};

const riskLevelConfig = {
    SAFE: { gradient: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50', border: 'border-emerald-300', icon: '✅' },
    LOW: { gradient: 'from-green-400 to-emerald-500', bg: 'bg-green-50', border: 'border-green-300', icon: 'ℹ️' },
    MEDIUM: { gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-300', icon: '⚠️' },
    HIGH: { gradient: 'from-orange-500 to-red-500', bg: 'bg-orange-50', border: 'border-orange-300', icon: '🔴' },
    CRITICAL: { gradient: 'from-red-600 to-red-800', bg: 'bg-red-50', border: 'border-red-400', icon: '🚨' },
};

function CategoryScoreBar({ label, icon, score, matched, neutralized }) {
    const percentage = Math.round(score * 100);
    const getBarColor = () => {
        if (!matched || score < 0.1) return 'bg-emerald-400';
        if (neutralized) return 'bg-blue-400';
        if (score < 0.33) return 'bg-green-400';
        if (score < 0.67) return 'bg-amber-400';
        if (score < 0.85) return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <div className="flex items-center gap-3 py-1.5">
            <span className="text-base w-6 text-center flex-shrink-0">{icon}</span>
            <span className="text-xs font-medium text-gray-700 w-40 flex-shrink-0 truncate">{label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2 relative overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${getBarColor()}`}
                    style={{ width: `${Math.max(percentage, 1)}%` }}
                />
            </div>
            <span className={`text-xs font-bold w-10 text-right flex-shrink-0 ${
                !matched ? 'text-gray-400' :
                neutralized ? 'text-blue-600' :
                score < 0.33 ? 'text-green-600' :
                score < 0.67 ? 'text-amber-600' :
                'text-red-600'
            }`}>
                {percentage}%
            </span>
            {neutralized && (
                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full flex-shrink-0">Safe</span>
            )}
        </div>
    );
}

export function PromptAnalysisPanel({ analysis }) {
    const [showAllCategories, setShowAllCategories] = useState(false);

    if (!analysis) return null;

    const riskConfig = riskLevelConfig[analysis.risk_level] || riskLevelConfig.SAFE;
    const riskPercent = Math.round(analysis.risk_score * 100);

    // Build category list from category_scores
    const allCategories = analysis.category_scores
        ? Object.entries(analysis.category_scores).map(([id, data]) => ({
            id,
            label: data.label,
            icon: data.icon,
            score: data.score,
            matched: data.matched,
            neutralized: data.neutralized || false,
        }))
        : [];

    // Sort: matched first, then by score descending
    allCategories.sort((a, b) => {
        if (a.matched && !b.matched) return -1;
        if (!a.matched && b.matched) return 1;
        return b.score - a.score;
    });

    const displayCategories = showAllCategories ? allCategories : allCategories.slice(0, 6);

    return (
        <div className={`rounded-2xl border-2 ${riskConfig.border} ${riskConfig.bg} overflow-hidden shadow-lg`}>
            {/* Header with risk score */}
            <div className="p-6">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Prompt Risk Analysis
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Multi-category safety assessment</p>
                    </div>
                    <RiskBadge level={analysis.risk_level} />
                </div>

                {/* Big risk score gauge */}
                <div className="bg-white rounded-xl p-5 shadow-sm mb-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700">Overall Risk Score</span>
                        <span className={`text-3xl font-black bg-gradient-to-r ${riskConfig.gradient} bg-clip-text text-transparent`}>
                            {riskPercent}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${riskConfig.gradient}`}
                            style={{ width: `${Math.max(riskPercent, 2)}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>Safe</span>
                        <span>Low</span>
                        <span>Medium</span>
                        <span>High</span>
                        <span>Critical</span>
                    </div>
                </div>

                {/* Detected Categories (flagged ones) */}
                {analysis.detected_categories && analysis.detected_categories.length > 0 && (
                    <div className="bg-white rounded-xl p-5 shadow-sm mb-5">
                        <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Flagged Categories
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {analysis.detected_categories.map((cat, idx) => {
                                const sevColors = severityColors[cat.severity] || severityColors.NONE;
                                return (
                                    <div key={idx} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${sevColors.bg} ${sevColors.border}`}>
                                        <span className="text-sm">{cat.icon}</span>
                                        <span className={`text-xs font-semibold ${sevColors.text}`}>{cat.label}</span>
                                        {cat.neutralized && (
                                            <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full ml-1">Neutralized</span>
                                        )}
                                        <span className={`text-xs font-bold ${sevColors.text}`}>{Math.round(cat.score * 100)}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* All Category Scores Breakdown */}
                {allCategories.length > 0 && (
                    <div className="bg-white rounded-xl p-5 shadow-sm mb-5">
                        <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            Category-wise Risk Breakdown
                        </p>
                        <div className="space-y-0.5">
                            {displayCategories.map((cat) => (
                                <CategoryScoreBar
                                    key={cat.id}
                                    label={cat.label}
                                    icon={cat.icon}
                                    score={cat.score}
                                    matched={cat.matched}
                                    neutralized={cat.neutralized}
                                />
                            ))}
                        </div>
                        {allCategories.length > 6 && (
                            <button
                                onClick={() => setShowAllCategories(!showAllCategories)}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-3 font-medium transition-colors"
                            >
                                {showAllCategories ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                {showAllCategories ? 'Show Less' : `Show All ${allCategories.length} Categories`}
                            </button>
                        )}
                    </div>
                )}

                {/* Intent Analysis */}
                {analysis.intent_analysis && (
                    <div className="bg-white rounded-xl p-5 shadow-sm mb-5">
                        <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-indigo-500" />
                            Intent Analysis
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">{analysis.intent_analysis}</p>
                    </div>
                )}

                {/* Explanation */}
                <div className="bg-white rounded-xl p-5 shadow-sm mb-5">
                    <p className="text-sm font-bold text-gray-700 mb-2">Assessment</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{analysis.explanation}</p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                        <span className="text-xs text-gray-500 block">Words</span>
                        <p className="text-lg font-bold text-gray-800">{analysis.metadata?.word_count || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                        <span className="text-xs text-gray-500 block">Characters</span>
                        <p className="text-lg font-bold text-gray-800">{analysis.metadata?.char_count || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                        <span className="text-xs text-gray-500 block">Severity</span>
                        <p className={`text-lg font-bold ${
                            (analysis.max_severity === 'CRITICAL' || analysis.max_severity === 'HIGH')
                                ? 'text-red-600'
                                : analysis.max_severity === 'MEDIUM'
                                    ? 'text-amber-600'
                                    : 'text-emerald-600'
                        }`}>{analysis.max_severity || 'NONE'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SummaryStats({ stats }) {
    if (!stats || !stats.safest_model) return null;

    return (
        <div className="space-y-5">
            <h2 className="text-2xl font-bold text-gray-900">Analysis Summary</h2>

            {/* Summary cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Overall avg safety */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                    <p className="text-sm font-medium text-blue-100">Overall Safety</p>
                    <p className="text-4xl font-black mt-2">
                        {((1 - stats.overall_avg_safety) * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-blue-200 mt-1">safety rating across all models</p>
                    <TrendingUp className="absolute bottom-4 right-4 w-8 h-8 text-blue-300/30" />
                </div>

                {/* Safest model */}
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                    <p className="text-sm font-medium text-emerald-100">Safest Model</p>
                    <p className="text-3xl font-black mt-2">{stats.safest_model.name}</p>
                    <p className="text-xs text-emerald-200 mt-1">
                        {((1 - stats.safest_model.score) * 100).toFixed(0)}% safety score
                    </p>
                    <CheckCircle className="absolute bottom-4 right-4 w-8 h-8 text-green-300/30" />
                </div>

                {/* Riskiest model */}
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                    <p className="text-sm font-medium text-orange-100">Most Risky Model</p>
                    <p className="text-3xl font-black mt-2">{stats.riskiest_model.name}</p>
                    <p className="text-xs text-red-200 mt-1">
                        {(stats.riskiest_model.score * 100).toFixed(0)}% risk score
                    </p>
                    <AlertTriangle className="absolute bottom-4 right-4 w-8 h-8 text-red-300/30" />
                </div>
            </div>

            {/* Model ranking table */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-5">Model Safety Ranking</h3>
                <div className="space-y-3">
                    {stats.models && stats.models.map((model, idx) => {
                        const safetyPct = ((1 - model.score) * 100).toFixed(0);
                        const medals = ['🥇', '🥈', '🥉'];
                        return (
                            <div key={idx}
                                className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                                    idx === 0 ? 'bg-emerald-50 border border-emerald-200' :
                                    idx === stats.models.length - 1 ? 'bg-red-50 border border-red-200' :
                                    'bg-gray-50 border border-gray-200'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{medals[idx] || `#${idx + 1}`}</span>
                                    <span className="font-bold text-gray-900">{model.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-40 bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${
                                                safetyPct >= 80 ? 'bg-emerald-500' :
                                                safetyPct >= 50 ? 'bg-amber-500' :
                                                'bg-red-500'
                                            }`}
                                            style={{ width: `${safetyPct}%` }}
                                        />
                                    </div>
                                    <span className={`font-bold text-sm w-12 text-right ${
                                        safetyPct >= 80 ? 'text-emerald-600' :
                                        safetyPct >= 50 ? 'text-amber-600' :
                                        'text-red-600'
                                    }`}>{safetyPct}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
