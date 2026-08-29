
import React, { useState } from 'react';
import { LockClosedIcon } from './Icons';

interface AdminLoginProps {
    onLogin: (username: string, password: string) => boolean;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!onLogin(username, password)) {
            setError('Invalid username or password.');
        }
    };

    return (
        <div className="flex items-center justify-center h-full animate-fadeIn">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg border border-stone-200">
                <div className="text-center">
                    <LockClosedIcon className="mx-auto h-12 w-auto text-amber-600" />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900 font-cinzel">
                        Admin Login
                    </h2>
                    <p className="mt-2 text-center text-sm text-stone-500">
                        Access the restaurant dashboard
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-stone-300 bg-stone-50 placeholder-stone-400 text-stone-900 rounded-t-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                                placeholder="Username (Aditya)"
                            />
                        </div>
                        <div>
                            <label htmlFor="password-admin" className="sr-only">Password</label>
                            <input
                                id="password-admin"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-stone-300 bg-stone-50 placeholder-stone-400 text-stone-900 rounded-b-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-amber-500"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;