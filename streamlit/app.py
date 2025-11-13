import streamlit as st
from streamlit_option_menu import option_menu
import pandas as pd
import os
import sys
from datetime import datetime

sys.path.insert(0, 'utils')
from services_manager import manager

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

# ===== CARREGANDO SERVIÇOS DO BANCO =====
@st.cache_data(ttl=60)
def load_services():
    return manager.get_all_services()

def get_service_names():
    services = load_services()
    return [s["name"] for s in services]

def get_service_by_name(name):
    services = load_services()
    for s in services:
        if s["name"] == name:
            return s
    return None

# Sidebar
with st.sidebar:
    st.title("🔷 Black Belt")
    st.markdown("---")
    st.write("**Plataforma de Gestão Integrada**")
    st.markdown("---")
    
    selected = option_menu(
        "Menu Principal",
        ["Dashboard", "Precificação", "Propostas", "Avaliação de Riscos", "Relatórios"],
        icons=["bar-chart", "calculator", "file-text", "shield", "chart-line"],
        menu_icon="cast",
        default_index=0
    )

# ===== DASHBOARD =====
if selected == "Dashboard":
    st.markdown("<h1 class='header-title'>📊 Dashboard</h1>", unsafe_allow_html=True)
    st.write("Bem-vindo à plataforma Black Belt!")
    
    services = load_services()
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total de Serviços", len(services))
    with col2:
        st.metric("Propostas Aprovadas", "3")
    with col3:
        preço_máx = max([s['price'] for s in services]) if services else 0
        st.metric("Maior Serviço", f"R\$ {preço_máx:,.0f}")
    with col4:
        st.metric("Taxa de Conversão", "60%")
    
    st.divider()
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📈 Serviços por Categoria")
        categories = manager.get_categories()
        cat_data = {"Categoria": [], "Qtd": []}
        
        for cat in categories:
            cat_services = manager.get_services_by_category(cat)
            cat_data["Categoria"].append(cat)
            cat_data["Qtd"].append(len(cat_services))
        
        df_cat = pd.DataFrame(cat_data)
        if not df_cat.empty:
            st.bar_chart(df_cat.set_index("Categoria"))
    
    with col2:
        st.subheader("💰 Distribuição de Preços")
        if services:
            prices = [s['price'] for s in services]
            st.write(f"Mínimo: R\$ {min(prices):,.2f}")
            st.write(f"Máximo: R\$ {max(prices):,.2f}")
            st.write(f"Média: R\$ {sum(prices)/len(prices):,.2f}")

# ===== PRECIFICAÇÃO =====
elif selected == "Precificação":
    st.markdown("<h1 class='header-title'>🧮 Calculadora de Precificação</h1>", unsafe_allow_html=True)
    
    tab1, tab2, tab3 = st.tabs(["📋 Catálogo", "🔢 Calcular", "📊 Análise"])
    
    with tab1:
        st.subheader("📋 Catálogo Completo de Serviços")
        
        services = load_services()
        categories = manager.get_categories()
        
        for category in categories:
            services_cat = manager.get_services_by_category(category)
            
            st.write(f"**{category}** ({len(services_cat)} serviços)")
            
            df_cat = pd.DataFrame([
                {
                    "Serviço": s['name'],
                    "Preço": f"R\$ {s['price']:,.2f}",
                    "Horas": f"{s['hours']}h",
                    "ID": s['id']
                }
                for s in services_cat
            ])
            
            st.dataframe(df_cat, use_container_width=True, hide_index=True)
            st.divider()
    
    with tab2:
        st.subheader("🔢 Calcular Preço")
        
        col1, col2 = st.columns(2)
        
        with col1:
            service_name = st.selectbox("Selecione o Serviço", get_service_names())
            quantity = st.number_input("Quantidade", min_value=1, value=1)
            discount = st.slider("Desconto (%)", 0, 50, 0)
        
        service = get_service_by_name(service_name)
        
        with col2:
            if service:
                st.metric("Preço Unitário", f"R\$ {service['price']:,.2f}")
                st.metric("Horas", f"{service['hours']}h")
                st.metric("Categoria", service['category'])
        
        if st.button("🔢 Calcular Total"):
            if service:
                subtotal = service['price'] * quantity
                discount_amount = subtotal * (discount / 100)
                total = subtotal - discount_amount
                
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Subtotal", f"R\$ {subtotal:,.2f}")
                with col2:
                    st.metric("Desconto", f"-R\$ {discount_amount:,.2f}")
                with col3:
                    st.metric("Total", f"R\$ {total:,.2f}", delta=f"-{discount}%")
    
    with tab3:
        st.subheader("📊 Análise de Preços")
        
        services = load_services()
        if services:
            prices = [s['price'] for s in services]
            
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Total de Serviços", len(services))
            with col2:
                st.metric("Preço Mínimo", f"R\$ {min(prices):,.2f}")
            with col3:
                st.metric("Preço Máximo", f"R\$ {max(prices):,.2f}")
            with col4:
                st.metric("Preço Médio", f"R\$ {sum(prices)/len(prices):,.2f}")

