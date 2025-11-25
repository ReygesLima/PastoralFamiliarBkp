
import React, { useState } from 'react';
import { DownloadIcon } from './icons';

interface ConfigPanelProps {
    errorMessage: string | null;
    onSave: (url: string, key: string) => void;
    errorLog: string[];
    onDownloadLog: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ errorMessage, onSave, errorLog, onDownloadLog }) => {
    const [url, setUrl] = useState(localStorage.getItem('supabaseUrl') || '');
    const [key, setKey] = useState(localStorage.getItem('supabaseKey') || '');
    const [showKey, setShowKey] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url && key) {
            onSave(url, key);
        }
    };

    const isTableError = errorMessage?.includes('relation') || errorMessage?.includes('Could not find the table');

    return (
        <div className="flex flex-col justify-center items-center py-10 w-full h-full">
            <div className="w-full max-w-2xl bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 p-8 rounded-3xl shadow-2xl">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white text-center drop-shadow-sm">Configuração de Acesso</h2>
                <p className="text-slate-600 dark:text-slate-300 text-center mt-3 mb-8 font-medium">
                    Não foi possível conectar ao banco de dados. Verifique as credenciais ou a estrutura do banco (tabela/funções).
                </p>

                {isTableError && (
                    <div className="bg-amber-100/60 dark:bg-amber-900/40 p-6 rounded-2xl border border-amber-300/50 dark:border-amber-800/50 mb-8 backdrop-blur-sm">
                        <h4 className="font-bold text-amber-800 dark:text-amber-200 text-lg">Dica: Tabela ou Função não encontrada</h4>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mt-2">
                            O erro sugere que a tabela <code className="bg-amber-200/50 dark:bg-amber-800/60 p-1 rounded text-xs font-mono border border-amber-300/50">membros_pastoral</code> ou a função <code className="bg-amber-200/50 dark:bg-amber-800/60 p-1 rounded text-xs font-mono border border-amber-300/50">login_agente</code> não existem.
                        </p>
                         <div className="mt-4 pt-4 border-t border-amber-300/30 dark:border-amber-700/30">
                             <h5 className="font-semibold text-amber-800 dark:text-amber-200">Como corrigir?</h5>
                             <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                                Para sua conveniência, um script SQL foi gerado. Siga estes passos:
                            </p>
                            <ol className="list-decimal list-inside text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1">
                                <li>Abra o arquivo <code className="bg-amber-200/50 dark:bg-amber-800/60 p-1 rounded text-xs font-mono">database.sql</code> na lista de arquivos.</li>
                                <li>Copie todo o seu conteúdo.</li>
                                <li>No seu painel do Supabase, vá para o <strong>SQL Editor</strong>.</li>
                                <li>Cole o conteúdo e clique em <strong>RUN</strong>.</li>
                            </ol>
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <div className="bg-red-100/60 dark:bg-red-900/40 p-6 rounded-2xl border border-red-300/50 dark:border-red-800/50 mb-8 backdrop-blur-sm">
                        <p className="text-red-800 dark:text-red-300 font-bold">Detalhes do Erro:</p>
                        <p className="text-red-700 dark:text-red-400 text-sm mt-1 font-mono break-all">{errorMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="supabaseUrl" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 ml-1">
                            Supabase URL
                        </label>
                        <input
                            id="supabaseUrl"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://exemplo.supabase.co"
                            required
                            className="w-full px-4 py-3 border border-white/50 dark:border-slate-600/50 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 backdrop-blur-sm transition-all"
                        />
                    </div>
                    <div>
                        <label htmlFor="supabaseKey" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 ml-1">
                            Supabase Anon Key
                        </label>
                         <div className="relative">
                            <input
                                id="supabaseKey"
                                type={showKey ? 'text' : 'password'}
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                placeholder="eyJhbGciOiJI..."
                                required
                                className="w-full px-4 py-3 border border-white/50 dark:border-slate-600/50 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 pr-10 text-sm bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 backdrop-blur-sm transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                aria-label={showKey ? 'Ocultar chave' : 'Mostrar chave'}
                            >
                                <i className={`fas ${showKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>
                     <p className="text-xs text-slate-600 dark:text-slate-400 px-1">
                        Você pode encontrar essas informações no seu painel do Supabase, em <span className="font-semibold">Project Settings &gt; API</span>.
                        Certifique-se também de que a <a href="https://supabase.com/docs/guides/auth/row-level-security" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Row Level Security (RLS)</a> está habilitada e configurada para permitir leitura na tabela <code className="bg-slate-200/50 dark:bg-slate-700/50 p-1 rounded text-xs font-mono">membros_pastoral</code>.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
                        <button
                            type="submit"
                            disabled={!url || !key}
                            className="w-full sm:flex-1 px-6 py-3 bg-blue-600/90 text-white rounded-xl font-bold hover:bg-blue-700/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400/50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-lg backdrop-blur-sm"
                        >
                            Salvar e Tentar Novamente
                        </button>
                         {errorLog.length > 0 && (
                            <button
                                type="button"
                                onClick={onDownloadLog}
                                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-slate-600/80 text-white rounded-xl font-semibold hover:bg-slate-700/80 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all shadow-md backdrop-blur-sm"
                                title="Baixar log de erros da sessão"
                            >
                                <DownloadIcon className="h-5 w-5" />
                                <span>Baixar Log</span>
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConfigPanel;
