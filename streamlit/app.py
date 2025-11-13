import streamlit as st
from streamlit_option_menu import option_menu
import pandas as pd
import os
import sys
from datetime import datetime

sys.path.insert(0, 'utils')
from services_manager import manager
from proposals_manager import proposals_manager

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
    .proposal-card {
        background-color: #f0f2f6;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #667eea;
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
    proposals = proposals_manager.get_all_proposals()
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total de Serviços", len(services))
    with col2:
        propostas_aprovadas = len([p for p in proposals if p['status'] == 'approved'])
        st.metric("Propostas Aprovadas", propostas_aprovadas)
    with col3:
        total_propostas = len(proposals)
        st.metric("Total de Propostas", total_propostas)
    with col4:
        draft_propostas = len([p for p in proposals if p['status'] == 'draft'])
        st.metric("Em Rascunho", draft_propostas)
    
    st.divider()
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📈 Propostas por Status")
        if proposals:
            status_data = {"Status": [], "Qtd": []}
            for status in ["draft", "sent", "approved", "rejected"]:
                count = len([p for p in proposals if p['status'] == status])
                if count > 0:
                    status_data["Status"].append(status.upper())
                    status_data["Qtd"].append(count)
            
            if status_data["Status"]:
                df_status = pd.DataFrame(status_data)
                st.bar_chart(df_status.set_index("Status"))
        else:
            st.info("Nenhuma proposta criada ainda")
    
    with col2:
        st.subheader("💰 Valor Total de Propostas")
        if proposals:
            total_value = sum(p['final_total'] for p in proposals)
            st.metric("Valor Total", f"R\$ {total_value:,.2f}")
            
            avg_value = total_value / len(proposals)
            st.metric("Valor Médio", f"R\$ {avg_value:,.2f}")
        else:
            st.info("Nenhuma proposta criada ainda")

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
                    "Preço": f"R\$ {float(s['price']):,.2f}",
                    "Horas": f"{float(s['hours'])}h",
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
                st.metric("Preço Unitário", f"R\$ {float(service['price']):,.2f}")
                st.metric("Horas", f"{float(service['hours'])}h")
                st.metric("Categoria", service['category'])
        
        if st.button("🔢 Calcular Total"):
            if service:
                subtotal = float(service['price']) * quantity
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
            prices = [float(s['price']) for s in services]
            
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
    
    tab1, tab2, tab3 = st.tabs(["📋 Criar Proposta", "📊 Histórico", "👁️ Visualizar"])
    
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
                item_total = float(service['price']) * quantity * (1 - discount/100)
                total_proposal += item_total
                st.write(f"→ Subtotal: **R\$ {item_total:,.2f}**")
                
                items.append({
                    "service_id": service['id'],
                    "service_name": service_selected,
                    "quantity": quantity,
                    "price": float(service['price']),
                    "discount_percent": discount,
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
        
        st.divider()
        
        if st.button("✅ Salvar Proposta", key="create_proposal"):
            if not client_name:
                st.error("❌ Nome do cliente é obrigatório!")
            elif not client_email:
                st.error("❌ Email do cliente é obrigatório!")
            elif not proposal_title:
                st.error("❌ Título da proposta é obrigatório!")
            elif not items:
                st.error("❌ Adicione pelo menos um item!")
            else:
                new_proposal = proposals_manager.add_proposal(
                    client_name=client_name,
                    client_email=client_email,
                    title=proposal_title,
                    items=items,
                    general_discount=general_discount,
                    displacement_fee=displacement,
                    proposal_date=str(proposal_date)
                )
                st.success("✅ Proposta salva com sucesso!")
                st.json({
                    "id": new_proposal['id'],
                    "cliente": client_name,
                    "titulo": proposal_title,
                    "itens": len(items),
                    "valor_total": f"R\$ {final_total:,.2f}",
                    "status": new_proposal['status']
                })
                st.balloons()
    
    with tab2:
        st.subheader("📊 Histórico de Propostas")
        
        proposals = proposals_manager.get_all_proposals()
        
        if proposals:
            df_proposals = pd.DataFrame([
                {
                    "ID": p['id'][:8],
                    "Cliente": p['client_name'],
                    "Título": p['title'],
                    "Status": p['status'].upper(),
                    "Valor": f"R\$ {float(p['final_total']):,.2f}",
                    "Data": p['proposal_date']
                }
                for p in proposals
            ])
            
            st.dataframe(df_proposals, use_container_width=True, hide_index=True)
            
            st.divider()
            
            # Filtro por status
            status_filter = st.selectbox(
                "Filtrar por status",
                ["Todos", "DRAFT", "SENT", "APPROVED", "REJECTED"]
            )
            
            if status_filter != "Todos":
                filtered_proposals = [p for p in proposals if p['status'].upper() == status_filter]
            else:
                filtered_proposals = proposals
            
            st.write(f"**{len(filtered_proposals)} proposta(s)**")
            
            for proposal in filtered_proposals:
                st.markdown(f"""
                <div class='proposal-card'>
                    <b>{proposal['title']}</b><br>
                    🆔 {proposal['id']} | Status: {proposal['status'].upper()}
                </div>
                """, unsafe_allow_html=True)
        else:
            st.info("Nenhuma proposta criada ainda")
    
    with tab3:
        st.subheader("👁️ Visualizar Proposta")
        
        proposals = proposals_manager.get_all_proposals()
        
        if proposals:
            proposal_ids = [f"{p['id'][:8]} - {p['title']}" for p in proposals]
            selected_proposal_display = st.selectbox("Selecione uma proposta", proposal_ids)
            
            selected_id = selected_proposal_display.split(" - ")[0]
            selected_proposal = None
            
            for p in proposals:
                if p['id'][:8] == selected_id:
                    selected_proposal = p
                    break
            
            if selected_proposal:
                col1, col2 = st.columns(2)
                
                with col1:
                    st.write("**Informações Gerais**")
                    st.write(f"📋 **Cliente:** {selected_proposal['client_name']}")
                    st.write(f"📧 **Email:** {selected_proposal['client_email']}")
                    st.write(f"📅 **Data:** {selected_proposal['proposal_date']}")
                
                with col2:
                    st.write("**Valores**")
                    st.write(f"💰 **Valor Bruto:** R\$ {float(selected_proposal['total_value']):,.2f}")
                    st.write(f"💵 **Desconto Geral:** -R\$ {float(selected_proposal['general_discount']):,.2f}")
                    st.write(f"🚗 **Taxa Deslocamento:** +R\$ {float(selected_proposal['displacement_fee']):,.2f}")
                    st.metric("Valor Final", f"R\$ {float(selected_proposal['final_total']):,.2f}")
                
                st.divider()
                
                st.write("**Itens da Proposta**")
                items_data = pd.DataFrame([
                    {
                        "Serviço": item['service_name'],
                        "Qtd": item['quantity'],
                        "Preço Unit": f"R\$ {float(item['price']):,.2f}",
                        "Desc%": f"{item['discount_percent']}%",
                        "Total": f"R\$ {float(item['total']):,.2f}"
                    }
                    for item in selected_proposal['items']
                ])
                st.dataframe(items_data, use_container_width=True, hide_index=True)
                
                st.divider()
                
                col1, col2, col3, col4 = st.columns(4)
                
                with col1:
                    if st.button("📤 Enviar", key="send_proposal"):
                        proposals_manager.update_proposal_status(selected_proposal['id'], 'sent')
                        st.success("✅ Proposta enviada!")
                        st.rerun()
                
                with col2:
                    if st.button("✅ Aprovar", key="approve_proposal"):
                        proposals_manager.update_proposal_status(selected_proposal['id'], 'approved')
                        st.success("✅ Proposta aprovada!")
                        st.rerun()
                
                with col3:
                    if st.button("❌ Rejeitar", key="reject_proposal"):
                        proposals_manager.update_proposal_status(selected_proposal['id'], 'rejected')
                        st.warning("⚠️ Proposta rejeitada!")
                        st.rerun()
                
                with col4:
                    if st.button("🗑️ Deletar", key="delete_proposal"):
                        proposals_manager.delete_proposal(selected_proposal['id'])
                        st.error("🗑️ Proposta deletada!")
                        st.rerun()
        else:
            st.info("Nenhuma proposta criada ainda")

# ===== AVALIAÇÃO DE RISCOS =====
elif selected == "Avaliação de Riscos":
    st.markdown("<h1 class='header-title'>🛡️ Avaliação de Riscos NR-01</h1>", unsafe_allow_html=True)
    st.write("Módulo de avaliação de riscos psicossociais (em desenvolvimento)")

# ===== RELATÓRIOS =====
elif selected == "Relatórios":
    st.markdown("<h1 class='header-title'>📊 Relatórios</h1>", unsafe_allow_html=True)
    
    services = load_services()
    proposals = proposals_manager.get_all_proposals()
    
    st.subheader("📈 Resumo Geral")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Total de Serviços", len(services))
    
    with col2:
        if services:
            st.metric("Preço Médio", f"R\$ {sum(float(s['price']) for s in services)/len(services):,.2f}")
    
    with col3:
        st.metric("Total de Propostas", len(proposals))

st.divider()
st.markdown("""
<div style='text-align: center; color: #666; font-size: 12px; padding: 20px;'>
    <p>🔷 Black Belt Platform v1.2.0 | © 2025</p>
</div>
""", unsafe_allow_html=True)
