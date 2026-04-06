import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, Copy, Loader } from 'lucide-react';
import { getSamplePrompts } from '../../services/api';

export function PromptInput({ onSubmit, isLoading }) {
    const [prompt, setPrompt] = useState('');
    const [samples, setSamples] = useState([]);
    const [showSamples, setShowSamples] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        fetchSamples();
    }, []);

    useEffect(() => {
        autoResizeTextarea();
    }, [prompt]);

    const fetchSamples = async () => {
        try {
            const data = await getSamplePrompts();
            setSamples(data.samples);
        } catch (error) {
            console.error('Failed to load samples:', error);
        }
    };

    const autoResizeTextarea = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (prompt.trim()) {
            onSubmit(prompt);
            setPrompt('');
        }
    };

    const handleSampleClick = (sample) => {
        setPrompt(sample.text);
        setShowSamples(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Main input area */}
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your prompt here... Analyze how different LLMs respond and their safety characteristics."
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none bg-white"
                        rows={3}
                    ></textarea>

                    {/* Floating copy button */}
                    {prompt && (
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Copy prompt"
                        >
                            <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                    )}
                </div>

                {/* Sample prompts */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowSamples(!showSamples)}
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
                    >
                        <Zap className="w-4 h-4" />
                        Try Sample Prompts
                    </button>

                    {showSamples && samples.length > 0 && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            {samples.map((sample) => (
                                <button
                                    key={sample.id}
                                    type="button"
                                    onClick={() => handleSampleClick(sample)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-700">{sample.text}</p>
                                            <p className="text-xs text-gray-400 mt-1">{sample.category}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit button */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={!prompt.trim() || isLoading}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-soft hover:shadow-lg"
                    >
                        {isLoading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Analyze Prompt
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Character count */}
            <div className="text-xs text-gray-400 mt-2">
                {prompt.length} / 5000 characters
            </div>
        </div>
    );
}
