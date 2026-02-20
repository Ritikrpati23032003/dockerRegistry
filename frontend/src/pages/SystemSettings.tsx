import { useState } from 'react';
import api from '../lib/api';
import { RefreshCw, Trash2, Shield, Bell, Users, BarChart3, HardDrive, Settings, Box } from 'lucide-react';
import { motion } from 'framer-motion';

const SystemSettings = () => {
    const [activeTab, setActiveTab] = useState('storage');
    const [gcing, setGcing] = useState(false);
    const [gcOutput, setGcOutput] = useState('');

    const handleGC = async () => {
        if (!window.confirm("Run Garbage Collection? This will free up space from deleted images. It might take a few seconds.")) return;
        setGcing(true);
        setGcOutput('');
        try {
            const { data } = await api.post('/registry/gc');
            setGcOutput(JSON.stringify(data.output, null, 2));
            alert('Garbage Collection triggered successfully.');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to run GC');
        } finally {
            setGcing(false);
        }
    };

    const tabs = [
        { id: 'storage', label: 'Storage & Retention', icon: HardDrive },
        { id: 'security', label: 'Security & Scanning', icon: Shield },
        { id: 'integration', label: 'Webhooks & Notifications', icon: Bell },
        { id: 'access', label: 'User Groups & Access', icon: Users },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'helm', label: 'Helm Charts', icon: Box },
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[600px]">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {activeTab === 'storage' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

                            {/* Garbage Collection Section */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Trash2 size={20} className="text-red-500" />
                                    Garbage Collection
                                </h3>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                                        Soft-deleted manifests are not automatically removed from the file system.
                                        Run Garbage Collection to free up disk space by removing unreferenced blobs.
                                        <b className="block mt-2 text-green-600 dark:text-green-400">Note: This action is safe! It only removes data that is no longer referenced by any tag.</b>
                                    </p>

                                    <div className="flex flex-col gap-4">
                                        <button
                                            onClick={handleGC}
                                            disabled={gcing}
                                            className="w-fit flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                                        >
                                            <RefreshCw size={18} className={gcing ? "animate-spin" : ""} />
                                            {gcing ? 'Running Garbage Collection...' : 'Run Garbage Collection Now'}
                                        </button>

                                        {gcOutput && (
                                            <div className="mt-4 p-4 bg-gray-900 text-green-400 font-mono text-xs rounded-lg overflow-x-auto whitespace-pre-wrap max-h-60 border border-gray-700">
                                                {gcOutput}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Retention Policies Placeholder */}
                            <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <HardDrive size={20} className="text-blue-500" />
                                    Retention Policies
                                </h3>
                                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-800/30 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">Automated retention rules (e.g., maintain last 5 tags) are coming soon.</p>
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vulnerability Scanning</h3>
                            <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                <Shield size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                <h4 className="text-gray-900 dark:text-white font-medium mb-2">Trivy/Clair Integration</h4>
                                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                                    Configure vulnerability scanners to automatically analyze images on push.
                                    Feature currently under development.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'integration' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Webhooks & Notifications</h3>
                            <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                <Bell size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                <h4 className="text-gray-900 dark:text-white font-medium mb-2">Event Notifiers</h4>
                                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                                    Connect Slack, Discord, or generic webhooks to receive alerts for Push/Pull events.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Placeholders for other tabs */}
                    {['access', 'analytics', 'helm'].includes(activeTab) && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full text-center p-12">
                            <Box size={64} className="text-gray-200 dark:text-gray-700 mb-6" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Coming Soon</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                This feature module is currently being built.
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
