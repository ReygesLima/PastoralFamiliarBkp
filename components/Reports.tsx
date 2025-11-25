
import React, { useMemo, useState } from 'react';
import { Member, MaritalStatus, Sector } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DownloadIcon, CakeIcon, CloseIcon, PrintIcon, HeartIcon, PhoneIcon } from './icons';

interface ReportsProps {
    agents: Member[];
}

// Mapas de Bodas
const bodasYears: Record<number, string> = {
    1: "Papel", 2: "Algodão", 3: "Couro ou Trigo", 4: "Cera ou Flores e Frutas", 5: "Ferro ou Madeira",
    6: "Açúcar ou Perfume", 7: "Lã ou Latão", 8: "Barro ou Papoula", 9: "Cerâmica ou Vime", 10: "Estanho",
    11: "Aço", 12: "Ônix ou Seda", 13: "Linho ou Renda", 14: "Marfim", 15: "Cristal",
    16: "Safira ou Turmalina", 17: "Rosa", 18: "Turquesa", 19: "Água Marinha ou Cretone", 20: "Porcelana",
    21: "Zircão", 22: "Louça", 23: "Palha", 24: "Opala", 25: "Prata", 26: "Alexandrita", 27: "Crisoprásio",
    28: "Hematita", 29: "Erva", 30: "Pérola", 31: "Nácar", 32: "Pinho", 33: "Crizo", 34: "Oliveira",
    35: "Coral", 36: "Cedro", 37: "Aventurina", 38: "Carvalho", 39: "Mármore", 40: "Esmeralda",
    41: "Seda", 42: "Prata Dourada", 43: "Azeviche", 44: "Carbonato", 45: "Rubi", 46: "Alabastro",
    47: "Jaspe", 48: "Granito", 49: "Heliotrópio", 50: "Ouro", 51: "Bronze", 52: "Argila", 53: "Antimônio",
    54: "Níquel", 55: "Ametista", 56: "Malaquita", 57: "Lápis Lázuli", 58: "Vidro", 59: "Cereja",
    60: "Diamante", 61: "Cobre", 62: "Alecrim ou Telurita", 63: "Lilás ou Sândalo", 64: "Fabulita",
    65: "Pérola Negra", 66: "Ébano", 67: "Neve", 68: "Chumbo", 69: "Mercúrio", 70: "Vinho",
    71: "Zinco", 72: "Aveia", 73: "Manjerona", 74: "Macieira", 75: "Alabastro ou Brilhante",
    76: "Cipreste", 77: "Alfazema", 78: "Benjoim", 79: "Café", 80: "Carvalho", 81: "Cacau",
    82: "Cravo", 83: "Begônia", 84: "Crisântemo", 85: "Girassol", 86: "Hortênsia", 87: "Nogueira",
    88: "Pêra", 89: "Figueira", 90: "Álamo", 91: "Pinheiro", 92: "Salgueiro", 93: "Imbuia",
    94: "Palmeira", 95: "Sândalo", 96: "Oliveira", 97: "Abeto", 98: "Pinheiro", 99: "Salgueiro", 100: "Jequitibá"
};

const bodasMonths: Record<number, string> = {
    1: "Bodas de Beijinho", 2: "Sorvete", 3: "Algodão Doce", 4: "Pipocas", 5: "Chocolate",
    6: "Plumas", 7: "Purpurina", 8: "Pompons", 9: "Maternidade", 10: "Pintinhos", 11: "Chicletes"
};

type ReportType = 'BIRTHDAYS' | 'WEDDINGS';

