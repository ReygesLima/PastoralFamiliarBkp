
import React, { useState, useEffect, useRef } from 'react';
import MemberForm from './MemberForm';
import { Member } from '../types';
import { LogoIcon, DownloadIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';

interface LoginProps {
    onLogin: (login: string, birthDate: string) => void;
    onRegister: (agentData: Member) => Promise<boolean>;
    loading: boolean;
    errorLog: string[];
    onDownloadLog: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, loading, errorLog, onDownloadLog }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [login, setLogin] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const { addNotification } = useNotification();

    const loginInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isRegistering) {
            loginInputRef.current?.focus();
        }
    }, [isRegistering]);

    const formatDateMask = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
        return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    };

    const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBirthDate(formatDateMask(e.target.value));
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        
        // Converter DD/MM/AAAA para ISO YYYY-MM-DD
        let formattedDate = birthDate;
        if (birthDate.length === 10) {
            const [day, month, year] = birthDate.split('/');
            formattedDate = `${year}-${month}-${day}`;
        }
        
        onLogin(login, formattedDate);
    };

    const handleShowLogDownload = () => {
        addNotification({
            message: "Clique no botão de download para obter o log de erros e enviá-lo para o suporte técnico.",
            type: 'error',
            duration: 8000, 
        });
    }

    return (
        <div className="flex flex-col justify-center items-center p-4 w-full h-full">
            <div className="w-full max-w-4xl">
                 <div className="flex flex-col items-center text-center mb-8">
                    <LogoIcon className="h-24 w-24 mb-4 drop-shadow-lg" />
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-white drop-shadow-md">Pastoral Familiar</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">Cadastro Paroquial</p>
                </div>
                
                {isRegistering ? (
                    <div>
                        <MemberForm 
                            agentToEdit={null}
                            onSave={onRegister}
                            isFirstTimeRegister={true}
                        />
                        <div className="mt-6 text-center">
                            <button onClick={() => setIsRegistering(false)} disabled={loading} className="font-medium text-blue-700 hover:text-blue-800 disabled:text-slate-400 disabled:cursor-not-allowed dark:text-blue-300 dark:hover:text-blue-200 underline decoration-2 underline-offset-4">
                                Já sou cadastrado
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 p-8 rounded-3xl shadow-2xl w-full max-w-md mx-auto">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">Acessar meu Cadastro</h2>
                        <form onSubmit={handleLoginSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="login" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">Login</label>
                                <input
                                    ref={loginInputRef}
                                    id="login" type="text" value={login} onChange={(e) => setLogin(e.target.value)} required
                                    disabled={loading}
                                    className="mt-1 block w-full px-4 py-3 border border-white/50 dark:border-slate-600/50 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm disabled:bg-slate-100/50 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 backdrop-blur-sm transition-all"
                                    placeholder="Digite seu login"
                                />
                            </div>
                             <div>
                                <label htmlFor="birthDate" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">Data de Nascimento</label>
                                <input
                                    id="birthDate" 
                                    type="tel" 
                                    value={birthDate} 
                                    onChange={handleBirthDateChange} 
                                    required
                                    disabled={loading}
                                    maxLength={10}
                                    placeholder="DD/MM/AAAA"
                                    className="mt-1 block w-full px-4 py-3 border border-white/50 dark:border-slate-600/50 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm disabled:bg-slate-100/50 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 backdrop-blur-sm transition-all"
                                />
                            </div>
                           
                            <div>
                                <button type="submit" disabled={loading || !login || !birthDate} className="w-full px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600/90 hover:bg-blue-700/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400/50 disabled:cursor-wait flex justify-center items-center transition-all transform hover:scale-[1.02] active:scale-95">
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Entrando...
                                        </>
                                    ) : 'Entrar'}
                                </button>
                            </div>
                             {errorLog.length > 0 && (
                                <div className="text-center pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Problemas para acessar?</p>
                                    <button
                                        type="button"
                                        onClick={onDownloadLog}
                                        className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 underline focus:outline-none flex items-center justify-center gap-2 mx-auto"
                                    >
                                        <DownloadIcon className="h-4 w-4" />
                                        Baixar log do erro para análise
                                    </button>
                                </div>
                            )}
                        </form>
                         <div className="mt-6 text-center">
                            <button onClick={() => setIsRegistering(true)} disabled={loading} className="font-medium text-blue-700 hover:text-blue-800 disabled:text-slate-400 disabled:cursor-not-allowed dark:text-blue-300 dark:hover:text-blue-200 underline decoration-2 underline-offset-4">
                                Desejo me Cadastrar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
