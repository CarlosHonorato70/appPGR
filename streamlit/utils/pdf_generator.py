# streamlit/utils/pdf_generator.py
"""
Gerador de PDFs para propostas e relatórios
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime
from typing import Dict, List, Any

class PDFGenerator:
    """Classe para geração de PDFs"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Configura estilos customizados"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1f1f1f'),
            spaceAfter=30,
            alignment=TA_CENTER
        ))
        
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#333333'),
            spaceAfter=12,
            spaceBefore=12
        ))
    
    def generate_proposal_pdf(self, data: Dict[str, Any]) -> BytesIO:
        """
        Gera PDF de proposta comercial
        
        Args:
            data: Dicionário com dados da proposta
        
        Returns:
            BytesIO com o PDF gerado
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4,
                               rightMargin=72, leftMargin=72,
                               topMargin=72, bottomMargin=18)
        
        # Container para elementos do PDF
        story = []
        
        # Título
        title = Paragraph(f"Proposta Comercial<br/>{data.get('title', 'Sem título')}", 
                         self.styles['CustomTitle'])
        story.append(title)
        story.append(Spacer(1, 20))
        
        # Informações do Cliente
        story.append(Paragraph("Informações do Cliente", self.styles['CustomHeading']))
        client_info = [
            ['Cliente:', data.get('client_name', 'N/A')],
            ['Email:', data.get('client_email', 'N/A')],
            ['Data:', datetime.now().strftime('%d/%m/%Y')],
            ['Status:', data.get('status', 'draft').upper()]
        ]
        client_table = Table(client_info, colWidths=[100, 350])
        client_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(client_table)
        story.append(Spacer(1, 20))
        
        # Descrição
        if data.get('description'):
            story.append(Paragraph("Descrição", self.styles['CustomHeading']))
            story.append(Paragraph(data['description'], self.styles['Normal']))
            story.append(Spacer(1, 20))
        
        # Itens da Proposta
        if data.get('items'):
            story.append(Paragraph("Itens da Proposta", self.styles['CustomHeading']))
            
            items_data = [['Item', 'Quantidade', 'Valor Unitário', 'Total']]
            for item in data['items']:
                items_data.append([
                    item.get('service_name', 'N/A'),
                    str(item.get('quantity', 1)),
                    f"R$ {item.get('unit_price', 0):,.2f}",
                    f"R$ {item.get('total_value', 0):,.2f}"
                ])
            
            items_table = Table(items_data, colWidths=[200, 80, 100, 100])
            items_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(items_table)
            story.append(Spacer(1, 20))
        
        # Valores Finais
        story.append(Paragraph("Resumo Financeiro", self.styles['CustomHeading']))
        financial_data = [
            ['Subtotal:', f"R$ {data.get('subtotal', 0):,.2f}"],
            ['Desconto Geral:', f"R$ {data.get('discount_general', 0):,.2f}"],
            ['Taxa de Deslocamento:', f"R$ {data.get('displacement_fee', 0):,.2f}"],
            ['TOTAL:', f"R$ {data.get('total_value', 0):,.2f}"]
        ]
        financial_table = Table(financial_data, colWidths=[350, 100])
        financial_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 14),
            ('LINEABOVE', (0, -1), (-1, -1), 2, colors.black),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(financial_table)
        story.append(Spacer(1, 30))
        
        # Rodapé
        footer_text = f"""
        <para alignment="center">
        <font size="8">
        Proposta gerada automaticamente pelo Sistema Black Belt<br/>
        {datetime.now().strftime('%d/%m/%Y %H:%M')}
        </font>
        </para>
        """
        story.append(Paragraph(footer_text, self.styles['Normal']))
        
        # Gera o PDF
        doc.build(story)
        buffer.seek(0)
        return buffer
    
    def generate_report_pdf(self, title: str, data: List[Dict[str, Any]], 
                           report_type: str = "general") -> BytesIO:
        """
        Gera PDF de relatório
        
        Args:
            title: Título do relatório
            data: Lista de dados para o relatório
            report_type: Tipo do relatório
        
        Returns:
            BytesIO com o PDF gerado
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        story = []
        
        # Título
        story.append(Paragraph(title, self.styles['CustomTitle']))
        story.append(Spacer(1, 20))
        
        # Metadados
        meta = [
            ['Tipo:', report_type.upper()],
            ['Data de Geração:', datetime.now().strftime('%d/%m/%Y %H:%M')],
            ['Total de Registros:', str(len(data))]
        ]
        meta_table = Table(meta, colWidths=[150, 300])
        story.append(meta_table)
        story.append(Spacer(1, 30))
        
        # Dados (formato simples - pode ser customizado)
        if data:
            # Cabeçalhos baseados nas chaves do primeiro item
            headers = list(data[0].keys())
            table_data = [headers]
            
            for row in data:
                table_data.append([str(row.get(h, '')) for h in headers])
            
            data_table = Table(table_data)
            data_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(data_table)
        
        doc.build(story)
        buffer.seek(0)
        return buffer