const Reports: React.FC<ReportsProps> = ({ agents }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportType, setReportType] = useState<ReportType>('BIRTHDAYS');
    const [selectedMonth, setSelectedMonth] = useState<number>(-1); // -1 for all
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const totalAgents = agents.length;

    const dataBySector = useMemo(() => {
        const counts = agents.reduce((acc, member) => {
            acc[member.sector] = (acc[member.sector] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [agents]);

    const dataByMaritalStatus = useMemo(() => {
        const counts = agents.reduce((acc, member) => {
            acc[member.maritalStatus] = (acc[member.maritalStatus] || 0) + 1;
            return acc;
        }, {} as Record<MaritalStatus, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [agents]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
    
    const isDarkMode = document.documentElement.classList.contains('dark');
    const chartTextColor = isDarkMode ? '#e2e8f0' : '#334155';
    const tooltipStyles = {
        contentStyle: {
            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
            borderRadius: '12px',
            backdropFilter: 'blur(8px)',
        },
        itemStyle: { color: chartTextColor },
        labelStyle: { color: chartTextColor },
    };

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const getMonthFromDate = (dateString: string) => {
        const parts = dateString.split('-');
        if (parts.length === 3) return parseInt(parts[1], 10) - 1;
        return -1;
    };
    
    const getDayFromDate = (dateString: string) => {
        const parts = dateString.split('-');
        if (parts.length === 3) return parseInt(parts[2], 10);
        return 0;
    }

    const calculateBodas = (weddingDate: string): string => {
        if (!weddingDate) return "";
        
        const start = new Date(weddingDate + 'T00:00:00');
        const now = new Date();
        
        let years = now.getFullYear() - start.getFullYear();
        let months = now.getMonth() - start.getMonth();
        
        if (months < 0 || (months === 0 && now.getDate() < start.getDate())) {
            years--;
            months += 12;
        }

        if (now.getDate() < start.getDate()) {
            months--;
            if (months < 0) {
               // Ajuste caso a subtração do mês resulte em negativo (embora o bloco acima tente corrigir anos, o dia importa)
               // Simplificação: vamos confiar no cálculo de meses
            }
        }
        // Normalizar meses negativos
        if (months < 0) months += 12;

        if (years > 0) {
            return bodasYears[years] ? `${years} anos: ${bodasYears[years]}` : `${years} anos`;
        } else if (months > 0) {
            return bodasMonths[months] ? `${months} meses: ${bodasMonths[months]}` : `${months} meses`;
        } else {
            return "Recém-casados";
        }
    };

    const filteredData = useMemo(() => {
        const targetDateKey = reportType === 'BIRTHDAYS' ? 'birthDate' : 'weddingDate';
        
        let filtered = agents.filter(agent => {
            if (reportType === 'WEDDINGS' && agent.maritalStatus !== MaritalStatus.CASADO) return false;
            const dateValue = agent[targetDateKey];
            if (!dateValue) return false;
            
            if (selectedMonth === -1) return true;
            return getMonthFromDate(dateValue) === selectedMonth;
        });

        // Sort by Month then Day
        return filtered.sort((a, b) => {
            const dateA = a[targetDateKey] as string;
            const dateB = b[targetDateKey] as string;
            
            const monthA = getMonthFromDate(dateA);
            const monthB = getMonthFromDate(dateB);
            if (monthA !== monthB) return monthA - monthB;
            
            const dayA = getDayFromDate(dateA);
            const dayB = getDayFromDate(dateB);
            return dayA - dayB;
        });
    }, [agents, selectedMonth, reportType]);

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
                resolve(null);
            };
            img.src = url;
        });
    };

    const handleGenerateReportPDF = async () => {
        setIsGeneratingPDF(true);
        const reportLogoBase64 = await imageUrlToBase64('https://static.wixstatic.com/media/efbd1a_7566647af4c94efca85aacf26f0a4228~mv2_d_1920_1920_s_2.png/v1/fill/w_350,h_350,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/efbd1a_7566647af4c94efca85aacf26f0a4228~mv2_d_1920_1920_s_2.png');
        
        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 10;
            
            // PDF Colors
            const headerColor = reportType === 'BIRTHDAYS' ? [236, 72, 153] : [234, 179, 8]; // Pink or Yellow/Amber
            const headerColorRGB = reportType === 'BIRTHDAYS' ? "#ec4899" : "#eab308";
            const rowAltColor = [245, 245, 245]; 
            
            // --- HEADER ---
            if (reportLogoBase64) {
                doc.addImage(reportLogoBase64, 'PNG', margin, 10, 25, 25);
            }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.setTextColor(30, 41, 59);
            const title = reportType === 'BIRTHDAYS' ? 'Relatório de Aniversariantes' : 'Relatório de Matrimônios';
            doc.text(title, margin + 30, 20);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            doc.setTextColor(71, 85, 105);
            doc.text('Pastoral Familiar - Cadastro Paroquial', margin + 30, 28);
            
            const monthText = selectedMonth === -1 ? 'Todos os Meses' : months[selectedMonth];
            doc.text(`Período: ${monthText}`, margin + 30, 35);
            
            doc.setDrawColor(203, 213, 225);
            doc.line(margin, 40, pageWidth - margin, 40);
            
            let y = 50;

            const monthsToProcess = selectedMonth === -1 ? [0,1,2,3,4,5,6,7,8,9,10,11] : [selectedMonth];

            for (const monthIndex of monthsToProcess) {
                const targetDateKey = reportType === 'BIRTHDAYS' ? 'birthDate' : 'weddingDate';
                const agentsInMonth = filteredData.filter(a => getMonthFromDate(a[targetDateKey] as string) === monthIndex);
                
                if (agentsInMonth.length === 0) continue;

                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }

                // Month Header
                doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
                doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.setTextColor(255, 255, 255);
                doc.text(months[monthIndex].toUpperCase(), margin + 5, y + 5.5);
                
                y += 12;

                // Table Headers
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.setTextColor(50);
                
                if (reportType === 'BIRTHDAYS') {
                    doc.text("Nome", margin + 2, y);
                    doc.text("Telefone", margin + 90, y);
                    doc.text("Data Nasc.", margin + 130, y);
                    doc.text("Casamento", margin + 160, y);
                } else {
                    doc.text("Nome (Casal)", margin + 2, y);
                    doc.text("Telefone", margin + 85, y);
                    doc.text("Data", margin + 120, y);
                    doc.text("Bodas", margin + 145, y);
                }
                
                doc.setDrawColor(200);
                doc.line(margin, y + 2, pageWidth - margin, y + 2);
                y += 6;

                // List Agents
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0);
                
                agentsInMonth.forEach((agent, index) => {
                    if (y > 275) {
                        doc.addPage();
                        y = 20;
                    }
                    
                    if (index % 2 === 0) {
                        doc.setFillColor(rowAltColor[0], rowAltColor[1], rowAltColor[2]);
                        doc.rect(margin, y - 4, pageWidth - (margin * 2), 7, 'F');
                    }

                    // Fields
                    const name = agent.fullName.length > 35 ? agent.fullName.substring(0, 32) + '...' : agent.fullName;
                    const phone = agent.phone || '-';
                    
                    let col3 = "";
                    let col4 = "";

                    if (reportType === 'BIRTHDAYS') {
                        const birthDay = getDayFromDate(agent.birthDate);
                        const birthMonth = getMonthFromDate(agent.birthDate) + 1;
                        col3 = `${birthDay.toString().padStart(2, '0')}/${birthMonth.toString().padStart(2, '0')}`;
                        
                        if (agent.weddingDate) {
                            const wDay = getDayFromDate(agent.weddingDate);
                            const wMonth = getMonthFromDate(agent.weddingDate) + 1;
                            const wYear = agent.weddingDate.split('-')[0];
                            col4 = `${wDay.toString().padStart(2, '0')}/${wMonth.toString().padStart(2, '0')}/${wYear}`;
                        } else {
                            col4 = "-";
                        }
                        
                        doc.text(name, margin + 2, y);
                        doc.text(phone, margin + 90, y);
                        doc.text(col3, margin + 130, y);
                        doc.text(col4, margin + 160, y);
                    } else {
                        // Weddings
                        const wDay = getDayFromDate(agent.weddingDate!);
                        const wMonth = getMonthFromDate(agent.weddingDate!) + 1;
                        const wYear = agent.weddingDate!.split('-')[0];
                        col3 = `${wDay.toString().padStart(2, '0')}/${wMonth.toString().padStart(2, '0')}/${wYear}`;
                        
                        const bodasFull = calculateBodas(agent.weddingDate!);
                        // Break bodas line if too long
                        const bodasLines = doc.splitTextToSize(bodasFull, 50);
                        
                        doc.text(name, margin + 2, y);
                        doc.text(phone, margin + 85, y);
                        doc.text(col3, margin + 120, y);
                        doc.text(bodasLines, margin + 145, y);
                    }
                    
                    y += 7;
                });
                
                y += 8; // Space between months
            }
            
            const fileName = reportType === 'BIRTHDAYS' 
                ? `aniversariantes_${selectedMonth === -1 ? 'geral' : months[selectedMonth]}.pdf`
                : `casamentos_${selectedMonth === -1 ? 'geral' : months[selectedMonth]}.pdf`;
                
            doc.save(fileName);

        } catch (error) {
            console.error("Erro PDF", error);
            alert("Erro ao gerar PDF.");
        } finally {
            setIsGeneratingPDF(false);
        }
    }


    const handleExportChartsPDF = async () => {
        setIsExporting(true);
    
        const maritalStatusChartElement = document.getElementById('maritalStatusChart');
        const sectorChartElement = document.getElementById('sectorChart');
    
        if (!maritalStatusChartElement || !sectorChartElement) {
            console.error("Elementos do gráfico não encontrados para exportação.");
            setIsExporting(false);
            return;
        }
    
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
    
        try {
            pdf.setFontSize(20);
            pdf.text('Relatório Estatístico - Pastoral Familiar', pdfWidth / 2, 20, { align: 'center' });
            
            // Page 1: Marital Status Chart
            const canvasMarital = await html2canvas(maritalStatusChartElement, { scale: 2, backgroundColor: null });
            const imgDataMarital = canvasMarital.toDataURL('image/png');
            const imgPropsMarital = pdf.getImageProperties(imgDataMarital);
            const imgHeightMarital = (imgPropsMarital.height * (pdfWidth - 20)) / imgPropsMarital.width;
            pdf.addImage(imgDataMarital, 'PNG', 10, 40, pdfWidth - 20, Math.min(imgHeightMarital, pdfHeight - 50));
    
            // Page 2: Sector Chart
            pdf.addPage();
            const canvasSector = await html2canvas(sectorChartElement, { scale: 2, backgroundColor: null });
            const imgDataSector = canvasSector.toDataURL('image/png');
            const imgPropsSector = pdf.getImageProperties(imgDataSector);
            const imgHeightSector = (imgPropsSector.height * (pdfWidth - 20)) / imgPropsSector.width;
            pdf.addImage(imgDataSector, 'PNG', 10, 20, pdfWidth - 20, Math.min(imgHeightSector, pdfHeight - 30));
    
            pdf.save('relatorio_estatistico.pdf');
    
        } catch (error) {
            console.error("Erro ao gerar o PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
        } finally {
            setIsExporting(false);
        }
    };


    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white drop-shadow-sm">Relatórios da Pastoral</h2>
                 <div className="flex flex-wrap gap-4 justify-center md:justify-end">
                    <button 
                        onClick={() => {
                            setReportType('BIRTHDAYS');
                            setIsReportModalOpen(true);
                        }}
                        className="flex items-center space-x-2 bg-pink-500/90 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-pink-600/90 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 backdrop-blur-sm"
                    >
                        <CakeIcon className="h-5 w-5" />
                        <span>Aniversariantes</span>
                    </button>
                    <button 
                        onClick={() => {
                            setReportType('WEDDINGS');
                            setIsReportModalOpen(true);
                        }}
                        className="flex items-center space-x-2 bg-amber-500/90 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-amber-600/90 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 backdrop-blur-sm"
                    >
                        <HeartIcon className="h-5 w-5" />
                        <span>Casamentos</span>
                    </button>
                    <button 
                        onClick={handleExportChartsPDF}
                        disabled={isExporting}
                        className="flex items-center space-x-2 bg-green-600/90 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-green-700/90 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed backdrop-blur-sm"
                    >
                        <DownloadIcon className="h-5 w-5" />
                        <span>{isExporting ? 'Exportando...' : 'Gráficos PDF'}</span>
                    </button>
                 </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/40 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 p-8 rounded-3xl shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Total de Agentes</h3>
                    <p className="text-6xl font-bold text-blue-600 dark:text-blue-400 mt-4 drop-shadow-md">{totalAgents}</p>
                </div>
                <div className="bg-white/40 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 p-8 rounded-3xl shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Setores Ativos</h3>
                    <p className="text-6xl font-bold text-green-600 dark:text-green-400 mt-4 drop-shadow-md">{dataBySector.length}</p>
                </div>
                 <div className="bg-white/40 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 p-8 rounded-3xl shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Média de Agentes por Setor</h3>
                    <p className="text-6xl font-bold text-amber-600 dark:text-amber-400 mt-4 drop-shadow-md">
                        {dataBySector.length > 0 ? (totalAgents / dataBySector.length).toFixed(1) : 0}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div id="maritalStatusChart" className="bg-white/40 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 p-6 rounded-3xl shadow-lg">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 pl-2">Agentes por Estado Civil</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={dataByMaritalStatus}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                            >
                                {dataByMaritalStatus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip {...tooltipStyles} />
                            <Legend wrapperStyle={{ color: chartTextColor }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div id="sectorChart" className="bg-white/40 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 p-6 rounded-3xl shadow-lg">
                     <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 pl-2">Agentes por Setor Pastoral</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dataBySector} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#475569' : '#cbd5e1'} strokeOpacity={0.5} />
                            <XAxis dataKey="name" tick={{ fill: chartTextColor }} />
                            <YAxis allowDecimals={false} tick={{ fill: chartTextColor }} />
                            <Tooltip {...tooltipStyles} cursor={{ fill: isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)' }}/>
                            <Legend wrapperStyle={{ color: chartTextColor }} />
                            <Bar dataKey="value" fill="#82ca9d" name="Agentes" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Combined Report Modal */}
            {isReportModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300"
                    onClick={() => setIsReportModalOpen(false)}
                >
                    <div 
                        className="bg-white/60 dark:bg-slate-800/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative animate-fade-in flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={() => setIsReportModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                            <CloseIcon className="h-6 w-6" />
                        </button>

                        <div className="flex items-center mb-6 border-b border-white/20 dark:border-slate-600/50 pb-4 justify-between flex-wrap">
                            <div className="flex items-center">
                                <div className={`p-3 rounded-full mr-4 ${reportType === 'BIRTHDAYS' ? 'bg-pink-100 dark:bg-pink-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                                    {reportType === 'BIRTHDAYS' ? (
                                        <CakeIcon className="h-8 w-8 text-pink-500" />
                                    ) : (
                                        <HeartIcon className="h-8 w-8 text-amber-500" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white drop-shadow-sm">
                                        {reportType === 'BIRTHDAYS' ? 'Aniversariantes' : 'Matrimônios'}
                                    </h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">Selecione o mês para visualizar</p>
                                </div>
                            </div>
                            
                            <div className="flex space-x-2 mt-2 sm:mt-0">
                                <button 
                                    onClick={() => setReportType('BIRTHDAYS')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${reportType === 'BIRTHDAYS' ? 'bg-pink-500 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                                >
                                    Nascimento
                                </button>
                                <button 
                                    onClick={() => setReportType('WEDDINGS')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${reportType === 'WEDDINGS' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                                >
                                    Casamento
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 ml-1">Filtrar por Mês</label>
                            <select 
                                value={selectedMonth} 
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className={`block w-full rounded-xl border-white/50 dark:border-slate-600/50 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 shadow-inner focus:outline-none focus:ring-2 text-base py-3 px-4 backdrop-blur-sm transition-all ${reportType === 'BIRTHDAYS' ? 'focus:border-pink-500 focus:ring-pink-500/50' : 'focus:border-amber-500 focus:ring-amber-500/50'}`}
                            >
                                <option value="-1">Todos os meses</option>
                                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                        </div>

                        <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar bg-white/30 dark:bg-slate-900/30 rounded-xl p-4 border border-white/20 dark:border-slate-600/20">
                            {filteredData.length > 0 ? (
                                <ul className="space-y-3">
                                    {filteredData.map(agent => (
                                        <li key={agent.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/40 dark:bg-slate-800/40 p-3 rounded-lg border border-white/30 dark:border-slate-700/30 backdrop-blur-sm">
                                            <div className="flex items-center w-full sm:w-auto">
                                                <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center font-bold mr-3 shadow-sm text-sm border-2 ${reportType === 'BIRTHDAYS' ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 border-pink-200 dark:border-pink-800' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800'}`}>
                                                    {reportType === 'BIRTHDAYS' 
                                                        ? `${getDayFromDate(agent.birthDate)}/${getMonthFromDate(agent.birthDate) + 1}`
                                                        : `${getDayFromDate(agent.weddingDate!)}/${getMonthFromDate(agent.weddingDate!) + 1}`
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800 dark:text-white truncate pr-2">{agent.fullName}</p>
                                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                        <PhoneIcon className="h-3 w-3 mr-1 opacity-70" />
                                                        <span>{agent.phone || 'Sem telefone'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {reportType === 'BIRTHDAYS' ? (
                                                agent.weddingDate && (
                                                    <div className="mt-2 sm:mt-0 sm:ml-4 text-xs text-slate-600 dark:text-slate-300 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-200 dark:border-amber-800/30 flex-shrink-0">
                                                        <span className="font-semibold text-amber-700 dark:text-amber-400">Casamento:</span> {new Date(agent.weddingDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                                                    </div>
                                                )
                                            ) : (
                                                <div className="mt-2 sm:mt-0 sm:ml-4 text-xs text-slate-600 dark:text-slate-300 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/30 flex-shrink-0 max-w-full sm:max-w-[180px] text-right">
                                                    <p className="font-bold text-amber-700 dark:text-amber-400 text-sm leading-tight">{calculateBodas(agent.weddingDate!)}</p>
                                                    <p className="text-[10px] opacity-80">{new Date(agent.weddingDate! + 'T00:00:00').getFullYear()}</p>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-12 flex flex-col items-center text-slate-500 dark:text-slate-400">
                                    <div className="bg-slate-200/50 dark:bg-slate-700/50 p-4 rounded-full mb-3">
                                        {reportType === 'BIRTHDAYS' ? <CakeIcon className="h-8 w-8 opacity-50" /> : <HeartIcon className="h-8 w-8 opacity-50" />}
                                    </div>
                                    <p>Nenhum registro encontrado neste período.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4 pt-4 border-t border-white/20 dark:border-slate-600/50">
                            <button 
                                onClick={() => setIsReportModalOpen(false)}
                                className="rounded-xl bg-white/50 dark:bg-slate-700/50 py-2.5 px-6 text-sm font-semibold text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-inset ring-slate-300/50 dark:ring-slate-600/50 hover:bg-white/80 dark:hover:bg-slate-600/80 transition-all backdrop-blur-sm"
                            >
                                Fechar
                            </button>
                            <button
                                onClick={handleGenerateReportPDF}
                                disabled={isGeneratingPDF || filteredData.length === 0}
                                className={`inline-flex justify-center items-center gap-2 rounded-xl py-2.5 px-6 text-sm font-bold text-white shadow-lg hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all backdrop-blur-sm ${reportType === 'BIRTHDAYS' ? 'bg-pink-600/90 hover:bg-pink-700/90 focus-visible:outline-pink-600' : 'bg-amber-600/90 hover:bg-amber-700/90 focus-visible:outline-amber-600'}`}
                            >
                                <PrintIcon className="h-5 w-5" />
                                {isGeneratingPDF ? 'Gerando...' : 'Imprimir Lista'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.05);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(100,116,139, 0.3);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(100,116,139, 0.5);
                }
            `}</style>
        </div>
    );
};

export default Reports;
