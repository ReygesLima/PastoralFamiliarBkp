
import React, { useState } from 'react';
import { Member } from '../types';
import { WhatsAppIcon, CloseIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';

interface WhatsAppModalProps {
    isOpen: boolean;
    onClose: () => void;
    agents: Member[];
}

const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ isOpen, onClose, agents }) => {
    const [message, setMessage] = useState('Olá, {nome}! Paz e bem!\n\n');
    const [isSending, setIsSending] = useState(false);
    const { addNotification } = useNotification();

    if (!isOpen) {
        return null;
    }

    const handleSendMessages = async () => {
        if (agents.length === 0) {
            addNotification({ message: 'Nenhum agente selecionado para enviar mensagem.', type: 'error' });
            return;
        }
    
        setIsSending(true);
    
        addNotification({
            message: `Iniciando envio para ${agents.length} agentes. Por favor, autorize a abertura de pop-ups se o seu navegador solicitar.`,
            type: 'success',
            duration: 8000
        });
    
        // Give user time to read the notification before closing the modal
        await new Promise(resolve => setTimeout(resolve, 1500));
    
        onClose();
    
        // Another small delay before the first popup
        await new Promise(resolve => setTimeout(resolve, 500));
    
        let successfulOpens = 0;
        for (const agent of agents) {
            const phone = agent.phone?.replace(/\D/g, '');
            if (phone) {
                const fullPhone = phone.length > 11 ? phone : `55${phone}`;
                const personalizedMessage = message.replace(/\{nome\}/g, agent.fullName.split(' ')[0]);
                const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(personalizedMessage)}`;
                
                const newWindow = window.open(url, '_blank');
                
                if (newWindow) {
                    successfulOpens++;
                } else {
                    addNotification({
                        message: 'O envio foi interrompido porque o navegador bloqueou uma janela pop-up. Por favor, habilite os pop-ups para este site e tente novamente.',
                        type: 'error',
                        duration: 10000
                    });
                    setIsSending(false);
                    return; // Stop the process
                }
                
                // Wait for 2 seconds before opening the next tab to avoid being blocked
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        addNotification({
            message: `Processo concluído. ${successfulOpens} abas de conversa foram abertas.`,
            type: 'success',
            duration: 6000
        });

        setIsSending(false);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-white/60 dark:bg-slate-800/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-3xl shadow-2xl w-full max-w-lg p-8 relative animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                    <CloseIcon className="h-6 w-6" />
                </button>

                <div className="flex items-center mb-6">
                    <WhatsAppIcon className="h-10 w-10 text-green-500 mr-4 drop-shadow-md" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white drop-shadow-sm">Enviar Mensagem</h2>
                </div>

                <p className="text-slate-600 dark:text-slate-300 mb-6 font-medium">
                    A mensagem será enviada para <strong className="text-blue-600 dark:text-blue-400">{agents.length} agente(s) selecionado(s)</strong>.
                </p>

                <div className="mb-6">
                    <label htmlFor="whatsapp-message" className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 ml-1">
                        Mensagem
                    </label>
                    <textarea
                        id="whatsapp-message"
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="block w-full rounded-xl border-white/50 dark:border-slate-600/50 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 shadow-inner focus:border-blue-500 focus:ring-blue-500/50 text-base py-3 px-4 backdrop-blur-sm transition-all resize-none"
                    />
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 px-1">
                        Dica: Use <code className="bg-white/50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400 font-mono border border-slate-200 dark:border-slate-600">{'{nome}'}</code> para personalizar a mensagem com o primeiro nome.
                    </p>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={isSending}
                        className="rounded-xl bg-white/50 dark:bg-slate-700/50 py-2.5 px-6 text-sm font-semibold text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-inset ring-slate-300/50 dark:ring-slate-600/50 hover:bg-white/80 dark:hover:bg-slate-600/80 disabled:opacity-50 transition-all backdrop-blur-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSendMessages}
                        disabled={isSending || agents.length === 0}
                        className="inline-flex justify-center rounded-xl bg-green-600/90 py-2.5 px-8 text-sm font-bold text-white shadow-lg hover:bg-green-700/90 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:bg-slate-400 disabled:cursor-wait disabled:hover:scale-100 transition-all backdrop-blur-sm"
                    >
                        {isSending ? 'Enviando...' : 'Iniciar Envio'}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default WhatsAppModal;
