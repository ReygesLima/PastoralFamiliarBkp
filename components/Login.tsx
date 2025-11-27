
import React, { useState, useEffect, useRef } from 'react';
import MemberForm from './MemberForm';
import { Member } from '../types';
import { LogoIcon, DownloadIcon, ArrowLeftIcon, UserIcon, AddIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';

interface LoginProps {
    onLogin: (login: string, birthDate: string) => void;
    onRegister: (agentData: Member) => Promise<boolean>;
    loading: boolean;
    errorLog: string[];
    onDownloadLog: () => void;
}

type ViewState = 'LANDING' | 'LOGIN' | 'REGISTER';

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, loading, errorLog, onDownloadLog }) => {
    const [viewState, setViewState] = useState<ViewState>('LANDING');
    const [login, setLogin] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const { addNotification } = useNotification();

    const loginInputRef = useRef<HTMLInputElement>(null);
    const landingBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (viewState === 'LOGIN') {
            // Pequeno delay para garantir que a animação/renderização ocorreu
            setTimeout(() => loginInputRef.current?.focus(), 100);
        } else if (viewState === 'LANDING') {
            // Foca no botão principal na tela inicial
            setTimeout(() => landingBtnRef.current?.focus(), 100);
        }
    }, [viewState]);

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

        if (birthDate.length !== 10) {
            addNotification({ message: 'Por favor, informe a data de nascimento completa (DD/MM/AAAA).', type: 'error' });
            return;
        }
        
        // Converter DD/MM/AAAA para ISO YYYY-MM-DD
        let formattedDate = birthDate;
        if (birthDate.length === 10) {
            const [day, month, year] = birthDate.split('/');
            formattedDate = `${year}-${month}-${day}`;
        }
        
        onLogin(login, formattedDate);
    };

    return (
        <div className="flex flex-col justify-center items-center p-4 w-full h-full">
            <div className="w-full max-w-4xl">
                 <div className="flex flex-col items-center text-center mb-8">
                    <LogoIcon className="h-28 w-28 mb-4 drop-shadow-lg" />
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-white drop-shadow-md">Pastoral Familiar</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">Cadastro Paroquial</p>
                </div>
                
                {/* STATE: REGISTER */}
                {viewState === 'REGISTER' && (
                    <div className="animate-fade-in">
                        <div className="mb-4">
                            <button 
                                onClick={() => setViewState('LANDING')}
                                className="flex items-center text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors bg-white/40 dark:bg-slate-800/40 px-4 py-2 rounded-full backdrop-blur-sm"
                            >
                                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                                Voltar ao Início
                            </button>
                        </div>
                        <MemberForm 
                            agentToEdit={null}
                            onSave={onRegister}
                            isFirstTimeRegister={true}
                            onCancel={() => setViewState('LANDING')}
                        />
                    </div>
                )}

                {/* STATE: LOGIN */}
                {viewState === 'LOGIN' && (
                    <div className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 p-8 rounded-3xl shadow-2xl w-full max-w-md mx-auto animate-fade-in">
                         <div className="mb-6 flex items-center justify-between">
                             <button 
                                onClick={() => setViewState('LANDING')}
                                className="p-2 -ml-2 rounded-full text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-white/40 dark:hover:bg-slate-700/40 transition-all"
                                title="Voltar"
                            >
                                <ArrowLeftIcon className="h-6 w-6" />
                            </button>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white text-center flex-1 pr-6">Acessar Cadastro</h2>
                        </div>

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
                    </div>
                )}

                {/* STATE: LANDING (DEFAULT) */}
                {viewState === 'LANDING' && (
                    <div className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 p-10 rounded-3xl shadow-2xl w-full max-w-lg mx-auto animate-fade-in">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 text-center">Bem-vindo(a)</h2>
                        <div className="flex flex-col gap-6">
                            <button 
                                ref={landingBtnRef}
                                onClick={() => setViewState('LOGIN')}
                                className="group relative w-full px-6 py-4 border-2 border-transparent rounded-2xl shadow-lg bg-blue-600/90 hover:bg-blue-700/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] active:scale-95 overflow-hidden"
                            >
                                <div className="flex items-center justify-center">
                                    <div className="bg-white/20 p-2 rounded-full mr-4 group-hover:scale-110 transition-transform">
                                        <UserIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-lg font-bold text-white">Já sou cadastrado</span>
                                </div>
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                            </button>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-slate-300 dark:border-slate-600 opacity-50"></div>
                                <span className="flex-shrink-0 mx-4 text-slate-500 dark:text-slate-400 text-sm">Ou</span>
                                <div className="flex-grow border-t border-slate-300 dark:border-slate-600 opacity-50"></div>
                            </div>

                            <button 
                                onClick={() => setViewState('REGISTER')}
                                className="group relative w-full px-6 py-4 border-2 border-white/50 dark:border-slate-500/50 rounded-2xl shadow-md bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all transform hover:scale-[1.02] active:scale-95"
                            >
                                <div className="flex items-center justify-center">
                                    <div className="bg-green-500/20 p-2 rounded-full mr-4 group-hover:scale-110 transition-transform">
                                        <AddIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <span className="text-lg font-bold text-slate-800 dark:text-white">Desejo me cadastrar</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Login;
