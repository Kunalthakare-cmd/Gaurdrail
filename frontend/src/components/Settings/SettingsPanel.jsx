import React, { useState, useEffect } from 'react';
import { getApiStatus, getModelsInfo } from '../../services/api';
import { Card, LoadingSpinner, ErrorAlert, WarningAlert } from '../ui/Badge';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function SettingsPanel() {
    const [apiStatus, setApiStatus] = useState(null);
    const [modelsInfo, setModelsInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            const [statusData, modelsData] = await Promise.all([
                getApiStatus(),
                getModelsInfo()
            ]);
            setApiStatus(statusData);
            setModelsInfo(modelsData.models || []);
        } catch (err) {
            setError('Failed to load settings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    const missingKeys = apiStatus?.missing || [];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

            {/* API Configuration */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">API Configuration</h3>

                {missingKeys.length > 0 && (
                    <WarningAlert
                        message={`Missing API keys: ${missingKeys.join(', ').toUpperCase()}. Add them to your .env file to use those models.`}
                    />
                )}

                <Card>
                    <div className="space-y-3">
                        {Object.entries(apiStatus?.configured || {}).map(([key, configured]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    {configured ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900 capitalize">{key} API</p>
                                        <p className="text-xs text-gray-500">{configured ? 'Configured' : 'Not configured'}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${configured
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {configured ? '✓ Ready' : '⚠ Required'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                        <p className="font-semibold mb-1">Setup Instructions</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                            <li>Copy <code className="bg-white px-1 rounded">.env.example</code> to <code className="bg-white px-1 rounded">.env</code></li>
                            <li>Add your API keys to the .env file</li>
                            <li>Restart the backend server</li>
                            <li>Refresh this page to verify configuration</li>
                        </ol>
                    </div>
                </Card>
            </div>

            {/* Models Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Available Models</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modelsInfo.map((model) => (
                        <Card key={model.name} className="border-l-4 border-blue-500">
                            <div>
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-gray-900">{model.name}</h4>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                        {model.provider}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">{model.description}</p>
                                <p className="text-xs text-gray-500 mt-2 italic">Type: {model.behavior}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Best Practices */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Best Practices</h3>

                <Card>
                    <ul className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-start gap-3">
                            <span className="text-lg">✓</span>
                            <div>
                                <p className="font-semibold">Use varied prompts</p>
                                <p className="text-gray-600 text-xs mt-1">Test both safe and potentially risky prompts to understand model behavior</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-lg">✓</span>
                            <div>
                                <p className="font-semibold">Check API keys regularly</p>
                                <p className="text-gray-600 text-xs mt-1">Ensure all necessary API keys are configured for complete analysis</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-lg">✓</span>
                            <div>
                                <p className="font-semibold">Review historical data</p>
                                <p className="text-gray-600 text-xs mt-1">Track trends in model behavior over time</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-lg">✓</span>
                            <div>
                                <p className="font-semibold">Interpret scores carefully</p>
                                <p className="text-gray-600 text-xs mt-1">Safety scores are estimates; use them as guidance, not absolute truth</p>
                            </div>
                        </li>
                    </ul>
                </Card>
            </div>
        </div>
    );
}
