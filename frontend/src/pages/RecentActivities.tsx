import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Loader2, Activity } from 'lucide-react';

const RecentActivities = () => {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const { data } = await api.get('/registry/statistics');
            setActivities(data.recentActivity || []);
        } catch (error) {
            console.error('Failed to fetch activities', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Activity size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Recent Activities
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        View all recent interactions with the registry
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {activities.map((activity, i) => (
                            <div key={i} className="p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className={`mt-1 p-2 rounded-full ${activity.action === 'push' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                    {activity.action === 'push' ? <Loader2 size={16} className="rotate-180" /> : <Loader2 size={16} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            <span className="capitalize">{activity.action}</span> by <span className="font-bold">{activity.username}</span>
                                        </p>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                                            {new Date(activity.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Repository: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">{activity.repository}</span>
                                    </p>
                                    {activity.tag && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Tag: <span className="font-mono text-xs">{activity.tag}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {activities.length === 0 && (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                No recent activity found.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecentActivities;
