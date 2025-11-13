import streamlit as st
from streamlit_option_menu import option_menu
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(
    page_title="Black Belt - Gestão Integrada",
    page_icon="⚫",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
<style>
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

# Sidebar
with st.sidebar:
    st.title("🔷 Black Belt")
    st.markdown("---")
    
    selected = option_menu(
        "Menu Principal",
        ["Dashboard", "Precificação", "Propostas", "Avaliação de Riscos", "Relatórios"],
        icons=["bar-chart", "calculator", "file-text", "shield", "chart-line"],
        menu_icon="cast",
        default_index=0,
        styles={
            "container": {"padding": "0!important", "background-color": "#fafafa"},
            "icon": {"color": "orange", "font-size": "25px"},
            "nav-link": {"font-size": "16px", "text-align": "left", "margin":"0px", "--hover-color": "#eee"},
            "nav-link-selected": {"background-color": "#1f1f1f"},
        }
    )

# Dashboard
if selected == "Dashboard":
    st.markdown("<h1 class='header-title'>📊 Dashboard</h1>", unsafe_allow_html=True)
    st.write("Bem-vindo à plataforma Black Belt!")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total de Propostas", "24", "+3 este mês")
    with col2:
        st.metric("Propostas Aprovadas", "18", "+2")
    with col3:
        st.metric("Valor Total", "R\$ 125.450", "+15%")
    with col4:
        st.metric("Taxa de Conversão", "75%", "+5%")
    
    st.divider()
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📈 Propostas por Status")
        status_data = {
            "Status": ["Draft", "Enviada", "Aprovada", "Rejeitada"],
            "Quantidade": [5, 7, 18, 3]
        }
        df = pd.DataFrame(status_data)
        st.bar_chart(df.set_index("Status"))
    
    with col2:
        st.subheader("💰 Receita Mensal")
        monthly_data = {
            "Mês": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
            "Receita": [15000, 18000, 22000, 19000, 25000, 28000]
        }
        df_monthly = pd.DataFrame(monthly_data)
        st.line_chart(df_monthly.set_index("Mês"))

# Precificação
elif selected == "Precificação":
    st.markdown("<h1 class='header-title'>🧮 Calculadora de Precificação</h1>", unsafe_allow_html=True)
    
    tab1, tab2, tab3 = st.tabs(["Parâmetros Base", "Calcular Item", "Histórico"])
    
    with tab1:
        st.subheader("Configurar Parâmetros de Precificação")
        
        col1, col2 = st.columns(2)
        
        with col1:
            fixed_costs = st.number_input("💰 Custos Fixos Mensais", value=5000.0, step=100.0)
            pro_labor = st.number_input("👨‍💼 Pró-labore Mensal", value=2000.0, step=100.0)
        
        with col2:
            productive_hours = st.number_input("⏰ Horas Produtivas/Mês", value=160.0, step=10.0)
            
        st.divider()
        st.subheader("📊 Taxas por Regime Tributário")
        
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
    
    with tab2:
        st.subheader("Calcular Item de Proposta")
        
        col1, col2 = st.columns(2)
        
        with col1:
            base_price = st.number_input("Preço Base", value=5000.0)
            estimated_hours = st.number_input("Horas Estimadas", value=40.0)
            tax_regime = st.selectbox("Regime Tributário", ["MEI", "Simples Nacional", "Lucro Presumido", "Autônomo"])
        
        with col2:
            adjustment_personalization = st.slider("Ajuste Personalização (%)", 0.0, 50.0, 0.0)
            adjustment_risk = st.slider("Ajuste Risco (%)", 0.0, 50.0, 0.0)
            adjustment_seniority = st.slider("Ajuste Senioridade (%)", 0.0, 50.0, 0.0)
        
        volume_discount = st.slider("Desconto por Volume (%)", 0.0, 50.0, 0.0)
        
        if st.button("🔢 Calcular", key="calc_item"):
            st.success("✅ Cálculo realizado!")
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric("Hora Técnica", "R\$ 125,00")
                st.metric("Valor c/ Impostos", "R\$ 132,50")
            
            with col2:
                st.metric("Valor Base", "R\$ 5.300,00")
                st.metric("Valor Ajustado", "R\$ 6.500,00")
            
            with col3:
                st.metric("Com Desconto", "R\$ 6.175,00")
    
    with tab3:
        st.info("📋 Histórico de Cálculos")
        st.write("Nenhum cálculo realizado ainda.")

# Propostas
elif selected == "Propostas":
    st.markdown("<h1 class='header-title'>📄 Gerenciador de Propostas</h1>", unsafe_allow_html=True)
    
    tab1, tab2, tab3 = st.tabs(["Listar", "Criar Nova", "Visualizar"])
    
    with tab1:
        st.subheader("Propostas Cadastradas")
        
        data = {
            "ID": ["PROP-001", "PROP-002", "PROP-003"],
            "Cliente": ["Empresa A", "Empresa B", "Empresa C"],
            "Status": ["Aprovada", "Enviada", "Draft"],
            "Valor": ["R\$ 15.000", "R\$ 22.000", "R\$ 8.500"],
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
        
        items = []
        for i in range(num_items):
            st.write(f"**Item {i+1}**")
            col1, col2, col3 = st.columns(3)
            
            with col1:
                service = st.selectbox(f"Serviço {i+1}", ["Consultoria", "Auditoria", "Treinamento"])
            with col2:
                hours = st.number_input(f"Horas {i+1}", value=40, key=f"hours_{i}")
            with col3:
                price = st.number_input(f"Preço {i+1}", value=5000.0, key=f"price_{i}")
            
            items.append({"service": service, "hours": hours, "price": price})
        
        st.divider()
        
        col1, col2 = st.columns(2)
        
        with col1:
            general_discount = st.number_input("Desconto Geral", value=0.0)
        with col2:
            displacement_fee = st.number_input("Taxa de Deslocamento", value=0.0)
        
        if st.button("✅ Criar Proposta", key="create_proposal"):
            st.success("✅ Proposta criada com sucesso!")
    
    with tab3:
        st.subheader("Visualizar Proposta")
        proposal_id = st.selectbox("Selecione uma Proposta", ["PROP-001", "PROP-002", "PROP-003"])
        
        st.write("**Informações Gerais**")
        col1, col2 = st.columns(2)
        
        with col1:
            st.write("📋 **Cliente**: Empresa A")
            st.write("📧 **Email**: contato@empresa.com")
        
        with col2:
            st.write("💰 **Valor Total**: R\$ 15.000,00")
            st.write("📅 **Data**: 15/01/2025")
        
        st.divider()
        
        st.write("**Itens da Proposta**")
        items_data = {
            "Serviço": ["Consultoria", "Auditoria"],
            "Horas": [40, 20],
            "Valor Unitário": ["R\$ 5.000", "R\$ 3.000"],
            "Total": ["R\$ 5.000", "R\$ 6.000"]
        }
        df_items = pd.DataFrame(items_data)
        st.dataframe(df_items, use_container_width=True)

# Avaliação de Riscos
elif selected == "Avaliação de Riscos":
    st.markdown("<h1 class='header-title'>🛡️ Avaliação de Riscos Psicossociais (NR-01)</h1>", unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["Avaliações", "Criar Nova"])
    
    with tab1:
        st.subheader("Avaliações Cadastradas")
        
        data = {
            "Cliente": ["Empresa A", "Empresa B", "Empresa C"],
            "Setor": ["TI", "Manufatura", "Comércio"],
            "Nível de Risco": ["Médio", "Alto", "Baixo"],
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
            risk_level = st.selectbox("Nível de Risco", ["Baixo", "Médio", "Alto", "Muito Alto"])
        
        st.divider()
        
        st.subheader("Fatores Psicossociais")
        
        factors = {
            "Carga de Trabalho": st.slider("Carga de Trabalho", 0, 10, 5),
            "Controle sobre Trabalho": st.slider("Controle sobre Trabalho", 0, 10, 5),
            "Apoio Social": st.slider("Apoio Social", 0, 10, 5),
            "Segurança no Emprego": st.slider("Segurança no Emprego", 0, 10, 5),
            "Relação Trabalho-Vida": st.slider("Relação Trabalho-Vida", 0, 10, 5)
        }
        
        st.divider()
        
        recommendations = st.text_area("Recomendações", height=150)
        
        if st.button("📝 Salvar Avaliação", key="save_assessment"):
            st.success("✅ Avaliação salva com sucesso!")

# Relatórios
elif selected == "Relatórios":
    st.markdown("<h1 class='header-title'>📊 Relatórios e Exportação</h1>", unsafe_allow_html=True)
    
    report_type = st.selectbox(
        "Tipo de Relatório",
        ["Receita", "Propostas", "Avaliação de Riscos", "Auditoria", "Conformidade NR-01"]
    )
    
    col1, col2 = st.columns(2)
    
    with col1:
        start_date = st.date_input("Data Inicial")
    with col2:
        end_date = st.date_input("Data Final")
    
    if st.button("📈 Gerar Relatório", key="gen_report"):
        st.info(f"Gerando relatório de {report_type}...")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.download_button(
                label="📥 Baixar PDF",
                data=b"PDF content here",
                file_name=f"relatorio_{report_type}.pdf",
                mime="application/pdf"
            )
        
        with col2:
            st.download_button(
                label="📊 Baixar Excel",
                data=b"Excel content here",
                file_name=f"relatorio_{report_type}.xlsx",
                mime="application/vnd.ms-excel"
            )
        
        with col3:
            st.download_button(
                label="📄 Baixar CSV",
                data=b"CSV content here",
                file_name=f"relatorio_{report_type}.csv",
                mime="text/csv"
            )
        
        st.divider()
        
        st.subheader("Resumo do Relatório")
        st.write("Dados do relatório aqui...")

# Footer
st.divider()
st.markdown("""
<div style='text-align: center; color: #666; font-size: 12px; padding: 20px;'>
</div>
""", unsafe_allow_html=True)
