import React, { useState, useEffect } from 'react';
import { getHistory, deleteHistory } from '../../services/api';
import { Trash2, RotateCcw } from 'lucide-react';
import { Card, LoadingSpinner, ErrorAlert } from '../ui/Badge';

export function HistoryPanel() {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getHistory(20);
            setHistoryData(data.history || []);
        } catch (err) {
            setError('Failed to load history');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteHistory(id);
            setHistoryData(historyData.filter(h => h.id !== id));
        } catch (err) {
            setError('Failed to delete history entry');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Analysis History</h2>
                <button
                    onClick={loadHistory}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {error && <ErrorAlert message={error} />}

            <div className="space-y-2">
                {historyData.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <p className="text-gray-500">No analysis history yet</p>
                            <p className="text-sm text-gray-400 mt-2">Your past analyses will appear here</p>
                        </div>
                    </Card>
                ) : (
                    historyData.map((entry) => (
                        <Card key={entry.id} className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-gray-900 font-medium truncate">{entry.prompt}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xs text-gray-400">
                                        {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString()}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium">Prompt Risk:</span>
                                        <span className={`text-xs px-2 py-1 rounded ${entry.prompt_risk === 'HIGH' ? 'bg-red-100 text-red-700' :
                                                entry.prompt_risk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                            }`}>
                                            {entry.prompt_risk}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-600">Safety: {entry.safest_model}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(entry.id)}
                                className="ml-4 p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                title="Delete entry"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
