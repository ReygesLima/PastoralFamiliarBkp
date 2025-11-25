
import React, { useMemo, useState } from 'react';
import { Member, MaritalStatus, Sector } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DownloadIcon } from './icons';

interface ReportsProps {
    agents: Member[];
}

const Reports: React.FC<ReportsProps> = ({ agents }) => {
    const [isExporting, setIsExporting] = useState(false);
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
    
    // Check for dark mode to adjust chart text colors
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


    const handleExportPDF = async () => {
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
            pdf.text('Relatório da Pastoral Familiar', pdfWidth / 2, 20, { align: 'center' });
            
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
    
            pdf.save('relatorio_pastoral_familiar.pdf');
    
        } catch (error) {
            console.error("Erro ao gerar o PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
        } finally {
            setIsExporting(false);
        }
    };


    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white drop-shadow-sm">Relatórios da Pastoral</h2>
                 <button 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="flex items-center space-x-2 bg-green-600/90 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-green-700/90 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed backdrop-blur-sm"
                >
                    <DownloadIcon className="h-5 w-5" />
                    <span>{isExporting ? 'Exportando...' : 'Exportar para PDF'}</span>
                </button>
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
                                // FIX: Added nullish coalescing operator to prevent error if `percent` is not a number.
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
        </div>
    );
};

export default Reports;
