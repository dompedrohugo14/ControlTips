import jsPDF from 'jspdf';
import { supabase } from '../lib/supabase';

export async function generatePerformanceReport(): Promise<Blob> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Usuário não autenticado');
  }

  const { data: bets } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', session.user.id)
    .order('bet_date', { ascending: false });

  if (!bets || bets.length === 0) {
    throw new Error('Nenhuma aposta encontrada');
  }

  const totalBets = bets.length;
  const wins = bets.filter(b => b.result === 'win').length;
  const losses = bets.filter(b => b.result === 'loss').length;
  const pending = bets.filter(b => b.result === 'pending').length;
  const winRate = totalBets > 0 ? (wins / (wins + losses)) * 100 : 0;
  const totalProfit = bets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
  const totalStaked = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;
  const avgOdd = bets.reduce((sum, bet) => sum + bet.odd, 0) / totalBets;

  const categoryCounts = bets.reduce((acc, bet) => {
    acc[bet.category] = (acc[bet.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Logo header with metallic gold background
  pdf.setFillColor(212, 175, 55); // Metallic gold #D4AF37
  pdf.rect(0, 0, pageWidth, 50, 'F');

  // Control Tips logo text
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Control Tips', pageWidth / 2, 22, { align: 'center' });

  // Subtitle
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Relatório de Performance', pageWidth / 2, 35, { align: 'center' });

  pdf.setFontSize(10);
  pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 43, { align: 'center' });

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Métricas Gerais', 20, 65);

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');

  let yPos = 80;
  const metrics = [
    { label: 'Total de Apostas:', value: totalBets.toString() },
    { label: 'Vitórias:', value: wins.toString(), color: [34, 197, 94] },
    { label: 'Derrotas:', value: losses.toString(), color: [239, 68, 68] },
    { label: 'Pendentes:', value: pending.toString(), color: [156, 163, 175] },
    { label: 'Taxa de Acerto:', value: `${winRate.toFixed(1)}%`, color: winRate >= 50 ? [34, 197, 94] : [239, 68, 68] },
    { label: 'Lucro Total:', value: `R$ ${totalProfit.toFixed(2)}`, color: totalProfit >= 0 ? [34, 197, 94] : [239, 68, 68] },
    { label: 'ROI:', value: `${roi.toFixed(2)}%`, color: roi >= 0 ? [34, 197, 94] : [239, 68, 68] },
    { label: 'Valor Total Apostado:', value: `R$ ${totalStaked.toFixed(2)}` },
    { label: 'Odd Média:', value: avgOdd.toFixed(2) },
  ];

  metrics.forEach((metric) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(80, 80, 80);
    pdf.text(metric.label, 20, yPos);

    pdf.setFont('helvetica', 'bold');
    if (metric.color) {
      pdf.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
    } else {
      pdf.setTextColor(0, 0, 0);
    }
    pdf.text(metric.value, 110, yPos);

    yPos += 10;
  });

  yPos += 10;
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Distribuição por Categoria', 20, yPos);

  yPos += 10;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');

  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .forEach(([category, count]) => {
      const percentage = ((count / totalBets) * 100).toFixed(1);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`${category}:`, 20, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${count} apostas (${percentage}%)`, 110, yPos);
      yPos += 8;
    });


  const footerY = pdf.internal.pageSize.getHeight() - 15;
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 120);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Gerado automaticamente pelo Sistema de Controle de Apostas', pageWidth / 2, footerY, { align: 'center' });

  return pdf.output('blob');
}

export function downloadPDF(blob: Blob, filename: string = 'relatorio-apostas.pdf') {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function shareReport(blob: Blob) {
  const file = new File([blob], 'relatorio-apostas.pdf', { type: 'application/pdf' });

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: 'Relatório de Performance - Apostas',
        text: 'Confira meu relatório de performance de apostas!',
        files: [file],
      });
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
      return false;
    }
  }

  return false;
}

export function copyReportLink(blob: Blob): string {
  const url = URL.createObjectURL(blob);
  return url;
}
