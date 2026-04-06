import React from 'react';
import { Menu, X } from 'lucide-react';

export function Sidebar({ activeNav, setActiveNav, isOpen, setIsOpen }) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'analyze', label: 'Analyze Prompt', icon: '🔍' },
        { id: 'history', label: 'History', icon: '📜' },
        { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-soft"
            >
                {isOpen ? <X /> : <Menu />}
            </button>

            {/* Sidebar */}
            <div
                className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6 z-40 transform transition-transform lg:transform-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo */}
                <div className="mb-12 mt-8 lg:mt-0">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        🛡️ Guardrail
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">AI Safety Dashboard</p>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveNav(item.id);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeNav === item.id
                                    ? 'bg-blue-500 shadow-lg'
                                    : 'hover:bg-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </div>
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="text-xs text-gray-400 border-t border-gray-700 pt-4">
                        <p>Built for AI Safety Research</p>
                        <p className="mt-1">v1.0.0</p>
                    </div>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </>
    );
}
