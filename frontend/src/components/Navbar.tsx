import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, LogOut, Moon, Sun, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setDarkMode(true);
        }
    };

    if (location.pathname === '/login') return null;

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-lg bg-opacity-80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-lg text-white">
                                <Box size={20} />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">RegistryUI</span>
                        </Link>

                        <div className="hidden md:flex gap-4">
                            <Link
                                to="/"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                            >
                                Dashboard
                            </Link>
                            {user?.role === 'admin' && (
                                <Link
                                    to="/users"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/users' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                                >
                                    Users
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end gap-1">
                                    {user?.role === 'admin' && <Shield size={10} className="text-blue-500" />}
                                    <span className="capitalize">{user?.role}</span>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;