import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

export function RiskBadge({ level }) {
    const styles = {
        SAFE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        LOW: 'bg-green-100 text-green-800 border-green-300',
        MEDIUM: 'bg-amber-100 text-amber-800 border-amber-300',
        HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
        CRITICAL: 'bg-red-100 text-red-800 border-red-400',
    };

    const icons = {
        SAFE: <ShieldCheck className="w-4 h-4" />,
        LOW: <CheckCircle className="w-4 h-4" />,
        MEDIUM: <AlertTriangle className="w-4 h-4" />,
        HIGH: <ShieldAlert className="w-4 h-4" />,
        CRITICAL: <ShieldX className="w-4 h-4" />,
    };

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${styles[level] || styles.MEDIUM}`}>
            {icons[level] || icons.MEDIUM}
            <span>{level}</span>
        </div>
    );
}

export function GuardrailBadge({ status }) {
    const styles = {
        PASSED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        WARNING: 'bg-amber-50 text-amber-700 border border-amber-200',
        FAILED: 'bg-red-50 text-red-700 border border-red-200',
    };

    const icons = {
        PASSED: <ShieldCheck className="w-4 h-4" />,
        WARNING: <AlertTriangle className="w-4 h-4" />,
        FAILED: <ShieldX className="w-4 h-4" />,
    };

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${styles[status] || styles.WARNING}`}>
            {icons[status] || icons.WARNING}
            {status}
        </div>
    );
}

export function BehaviorTag({ tag }) {
    const colors = {
        'Safe & Restrictive': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Creative but Risky': 'bg-orange-50 text-orange-700 border-orange-200',
        'Balanced & Controlled': 'bg-blue-50 text-blue-700 border-blue-200',
        'Neutral': 'bg-gray-50 text-gray-700 border-gray-200',
    };

    return (
        <div className={`inline-block px-2.5 py-1 rounded-full border text-xs font-semibold ${colors[tag] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
            {tag}
        </div>
    );
}

export function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse text-xl">🛡️</div>
                </div>
            </div>
        </div>
    );
}

export function ErrorAlert({ message }) {
    return (
        <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-red-800">Error</h3>
                    <p className="text-red-700 text-sm mt-1">{message}</p>
                </div>
            </div>
        </div>
    );
}

export function SuccessAlert({ message }) {
    return (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-5 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-emerald-800">Success</h3>
                    <p className="text-emerald-700 text-sm mt-1">{message}</p>
                </div>
            </div>
        </div>
    );
}

export function WarningAlert({ message }) {
    return (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-amber-800">Warning</h3>
                    <p className="text-amber-700 text-sm mt-1">{message}</p>
                </div>
            </div>
        </div>
    );
}

export function ScoreBar({ score }) {
    const percentage = Math.round(score * 100);
    const getColor = (score) => {
        if (score < 0.15) return 'bg-emerald-500';
        if (score < 0.33) return 'bg-green-500';
        if (score < 0.67) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const getLabel = (score) => {
        if (score < 0.15) return 'Very Safe';
        if (score < 0.33) return 'Safe';
        if (score < 0.67) return 'Moderate Risk';
        return 'High Risk';
    };

    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Safety Score</span>
                <div className="flex items-center gap-2">
                    <span className={`font-semibold ${
                        score < 0.33 ? 'text-emerald-600' :
                        score < 0.67 ? 'text-amber-600' :
                        'text-red-600'
                    }`}>{getLabel(score)}</span>
                    <span className="font-bold text-gray-700">{percentage}%</span>
                </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${getColor(score)}`}
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                />
            </div>
        </div>
    );
}

export function Card({ children, className = '', hover = true }) {
    return (
        <div className={`bg-white rounded-2xl shadow-md p-5 ${hover ? 'hover:shadow-lg transition-shadow' : ''} ${className}`}>
            {children}
        </div>
    );
}
