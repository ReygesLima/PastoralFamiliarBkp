
import React, { useState, useMemo, useEffect } from 'react';
import { Member, MaritalStatus, Role, Sector } from '../types';
import { EditIcon, DeleteIcon, AddIcon, UserIcon, DownloadIcon, FileIcon, WhatsAppIcon } from './icons';
import jsPDF from 'jspdf';
import WhatsAppModal from './WhatsAppModal';

interface MemberListProps {
    agents: Member[];
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onAddNew: () => void;
    loggedInAgent: Member;
}

interface MemberCardProps {
    agent: Member;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    isCoordinator: boolean;
    isSelected: boolean;
    onToggleSelect: (id: number) => void;
}


const MemberCard: React.FC<MemberCardProps> = ({ agent, onEdit, onDelete, isCoordinator, isSelected, onToggleSelect }) => {
    return (
        <div 
            className={`bg-white/40 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative cursor-pointer group ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent' : ''}`}
            onClick={() => onToggleSelect(agent.id)}
        >
             <div className="absolute top-4 right-4 z-10 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect(agent.id);
                    }}
                    className="h-5 w-5 rounded-md border-slate-400 dark:border-slate-500 text-blue-600 focus:ring-blue-500 cursor-pointer bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm"
                />
            </div>
             {isSelected && (
                 <div className="absolute top-4 right-4 z-10 p-2 opacity-100">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                         onClick={(e) => {
                            e.stopPropagation();
                            onToggleSelect(agent.id);
                        }}
                        className="h-5 w-5 rounded-md border-slate-400 dark:border-slate-500 text-blue-600 focus:ring-blue-500 cursor-pointer bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm"
                    />
                 </div>
             )}

            <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                     <div className="flex-shrink-0 relative">
                        {agent.photo ? (
                            <img className="h-16 w-16 rounded-full object-cover ring-2 ring-white/50 dark:ring-slate-600 shadow-md" src={agent.photo} alt={agent.fullName} />
                        ) : (
                            <div className="flex-shrink-0 bg-blue-100/50 dark:bg-slate-700/50 rounded-full p-3 text-blue-600 dark:text-blue-400 h-16 w-16 flex items-center justify-center ring-2 ring-white/50 dark:ring-slate-600 shadow-md">
                                <UserIcon className="h-8 w-8" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{agent.fullName}</h3>
                        <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold">{agent.role}</p>
                    </div>
                </div>
                
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <p className="flex items-center"><i className="fas fa-sitemap mr-3 text-slate-400 dark:text-slate-500 w-4 text-center"></i> {agent.sector}</p>
                    <p className="flex items-center"><i className="fas fa-church mr-3 text-slate-400 dark:text-slate-500 w-4 text-center"></i> {agent.parish} / {agent.community}</p>
                    <p className="flex items-center"><i className="fas fa-phone mr-3 text-slate-400 dark:text-slate-500 w-4 text-center"></i> {agent.phone}</p>
                    <p className="flex items-center"><i className="fas fa-map-marker-alt mr-3 text-slate-400 dark:text-slate-500 w-4 text-center"></i> {agent.city}, {agent.state}</p>
                    <p className="flex items-center"><i className="fas fa-ring mr-3 text-slate-400 dark:text-slate-500 w-4 text-center"></i> {agent.maritalStatus}</p>
                </div>
            </div>
            <div className="bg-white/30 dark:bg-slate-800/40 px-5 py-3 flex justify-end space-x-2 border-t border-white/20 dark:border-slate-700/30" onClick={e => e.stopPropagation()}>
                <button onClick={() => onEdit(agent.id)} className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-full transition-colors duration-200" aria-label={`Editar ${agent.fullName}`}>
                    <EditIcon className="h-5 w-5" />
                </button>
                {isCoordinator && (
                    <button onClick={() => onDelete(agent.id)} className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-full transition-colors duration-200" aria-label={`Excluir ${agent.fullName}`}>
                        <DeleteIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
};


const MemberList: React.FC<MemberListProps> = ({ agents, onEdit, onDelete, onAddNew, loggedInAgent }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSector, setFilterSector] = useState('');
    const [filterMaritalStatus, setFilterMaritalStatus] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
    const [selectedAgentIds, setSelectedAgentIds] = useState<Set<number>>(new Set());

    const isCoordinator = loggedInAgent.role === Role.COORDENADOR;

    const sectors = useMemo(() => {
        if (!agents) return [];
        const uniqueSectors = new Set(agents.map(agent => agent.sector));
        return Array.from(uniqueSectors).sort((a: string, b: string) => a.localeCompare(b));
    }, [agents]);
    const roles = Object.values(Role);

    const filteredAgents = useMemo(() => {
        return agents.filter(agent => {
            const searchMatch = agent.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                agent.phone.includes(searchTerm);
            const sectorMatch = filterSector === '' || agent.sector === filterSector;
            const maritalStatusMatch = filterMaritalStatus === '' || agent.maritalStatus === filterMaritalStatus;
            const roleMatch = filterRole === '' || agent.role === filterRole;

            return searchMatch && sectorMatch && maritalStatusMatch && roleMatch;
        });
    }, [agents, searchTerm, filterSector, filterMaritalStatus, filterRole]);

    useEffect(() => {
        setSelectedAgentIds(new Set());
    }, [searchTerm, filterSector, filterMaritalStatus, filterRole]);

    const handleToggleSelectAgent = (agentId: number) => {
        setSelectedAgentIds(prevSelectedIds => {
            const newSelectedIds = new Set(prevSelectedIds);
            if (newSelectedIds.has(agentId)) {
                newSelectedIds.delete(agentId);
            } else {
                newSelectedIds.add(agentId);
            }
            return newSelectedIds;
        });
    };

    const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allFilteredIds = new Set(filteredAgents.map(a => a.id));
            setSelectedAgentIds(allFilteredIds);
        } else {
            setSelectedAgentIds(new Set());
        }
    };
    
    const selectedAgents = useMemo(() => agents.filter(agent => selectedAgentIds.has(agent.id)), [agents, selectedAgentIds]);


    const handleExportCSV = () => {
        if (filteredAgents.length === 0) {
            alert("Não há agentes para exportar com os filtros selecionados.");
            return;
        }
    
        const headers = [
            "Nome Completo", "Data de Nascimento", "Estado Civil", "Nome do Cônjuge", "Data de Casamento",
            "Telefone", "E-mail", "CEP", "Endereço", "Bairro", "Cidade", "UF",
            "Possui Veículo", "Modelo do Veículo", "Paróquia", "Comunidade", "Setor", 
            "Função", "Data de Ingresso", "Observações"
        ];
    
        const rows = filteredAgents.map(agent => [
            `"${agent.fullName.replace(/"/g, '""')}"`,
            agent.birthDate,
            agent.maritalStatus,
            `"${agent.spouseName?.replace(/"/g, '""') || ''}"`,
            agent.weddingDate || '',
            agent.phone,
            agent.email,
            agent.cep,
            `"${agent.street.replace(/"/g, '""')}"`,
            `"${agent.neighborhood.replace(/"/g, '""')}"`,
            `"${agent.city.replace(/"/g, '""')}"`,
            agent.state,
            agent.hasVehicle ? 'Sim' : 'Não',
            `"${agent.vehicleModel?.replace(/"/g, '""') || ''}"`,
            `"${agent.parish.replace(/"/g, '""')}"`,
            `"${agent.community.replace(/"/g, '""')}"`,
            agent.sector,
            agent.role,
            agent.joinDate,
            `"${agent.notes?.replace(/"/g, '""') || ''}"`,
        ].join(','));
    
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'agentes_pastoral_familiar.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const imageUrlToBase64 = (url: string): Promise<string | null> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    const dataURL = canvas.toDataURL('image/png');
                    resolve(dataURL);
                } else {
                    resolve(null);
                }
            };
            img.onerror = () => {
                console.error("Error loading image for PDF from URL:", url);
                resolve(null);
            };
            img.src = url;
        });
    };
    
    const handleExportPDF = async () => {
        if (filteredAgents.length === 0) {
            alert("Não há agentes para exportar com os filtros selecionados.");
            return;
        }
    
        setIsExportingPDF(true);
        const reportLogoBase64 = await imageUrlToBase64('https://static.wixstatic.com/media/efbd1a_7566647af4c94efca85aacf26f0a4228~mv2_d_1920_1920_s_2.png/v1/fill/w_350,h_350,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/efbd1a_7566647af4c94efca85aacf26f0a4228~mv2_d_1920_1920_s_2.png');

        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            const FONT_SIZE_NORMAL = 10;
            const FONT_SIZE_TITLE = 16;
            const FONT_SIZE_HEADER = 12;
            const LINE_HEIGHT = 6;
    
            for (let i = 0; i < filteredAgents.length; i++) {
                const agent = filteredAgents[i];
                if (i > 0) doc.addPage();
    
                // --- HEADER START ---
                if (reportLogoBase64) {
                    doc.addImage(reportLogoBase64, 'PNG', margin, 15, 20, 20);
                }
                doc.setFontSize(FONT_SIZE_TITLE);
                doc.setFont('helvetica', 'bold');
                doc.text('Ficha Cadastral de Agente', margin + 25, 22);

                doc.setFontSize(FONT_SIZE_NORMAL);
                doc.setFont('helvetica', 'normal');
                doc.text('Pastoral Familiar - Cadastro Paroquial', margin + 25, 30);

                doc.setDrawColor(150);
                doc.line(margin, 35, pageWidth - margin, 35);
                // --- HEADER END ---

                let y = 45; // New starting Y position for content
    
                const photoX = margin;
                const photoY = y;
                const photoSize = 40;
                doc.setDrawColor(150);
                doc.rect(photoX, photoY, photoSize, photoSize);
                if (agent.photo) {
                    try {
                        const photoFormat = agent.photo.substring(agent.photo.indexOf('/') + 1, agent.photo.indexOf(';'));
                        doc.addImage(agent.photo, photoFormat.toUpperCase(), photoX + 1, photoY + 1, photoSize - 2, photoSize - 2);
                    } catch (e) {
                        doc.setFontSize(8);
                        doc.text('Foto\ninválida', photoX + photoSize / 2, photoY + photoSize / 2, { align: 'center' });
                    }
                } else {
                    doc.setFontSize(8);
                    doc.text('Sem Foto', photoX + photoSize / 2, photoY + photoSize / 2, { align: 'center' });
                }
    
                let textX = photoX + photoSize + 10;
                let currentY = y + 5;
                const drawFieldInline = (label: string, value: string | undefined | null) => {
                    if(!value) return;
                    doc.setFontSize(FONT_SIZE_NORMAL);
                    doc.setFont('helvetica', 'bold');
                    doc.text(label, textX, currentY);
                    doc.setFont('helvetica', 'normal');
                    doc.text(value, textX + 40, currentY);
                    currentY += LINE_HEIGHT;
                }
                
                drawFieldInline('Nome Completo:', agent.fullName);
                if (agent.birthDate) drawFieldInline('Nascimento:', new Date(agent.birthDate + 'T00:00:00').toLocaleDateString('pt-BR'));
                drawFieldInline('Estado Civil:', agent.maritalStatus);
                if (agent.maritalStatus === MaritalStatus.CASADO) {
                    drawFieldInline('Cônjuge:', agent.spouseName);
                    if (agent.weddingDate) drawFieldInline('Casamento:', new Date(agent.weddingDate + 'T00:00:00').toLocaleDateString('pt-BR'));
                }
    
                y = photoY + photoSize + 15;
    
                const drawSection = (title: string) => {
                    const headerHeight = 8;
                    const textPadding = 2;
                    if (y + headerHeight > doc.internal.pageSize.getHeight() - 20) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.setFillColor(37, 99, 235); // Blue-600
                    doc.rect(margin, y, pageWidth - margin * 2, headerHeight, 'F');
                    doc.setFontSize(FONT_SIZE_HEADER);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(255, 255, 255);
                    doc.text(title, margin + textPadding, y + headerHeight / 2, { align: 'left', baseline: 'middle' });
                    y += headerHeight + 4;
                };
    
                const drawField = (label: string, value: string | undefined | null) => {
                    if (!value || String(value).trim() === '') return;
                    doc.setFontSize(FONT_SIZE_NORMAL);
                    
                    const labelWidth = 50;
                    const valueX = margin + labelWidth;
                    const valueMaxWidth = pageWidth - valueX - margin;
                    const textLines = doc.splitTextToSize(String(value), valueMaxWidth);

                    if (y + (textLines.length * (LINE_HEIGHT - 1)) > doc.internal.pageSize.getHeight() - 20) {
                        doc.addPage();
                        y = 20;
                    }

                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(0,0,0);
                    doc.text(label, margin, y, { baseline: 'top' });
                    
                    doc.setFont('helvetica', 'normal');
                    doc.text(textLines, valueX, y, { baseline: 'top' });
                    
                    y += (textLines.length * (LINE_HEIGHT - 1)) + 3;
                };
    
                drawSection('Contato');
                drawField('Telefone / WhatsApp:', agent.phone);
                drawField('E-mail:', agent.email);
    
                drawSection('Endereço');
                drawField('CEP:', agent.cep);
                drawField('Endereço:', agent.street);
                drawField('Bairro:', agent.neighborhood);
                drawField('Cidade / UF:', `${agent.city} / ${agent.state}`);
    
                drawSection('Informações Pastorais');
                drawField('Paróquia:', agent.parish);
                drawField('Comunidade:', agent.community);
                drawField('Setor Pastoral:', agent.sector);
                drawField('Função:', agent.role);
                if (agent.joinDate) drawField('Data de Ingresso:', new Date(agent.joinDate + 'T00:00:00').toLocaleDateString('pt-BR'));
    
                drawSection('Outras Informações');
                drawField('Possui Veículo:', agent.hasVehicle ? 'Sim' : 'Não');
                if (agent.hasVehicle) drawField('Modelo do Veículo:', agent.vehicleModel);
                if (agent.notes) {
                    drawField('Observações:', agent.notes);
                }
            }
    
            doc.save('fichas_cadastrais.pdf');
        } catch (error) {
            console.error("Erro ao gerar o PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
        } finally {
            setIsExportingPDF(false);
        }
    };

    return (
        <div className="space-y-6">
            {isCoordinator && (
                 <div className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 p-6 rounded-3xl shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div className="col-span-1 md:col-span-2 lg:col-span-1">
                            <label htmlFor="search" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 ml-1">Buscar por Nome ou Telefone</label>
                            <input
                                id="search"
                                type="text"
                                placeholder="Digite aqui..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2.5 border border-white/50 dark:border-slate-600/50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 backdrop-blur-sm transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="filterSector" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 ml-1">Setor Pastoral</label>
                            <select id="filterSector" value={filterSector} onChange={(e) => setFilterSector(e.target.value)} className="w-full px-4 py-2.5 border border-white/50 dark:border-slate-600/50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 backdrop-blur-sm transition-all">
                                <option value="">Todos</option>
                                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="filterMaritalStatus" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 ml-1">Estado Civil</label>
                            <select id="filterMaritalStatus" value={filterMaritalStatus} onChange={(e) => setFilterMaritalStatus(e.target.value)} className="w-full px-4 py-2.5 border border-white/50 dark:border-slate-600/50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 backdrop-blur-sm transition-all">
                                <option value="">Todos</option>
                                {Object.values(MaritalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="filterRole" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 ml-1">Função</label>
                            <select id="filterRole" value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="w-full px-4 py-2.5 border border-white/50 dark:border-slate-600/50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 backdrop-blur-sm transition-all">
                                <option value="">Todas</option>
                                {roles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            )}
           
            
            <div className="flex justify-between items-center flex-wrap gap-4 px-1">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white drop-shadow-sm">
                    {isCoordinator ? `Agentes Cadastrados (${filteredAgents.length})` : 'Meu Cadastro'}
                </h2>
                {isCoordinator && (
                    <div className="flex items-center flex-wrap gap-2">
                        <button 
                            onClick={() => setIsWhatsAppModalOpen(true)}
                            disabled={selectedAgents.length === 0}
                            className="flex items-center space-x-2 bg-teal-500/90 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-teal-600/90 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400/50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none backdrop-blur-sm"
                        >
                            <WhatsAppIcon className="h-5 w-5" />
                            <span>WhatsApp ({selectedAgents.length})</span>
                        </button>
                        <button 
                            onClick={handleExportCSV}
                            className="flex items-center space-x-2 bg-green-600/90 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-green-700/90 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 backdrop-blur-sm"
                        >
                            <DownloadIcon className="h-5 w-5" />
                            <span>CSV</span>
                        </button>
                        <button 
                            onClick={handleExportPDF}
                            disabled={isExportingPDF}
                            className="flex items-center space-x-2 bg-red-600/90 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-red-700/90 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-slate-400/50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none backdrop-blur-sm"
                        >
                            <FileIcon className="h-5 w-5" />
                            <span>{isExportingPDF ? 'Gerando...' : 'PDF'}</span>
                        </button>
                        <button 
                            onClick={onAddNew}
                            className="flex items-center space-x-2 bg-blue-600/90 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-blue-700/90 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 backdrop-blur-sm"
                        >
                            <AddIcon className="h-5 w-5" />
                            <span>Novo</span>
                        </button>
                    </div>
                )}
            </div>
            
            {isCoordinator && filteredAgents.length > 0 && (
                <div className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-md border border-white/40 dark:border-slate-700/50 px-4 py-3 rounded-xl shadow-sm flex items-center inline-block">
                    <input
                        id="select-all"
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-500 text-blue-600 focus:ring-blue-500 cursor-pointer bg-white/50 dark:bg-slate-800/50"
                        onChange={handleToggleSelectAll}
                        checked={filteredAgents.length > 0 && selectedAgentIds.size === filteredAgents.length}
                        disabled={filteredAgents.length === 0}
                    />
                    <label htmlFor="select-all" className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
                        Selecionar todos ({selectedAgentIds.size} / {filteredAgents.length})
                    </label>
                </div>
            )}

            {filteredAgents.length > 0 ? (
                <div className={`grid grid-cols-1 ${isCoordinator ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-6 mt-6`}>
                    {filteredAgents.map(agent => (
                        <MemberCard 
                            key={agent.id} 
                            agent={agent} 
                            onEdit={onEdit} 
                            onDelete={onDelete} 
                            isCoordinator={isCoordinator} 
                            isSelected={selectedAgentIds.has(agent.id)}
                            onToggleSelect={handleToggleSelectAgent}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white/30 dark:bg-slate-800/40 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-3xl shadow-lg mt-6">
                    <p className="text-slate-600 dark:text-slate-300 text-lg">Nenhum agente encontrado com os filtros selecionados.</p>
                </div>
            )}

            <WhatsAppModal 
                isOpen={isWhatsAppModalOpen}
                onClose={() => setIsWhatsAppModalOpen(false)}
                agents={selectedAgents}
            />
        </div>
    );
};

export default MemberList;
