import React, { useState } from 'react';
import { PromptInput } from '../components/Input/PromptInput';
import { PromptAnalysisPanel, SummaryStats } from '../components/Analysis/AnalysisPanel';
import { ModelComparison } from '../components/Comparison/ModelComparison';
import { LoadingSpinner, ErrorAlert, WarningAlert } from '../components/ui/Badge';
import { analyzePrompt } from '../services/api';

export function DashboardPage() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAnalyze = async (prompt) => {
        try {
            setLoading(true);
            setError(null);
            const data = await analyzePrompt(prompt);
            setResult(data);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            const errorMessage = err.error || 'Failed to analyze prompt';
            const errorDetails = err.details ? `\n${err.details}` : '';
            const fullMessage = errorMessage + errorDetails;
            setError(fullMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isHighRisk = result?.prompt_analysis?.risk_level === 'HIGH' || result?.prompt_analysis?.risk_level === 'CRITICAL';

    return (
        <div className="space-y-8">
            {/* Input Section */}
            <section className="bg-gradient-to-b from-blue-50 to-transparent py-8">
                <PromptInput onSubmit={handleAnalyze} isLoading={loading} />
            </section>

            {/* Loading state */}
            {loading && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <LoadingSpinner />
                    <p className="text-center text-gray-500 mt-4 text-sm">
                        Analyzing prompt across 12 risk categories and querying models...
                    </p>
                    <div className="flex justify-center gap-3 mt-4">
                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full animate-pulse">🔍 Scanning prompt</span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full animate-pulse delay-300">🤖 Querying models</span>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full animate-pulse delay-500">🛡️ Running guardrails</span>
                    </div>
                </div>
            )}

            {/* Error state */}
            {error && !loading && <ErrorAlert message={error} />}

            {/* Results */}
            {result && !loading && (
                <>
                    {/* Prompt display */}
                    <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Analyzed Prompt</p>
                        <p className="text-gray-800 text-lg leading-relaxed">"{result.prompt}"</p>
                    </section>

                    {/* Risk Analysis */}
                    <section>
                        <PromptAnalysisPanel analysis={result.prompt_analysis} />
                    </section>

                    {/* High risk warning */}
                    {isHighRisk && (
                        <WarningAlert
                            message="This prompt has been flagged as HIGH/CRITICAL RISK. Review the analysis carefully. The model responses below may contain sensitive content."
                        />
                    )}

                    {/* Summary Stats */}
                    <section>
                        <SummaryStats stats={result.summary_stats} />
                    </section>

                    {/* Model Comparison */}
                    <section className="pb-8">
                        <ModelComparison models={result.models} />
                    </section>
                </>
            )}

            {/* Empty state */}
            {!result && !loading && !error && (
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-14 text-center border-2 border-blue-200 shadow-inner">
                    <div className="space-y-5">
                        <div className="text-6xl mb-4">🛡️</div>
                        <h3 className="text-3xl font-black text-gray-900">AI Safety Guardrail Dashboard</h3>
                        <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Enter any prompt to analyze it across <strong>12 safety categories</strong> including
                            violence, financial fraud, health risks, legal compliance, and more.
                            Compare how different AI models respond and evaluate their safety characteristics.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3 mt-8">
                            {[
                                { icon: '⚔️', label: 'Violence' },
                                { icon: '💰', label: 'Financial' },
                                { icon: '🏥', label: 'Health' },
                                { icon: '⚖️', label: 'Legal' },
                                { icon: '🆘', label: 'Self-Harm' },
                                { icon: '🔓', label: 'Cyber' },
                                { icon: '🚫', label: 'Hate Speech' },
                                { icon: '💊', label: 'Drugs' },
                                { icon: '📰', label: 'Misinfo' },
                                { icon: '🔍', label: 'Privacy' },
                                { icon: '⚠️', label: 'Extremism' },
                                { icon: '⛔', label: 'Exploitation' },
                            ].map((cat, i) => (
                                <div key={i} className="px-3 py-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <p className="text-sm font-semibold text-gray-700">
                                        <span className="mr-1">{cat.icon}</span> {cat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
