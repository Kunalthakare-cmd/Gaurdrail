import React, { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { DashboardPage } from './pages/Dashboard';
import { HistoryPage } from './pages/History';
import { SettingsPage } from './pages/Settings';
import './index.css';

function App() {
    const [activeNav, setActiveNav] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const renderPage = () => {
        switch (activeNav) {
            case 'dashboard':
            case 'analyze':
                return <DashboardPage />;
            case 'history':
                return <HistoryPage />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <DashboardPage />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />

            {/* Main content */}
            <main className="flex-1 overflow-auto lg:ml-64">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {renderPage()}
                </div>
            </main>
        </div>
    );
}

export default App;
