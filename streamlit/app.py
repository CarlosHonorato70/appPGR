# streamlit/app.py
import streamlit as st
import requests
import os
from datetime import datetime

# Configurações de página
st.set_page_config(
    page_title="Black Belt - Gestão Integrada",
    page_icon="⚫",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS Customizado
st.markdown("""
<style>
    .main {
        padding: 0;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header-title {
        color: #1f1f1f;
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 10px;
    }
</style>
""", unsafe_allow_html=True)

# Backend URL
API_URL = os.getenv("API_URL", "http://localhost:3000/trpc")
TENANT_ID = st.session_state.get("tenant_id", "default-tenant")

# Menu lateral
with st.sidebar:
    st.markdown("### 🏢 Black Belt Consultoria")
    st.markdown("Sistema Integrado de Gestão")
    st.divider()
    
    selected = st.radio(
        "Menu Principal",
        ["📊 Dashboard", "🧮 Precificação", "📄 Propostas", "🛡️ Avaliação de Riscos", "📈 Relatórios"],
        label_visibility="collapsed"
    )
    
    st.divider()
    st.markdown("**Usuário:** Admin")
    st.markdown(f"**Tenant:** {TENANT_ID}")

# Página de Dashboard
if selected == "📊 Dashboard":
    st.markdown("<h1 class='header-title'>📊 Dashboard</h1>", unsafe_allow_html=True)
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total de Propostas", "24", "+3 este mês")
    with col2:
        st.metric("Propostas Aprovadas", "18", "+2")
    with col3:
        st.metric("Valor Total", "R$ 125.450", "+15%")
    with col4:
        st.metric("Taxa de Conversão", "75%", "+5%")
    
    st.divider()
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Propostas por Status")
        import pandas as pd
        status_data = {
            "Status": ["Draft", "Enviada", "Aprovada", "Rejeitada"],
            "Quantidade": [5, 7, 18, 3]
        }
        df = pd.DataFrame(status_data)
        st.bar_chart(df.set_index("Status"))
    
    with col2:
        st.subheader("Receita Mensal")
        monthly_data = {
            "Mês": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
            "Receita": [15000, 18000, 22000, 19000, 25000, 28000]
        }
        df_monthly = pd.DataFrame(monthly_data)
        st.line_chart(df_monthly.set_index("Mês"))

# Página de Precificação
elif selected == "🧮 Precificação":
    st.markdown("<h1 class='header-title'>🧮 Calculadora de Precificação</h1>", unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["Parâmetros Base", "Calcular Item"])
    
    with tab1:
        st.subheader("Configurar Parâmetros de Precificação")
        
        col1, col2 = st.columns(2)
        
        with col1:
            fixed_costs = st.number_input("Custos Fixos Mensais (R$)", value=5000.0, step=100.0)
            pro_labor = st.number_input("Pró-labore Mensal (R$)", value=2000.0, step=100.0)
        
        with col2:
            productive_hours = st.number_input("Horas Produtivas/Mês", value=160.0, step=10.0)
            
        st.divider()
        st.subheader("Taxas por Regime Tributário")
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            tax_mei = st.number_input("MEI (%)", value=3.5, step=0.1)
        with col2:
            tax_simples = st.number_input("Simples Nacional (%)", value=6.0, step=0.1)
        with col3:
            tax_lucro = st.number_input("Lucro Presumido (%)", value=8.0, step=0.1)
        with col4:
            tax_autonomo = st.number_input("Autônomo (%)", value=11.0, step=0.1)
        
        if st.button("💾 Salvar Parâmetros", key="save_params"):
            st.success("✅ Parâmetros salvos com sucesso!")
            
        # Calcular e mostrar hora técnica
        if fixed_costs and pro_labor and productive_hours:
            technical_hour = (fixed_costs + pro_labor) / productive_hours
            st.info(f"💡 Hora Técnica Calculada: **R$ {technical_hour:.2f}**")
    
    with tab2:
        st.subheader("Calcular Item de Proposta")
        
        col1, col2 = st.columns(2)
        
        with col1:
            base_price = st.number_input("Preço Base (R$)", value=5000.0)
            estimated_hours = st.number_input("Horas Estimadas", value=40.0)
            tax_regime = st.selectbox("Regime Tributário", ["MEI", "Simples Nacional", "Lucro Presumido", "Autônomo"])
        
        with col2:
            adjustment_personalization = st.slider("Ajuste Personalização (%)", 0.0, 50.0, 0.0)
            adjustment_risk = st.slider("Ajuste Risco (%)", 0.0, 50.0, 0.0)
            adjustment_seniority = st.slider("Ajuste Senioridade (%)", 0.0, 50.0, 0.0)
        
        volume_discount = st.slider("Desconto por Volume (%)", 0.0, 50.0, 0.0)
        
        if st.button("🔢 Calcular", key="calc_item"):
            # Simulate calculation
            technical_hour = (base_price + base_price * 0.2) / 160
            tax_rate_map = {
                "MEI": 3.5,
                "Simples Nacional": 6.0,
                "Lucro Presumido": 8.0,
                "Autônomo": 11.0
            }
            tax_rate = tax_rate_map.get(tax_regime, 0)
            
            value_with_taxes = technical_hour * (1 + tax_rate / 100)
            base_value = value_with_taxes * estimated_hours
            adjusted_value = base_value * (1 + adjustment_personalization / 100) * (1 + adjustment_risk / 100) * (1 + adjustment_seniority / 100)
            discounted_value = adjusted_value * (1 - volume_discount / 100)
            
            st.success("✅ Cálculo realizado!")
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric("Hora Técnica", f"R$ {technical_hour:.2f}")
                st.metric("Valor c/ Impostos", f"R$ {value_with_taxes:.2f}")
            
            with col2:
                st.metric("Valor Base", f"R$ {base_value:.2f}")
                st.metric("Valor Ajustado", f"R$ {adjusted_value:.2f}")
            
            with col3:
                st.metric("**Valor Final**", f"**R$ {discounted_value:.2f}**")

# Página de Propostas
elif selected == "📄 Propostas":
    st.markdown("<h1 class='header-title'>📄 Gerenciador de Propostas</h1>", unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["Listar Propostas", "Criar Nova"])
    
    with tab1:
        st.subheader("Propostas Cadastradas")
        
        import pandas as pd
        data = {
            "ID": ["PROP-001", "PROP-002", "PROP-003"],
            "Cliente": ["Empresa A", "Empresa B", "Empresa C"],
            "Status": ["✅ Aprovada", "📤 Enviada", "📝 Draft"],
            "Valor": ["R$ 15.000", "R$ 22.000", "R$ 8.500"],
            "Data": ["15/01/2025", "18/01/2025", "20/01/2025"]
        }
        df = pd.DataFrame(data)
        st.dataframe(df, use_container_width=True)
    
    with tab2:
        st.subheader("Criar Nova Proposta")
        
        col1, col2 = st.columns(2)
        
        with col1:
            client_name = st.text_input("Nome do Cliente")
            client_email = st.text_input("Email do Cliente")
        
        with col2:
            proposal_title = st.text_input("Título da Proposta")
            proposal_date = st.date_input("Data da Proposta")
        
        st.divider()
        st.subheader("Adicionar Itens")
        
        num_items = st.number_input("Número de Itens", min_value=1, max_value=10, value=1)
        
        total_value = 0
        for i in range(int(num_items)):
            with st.expander(f"📦 Item {i+1}", expanded=True):
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    service = st.selectbox(f"Serviço", ["Consultoria", "Auditoria", "Treinamento"], key=f"service_{i}")
                with col2:
                    hours = st.number_input(f"Horas", value=40, key=f"hours_{i}")
                with col3:
                    price = st.number_input(f"Preço (R$)", value=5000.0, key=f"price_{i}")
                
                total_value += price
        
        st.divider()
        
        col1, col2 = st.columns(2)
        
        with col1:
            general_discount = st.number_input("Desconto Geral (R$)", value=0.0)
        with col2:
            displacement_fee = st.number_input("Taxa de Deslocamento (R$)", value=0.0)
        
        final_total = total_value - general_discount + displacement_fee
        st.metric("**Valor Total da Proposta**", f"**R$ {final_total:,.2f}**")
        
        if st.button("✅ Criar Proposta", key="create_proposal"):
            st.success("✅ Proposta criada com sucesso!")

# Página de Avaliação de Riscos
elif selected == "🛡️ Avaliação de Riscos":
    st.markdown("<h1 class='header-title'>🛡️ Avaliação de Riscos Psicossociais (NR-01)</h1>", unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["Avaliações Cadastradas", "Criar Nova Avaliação"])
    
    with tab1:
        st.subheader("Avaliações de Risco")
        
        import pandas as pd
        data = {
            "Cliente": ["Empresa A", "Empresa B", "Empresa C"],
            "Setor": ["TI", "Manufatura", "Comércio"],
            "Nível de Risco": ["🟡 Médio", "🔴 Alto", "🟢 Baixo"],
            "Data": ["10/01/2025", "15/01/2025", "18/01/2025"]
        }
        df = pd.DataFrame(data)
        st.dataframe(df, use_container_width=True)
    
    with tab2:
        st.subheader("Criar Nova Avaliação")
        
        col1, col2 = st.columns(2)
        
        with col1:
            client = st.selectbox("Cliente", ["Empresa A", "Empresa B", "Empresa C"])
            sector = st.text_input("Setor")
        
        with col2:
            risk_level = st.selectbox("Nível de Risco", ["🟢 Baixo", "🟡 Médio", "🔴 Alto", "⚫ Muito Alto"])
        
        st.divider()
        
        st.subheader("Fatores Psicossociais")
        
        col1, col2 = st.columns(2)
        
        with col1:
            carga_trabalho = st.slider("Carga de Trabalho", 0, 10, 5)
            controle = st.slider("Controle sobre Trabalho", 0, 10, 5)
            apoio_social = st.slider("Apoio Social", 0, 10, 5)
        
        with col2:
            seguranca = st.slider("Segurança no Emprego", 0, 10, 5)
            equilibrio = st.slider("Relação Trabalho-Vida", 0, 10, 5)
        
        st.divider()
        
        recommendations = st.text_area("Recomendações", height=150, 
            placeholder="Descreva as recomendações para mitigação dos riscos identificados...")
        
        if st.button("📝 Salvar Avaliação", key="save_assessment"):
            st.success("✅ Avaliação de risco salva com sucesso!")

# Página de Relatórios
elif selected == "📈 Relatórios":
    st.markdown("<h1 class='header-title'>📈 Relatórios e Exportação</h1>", unsafe_allow_html=True)
    
    report_type = st.selectbox(
        "Tipo de Relatório",
        ["💰 Receita", "📄 Propostas", "🛡️ Avaliação de Riscos", "📋 Auditoria", "✅ Conformidade NR-01"]
    )
    
    col1, col2 = st.columns(2)
    
    with col1:
        start_date = st.date_input("Data Inicial")
    with col2:
        end_date = st.date_input("Data Final")
    
    if st.button("📈 Gerar Relatório", key="gen_report"):
        with st.spinner("Gerando relatório..."):
            st.success(f"✅ Relatório de {report_type} gerado com sucesso!")
            
            st.divider()
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.download_button(
                    label="📥 Baixar PDF",
                    data=b"PDF content here",
                    file_name=f"relatorio_{report_type.replace(' ', '_')}.pdf",
                    mime="application/pdf"
                )
            
            with col2:
                st.download_button(
                    label="📊 Baixar Excel",
                    data=b"Excel content here",
                    file_name=f"relatorio_{report_type.replace(' ', '_')}.xlsx",
                    mime="application/vnd.ms-excel"
                )
            
            with col3:
                st.download_button(
                    label="📄 Baixar CSV",
                    data=b"CSV content here",
                    file_name=f"relatorio_{report_type.replace(' ', '_')}.csv",
                    mime="text/csv"
                )

# Footer
st.divider()
st.markdown("""
<div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
    © 2025 Black Belt Consultoria - Sistema de Gestão Integrada<br>
    Versão 1.0.0 | Desenvolvido com ❤️ usando Streamlit
</div>
""", unsafe_allow_html=True)
