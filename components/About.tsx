
import React from 'react';
import { LogoIcon } from './icons';

const About: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto bg-white/40 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 p-10 rounded-3xl shadow-2xl">
            <div className="flex flex-col items-center text-center">
                <LogoIcon className="h-28 w-28 mb-6 drop-shadow-xl" />
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white drop-shadow-sm">Pastoral Familiar - Cadastro Paroquial</h2>
                <p className="text-slate-600 dark:text-slate-300 mt-2 font-medium">Versão 1.0.0</p>
            </div>
            
            <div className="mt-10 text-left space-y-8 text-slate-700 dark:text-slate-200">
                <p className="text-lg leading-relaxed">
                    Este aplicativo foi desenvolvido para auxiliar na organização e gestão dos agentes da Pastoral Familiar da nossa paróquia. 
                    O objetivo é centralizar as informações, facilitar a comunicação e otimizar o acompanhamento das atividades e dos agentes.
                </p>

                <div className="bg-white/30 dark:bg-slate-900/40 p-6 rounded-2xl border border-white/30 dark:border-slate-700/30">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Contato da Paróquia</h3>
                    <div className="space-y-3">
                        <p className="flex items-center"><i className="fas fa-church mr-3 text-amber-500 w-6 text-center text-xl"></i> Paróquia Santa Maria Goretti </p>
                        <p className="flex items-center"><i className="fas fa-map-marker-alt mr-3 text-amber-500 w-6 text-center text-xl"></i> Rua Rui Barbosa S/N - Diocese de Itabuna -  BA</p>
                        <p className="flex items-center"><i className="fas fa-phone mr-3 text-amber-500 w-6 text-center text-xl"></i> (73) 3212-1753</p>
                        <p className="flex items-center"><i className="fas fa-envelope mr-3 text-amber-500 w-6 text-center text-xl"></i> paroquiagoretti@hotmail.com</p>
                    </div>
                </div>

                 <div className="bg-white/30 dark:bg-slate-900/40 p-6 rounded-2xl border border-white/30 dark:border-slate-700/30">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Desenvolvimento</h3>
                    <p className="leading-relaxed">
                        Este sistema é uma ferramenta interna e seu uso é restrito aos membros autorizados da coordenação da Pastoral Familiar.
                        Para suporte técnico ou sugestões, entre em contato com a secretaria paroquial.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