# ===== PROPOSTAS =====
elif selected == "Propostas":
    st.markdown("<h1 class='header-title'>📄 Gerenciador de Propostas</h1>", unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["📋 Criar Proposta", "📊 Histórico"])
    
    with tab1:
        st.subheader("✨ Criar Nova Proposta")
        
        col1, col2 = st.columns(2)
        
        with col1:
            client_name = st.text_input("Nome do Cliente", placeholder="Ex: Empresa XYZ Ltda")
            client_email = st.text_input("Email", placeholder="contato@empresa.com")
        
        with col2:
            proposal_title = st.text_input("Título da Proposta")
            proposal_date = st.date_input("Data")
        
        st.divider()
        st.subheader("📦 Itens da Proposta")
        
        num_items = st.number_input("Quantos itens?", 1, 10, 1)
        
        items = []
        total_proposal = 0
        
        for i in range(num_items):
            st.write(f"**Item {i+1}**")
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                service_selected = st.selectbox(
                    f"Serviço {i+1}",
                    get_service_names(),
                    key=f"service_{i}"
                )
            
            service = get_service_by_name(service_selected)
            
            with col2:
                quantity = st.number_input(f"Qtd {i+1}", 1, 100, 1, key=f"qty_{i}")
            
            with col3:
                discount = st.slider(f"Desc% {i+1}", 0, 50, 0, key=f"disc_{i}")
            
            if service:
                item_total = service['price'] * quantity * (1 - discount/100)
                total_proposal += item_total
                st.write(f"→ Subtotal: **R\$ {item_total:,.2f}**")
                
                items.append({
                    "service": service_selected,
                    "quantity": quantity,
                    "price": service['price'],
                    "total": item_total
                })
            
            st.divider()
        
        col1, col2 = st.columns(2)
        
        with col1:
            general_discount = st.number_input("Desconto Geral (R\$)", 0.0)
        
        with col2:
            displacement = st.number_input("Taxa Deslocamento (R\$)", 0.0)
        
        final_total = total_proposal - general_discount + displacement
        
        st.metric("💰 Valor Final", f"R\$ {final_total:,.2f}")
        
        if st.button("✅ Criar Proposta"):
            st.success("✅ Proposta criada com sucesso!")
            st.json({
                "cliente": client_name,
                "titulo": proposal_title,
                "itens": len(items),
                "valor_total": final_total
            })
    
    with tab2:
        st.subheader("📊 Propostas Recentes")
        st.info("Histórico de propostas criadas (funcionalidade em desenvolvimento)")

# ===== AVALIAÇÃO DE RISCOS =====
elif selected == "Avaliação de Riscos":
    st.markdown("<h1 class='header-title'>🛡️ Avaliação de Riscos NR-01</h1>", unsafe_allow_html=True)
    
    st.write("Módulo de avaliação de riscos psicossociais")

# ===== RELATÓRIOS =====
elif selected == "Relatórios":
    st.markdown("<h1 class='header-title'>📊 Relatórios</h1>", unsafe_allow_html=True)
    
    services = load_services()
    
    st.subheader("📈 Resumo de Serviços")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Total de Serviços", len(services))
    
    with col2:
        if services:
            st.metric("Preço Médio", f"R\$ {sum(s['price'] for s in services)/len(services):,.2f}")
    
    with col3:
        if services:
            st.metric("Valor Total", f"R\$ {sum(s['price'] for s in services):,.2f}")

st.divider()
st.markdown("""
<div style='text-align: center; color: #666; font-size: 12px; padding: 20px;'>
    <p>🔷 Black Belt Platform v1.1.0 | © 2025</p>
</div>
""", unsafe_allow_html=True)
