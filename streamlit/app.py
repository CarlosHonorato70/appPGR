import streamlit as st
from streamlit_option_menu import option_menu
import pandas as pd
import os
import sys
from datetime import datetime
import plotly.graph_objects as go
import plotly.express as px

sys.path.insert(0, 'utils')
from services_manager import manager
from proposals_manager import proposals_manager
from risk_assessments_manager import risk_assessments_manager

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
    .risk-card-baixo {
        background-color: #d4edda;
        border-left: 4px solid #28a745;
    }
    .risk-card-medio {
        background-color: #fff3cd;
        border-left: 4px solid #ffc107;
    }
    .risk-card-alto {
        background-color: #f8d7da;
        border-left: 4px solid #dc3545;
    }
    .risk-card-muito_alto {
        background-color: #f5c6cb;
        border-left: 4px solid #721c24;
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
    assessments = risk_assessments_manager.get_all_assessments()
    
    col1, col2, col3, col4, col5 = st.columns(5)
    
    with col1:
        st.metric("Serviços", len(services))
    with col2:
        propostas_aprovadas = len([p for p in proposals if p['status'] == 'approved'])
        st.metric("Propostas OK", propostas_aprovadas)
    with col3:
        total_propostas = len(proposals)
        st.metric("Propostas", total_propostas)
    with col4:
        total_assessments = len(assessments)
        st.metric("Avaliações", total_assessments)
    with col5:
        if proposals:
            total_value = sum(p['final_total'] for p in proposals)
            st.metric("Faturamento", f"R\$ {total_value/1000:.0f}k")
    
    st.divider()
    
    col1, col2, col3 = st.columns(3)
    
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
            st.info("Nenhuma proposta criada")
    
    with col2:
        st.subheader("🛡️ Riscos por Nível")
        if assessments:
            risk_data = {"Nível": [], "Qtd": []}
            for level in ["Baixo", "Médio", "Alto", "Muito Alto"]:
                count = len([a for a in assessments if a['risk_level'] == level])
                if count > 0:
                    risk_data["Nível"].append(level)
                    risk_data["Qtd"].append(count)
            
            if risk_data["Nível"]:
                df_risk = pd.DataFrame(risk_data)
                st.bar_chart(df_risk.set_index("Nível"))
        else:
            st.info("Nenhuma avaliação criada")
    
    with col3:
        st.subheader("💰 Valor Total")
        if proposals:
            total_value = sum(p['final_total'] for p in proposals)
            st.metric("Propostas", f"R\$ {total_value:,.2f}")
            
            avg_value = total_value / len(proposals)
            st.metric("Média", f"R\$ {avg_value:,.2f}")
        else:
            st.info("Nenhuma proposta")

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
    st.markdown("<h1 class='header-title'>🛡️ Avaliação de Riscos Psicossociais NR-01</h1>", unsafe_allow_html=True)
    st.write("Avaliação de riscos psicossociais conforme NR-01")
    
    tab1, tab2, tab3, tab4 = st.tabs(["➕ Nova Avaliação", "📋 Histórico", "👁️ Visualizar", "📊 Relatório"])
    
    with tab1:
        st.subheader("➕ Criar Nova Avaliação")
        
        col1, col2 = st.columns(2)
        
        with col1:
            client_name = st.text_input("Nome do Cliente", placeholder="Ex: Empresa XYZ Ltda", key="risk_client")
            sector = st.text_input("Setor/Ramo", placeholder="Ex: Tecnologia, Indústria, Comércio")
            employees_count = st.number_input("Número de Funcionários", min_value=1, value=50)
        
        with col2:
            st.write("**Avaliação de Fatores**")
            st.write("*Escala: 0 (Excelente) - 10 (Péssimo)*")
        
        st.divider()
        
        st.subheader("📊 Dimensões da Avaliação")
        
        # Dimensão 1: Organização do Trabalho
        st.write("**Dimensão 1: Organização do Trabalho**")
        
        col1, col2 = st.columns(2)
        
        with col1:
            workload = st.slider(
                "Carga de Trabalho (0-10)",
                0, 10, 5,
                help="0=Carga apropriada | 10=Sobrecarga extrema"
            )
        
        with col2:
            work_pace = st.slider(
                "Ritmo de Trabalho (0-10)",
                0, 10, 5,
                help="0=Ritmo adequado | 10=Ritmo acelerado"
            )
        
        col1, col2 = st.columns(2)
        
        with col1:
            scheduling = st.slider(
                "Jornada Excessiva (0-10)",
                0, 10, 3,
                help="0=Jornada normal | 10=Jornada extrema"
            )
        
        with col2:
            work_breaks = st.slider(
                "Falta de Pausas (0-10)",
                0, 10, 4,
                help="0=Pausas adequadas | 10=Sem pausas"
            )
        
        st.divider()
        
        # Dimensão 2: Condições de Trabalho
        st.write("**Dimensão 2: Condições e Ambiente de Trabalho**")
        
        col1, col2 = st.columns(2)
        
        with col1:
            work_control = st.slider(
                "Controle sobre o Trabalho (0-10)",
                0, 10, 5,
                help="0=Alto controle | 10=Nenhum controle"
            )
        
        with col2:
            autonomy = st.slider(
                "Autonomia (0-10)",
                0, 10, 5,
                help="0=Alta autonomia | 10=Sem autonomia"
            )
        
        col1, col2 = st.columns(2)
        
        with col1:
            physical_conditions = st.slider(
                "Condições Físicas do Ambiente (0-10)",
                0, 10, 4,
                help="0=Excelentes | 10=Péssimas"
            )
        
        with col2:
            safety = st.slider(
                "Segurança Física (0-10)",
                0, 10, 3,
                help="0=Muito seguro | 10=Muito inseguro"
            )
        
        st.divider()
        
        # Dimensão 3: Relações Sociais
        st.write("**Dimensão 3: Relações Sociais e Suporte**")
        
        col1, col2 = st.columns(2)
        
        with col1:
            social_support = st.slider(
                "Apoio Social da Equipe (0-10)",
                0, 10, 6,
                help="0=Alto apoio | 10=Nenhum apoio"
            )
        
        with col2:
            management_support = st.slider(
                "Apoio da Gestão (0-10)",
                0, 10, 5,
                help="0=Gestão apoiadora | 10=Gestão ausente"
            )
        
        col1, col2 = st.columns(2)
        
        with col1:
            communication = st.slider(
                "Comunicação Interna (0-10)",
                0, 10, 5,
                help="0=Excelente | 10=Péssima"
            )
        
        with col2:
            workplace_violence = st.slider(
                "Risco de Violência (0-10)",
                0, 10, 2,
                help="0=Nenhum risco | 10=Alto risco"
            )
        
        st.divider()
        
        # Dimensão 4: Perspectivas de Futuro
        st.write("**Dimensão 4: Perspectivas de Futuro e Desenvolvimento**")
        
        col1, col2 = st.columns(2)
        
        with col1:
            job_security = st.slider(
                "Segurança no Emprego (0-10)",
                0, 10, 5,
                help="0=Seguro | 10=Muito inseguro"
            )
        
        with col2:
            career_development = st.slider(
                "Desenvolvimento Profissional (0-10)",
                0, 10, 4,
                help="0=Alto desenvolvimento | 10=Nenhum desenvolvimento"
            )
        
        col1, col2 = st.columns(2)
        
        with col1:
            recognition = st.slider(
                "Reconhecimento (0-10)",
                0, 10, 5,
                help="0=Bem reconhecido | 10=Não reconhecido"
            )
        
        with col2:
            fairness = st.slider(
                "Equidade de Tratamento (0-10)",
                0, 10, 4,
                help="0=Muito justo | 10=Muito injusto"
            )
        
        st.divider()
        
        # Recomendações
        st.subheader("💡 Recomendações")
        recommendations = st.text_area(
            "Descreva as recomendações para melhorias",
            placeholder="Ex: Reduzir carga de trabalho, implementar programa de bem-estar, melhorar comunicação...",
            height=100
        )
        
        # Ações Preventivas
        st.subheader("🛡️ Ações Preventivas")
        preventive_actions = st.text_area(
            "Descreva as ações preventivas a serem implementadas",
            placeholder="Ex: Treinamento de liderança, programa de saúde mental, política de flexibilidade...",
            height=100
        )
        
        st.divider()
        
        # Botão de salvamento
        if st.button("✅ Salvar Avaliação", key="save_assessment"):
            if not client_name:
                st.error("❌ Nome do cliente é obrigatório!")
            elif not sector:
                st.error("❌ Setor é obrigatório!")
            elif not recommendations:
                st.error("❌ Recomendações são obrigatórias!")
            elif not preventive_actions:
                st.error("❌ Ações preventivas são obrigatórias!")
            else:
                # Estruturar fatores
                factors = {
                    "Carga de Trabalho": workload,
                    "Ritmo de Trabalho": work_pace,
                    "Jornada Excessiva": scheduling,
                    "Falta de Pausas": work_breaks,
                    "Controle do Trabalho": work_control,
                    "Autonomia": autonomy,
                    "Condições Físicas": physical_conditions,
                    "Segurança Física": safety,
                    "Apoio da Equipe": social_support,
                    "Apoio da Gestão": management_support,
                    "Comunicação": communication,
                    "Risco de Violência": workplace_violence,
                    "Segurança no Emprego": job_security,
                    "Desenvolvimento Profissional": career_development,
                    "Reconhecimento": recognition,
                    "Equidade": fairness
                }
                
                new_assessment = risk_assessments_manager.add_assessment(
                    client_name=client_name,
                    sector=sector,
                    employees_count=int(employees_count),
                    factors=factors,
                    recommendations=recommendations,
                    preventive_actions=preventive_actions
                )
                
                st.success("✅ Avaliação salva com sucesso!")
                
                score, level = new_assessment['risk_score'], new_assessment['risk_level']
                
                st.metric("Score de Risco", f"{score}/100")
                st.metric("Nível de Risco", level)
                
                st.balloons()
    
    with tab2:
        st.subheader("📋 Histórico de Avaliações")
        
        assessments = risk_assessments_manager.get_all_assessments()
        
        if assessments:
            # Métricas
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Total", len(assessments))
            
            with col2:
                avg_score = sum(a['risk_score'] for a in assessments) / len(assessments)
                st.metric("Score Médio", f"{avg_score:.1f}")
            
            with col3:
                max_score = max(a['risk_score'] for a in assessments)
                st.metric("Score Máximo", f"{max_score:.1f}")
            
            with col4:
                min_score = min(a['risk_score'] for a in assessments)
                st.metric("Score Mínimo", f"{min_score:.1f}")
            
            st.divider()
            
            # Tabela
            df_assessments = pd.DataFrame([
                {
                    "ID": a['id'][:8],
                    "Cliente": a['client_name'],
                    "Setor": a['sector'],
                    "Funcionários": a['employees_count'],
                    "Score": f"{a['risk_score']:.1f}",
                    "Nível": a['risk_level'],
                    "Data": a['created_at'][:10]
                }
                for a in assessments
            ])
            
            st.dataframe(df_assessments, use_container_width=True, hide_index=True)
            
            st.divider()
            
            # Filtros
            col1, col2, col3 = st.columns(3)
            
            with col1:
                search_client = st.text_input("🔍 Buscar cliente")
            
            with col2:
                filter_sector = st.selectbox(
                    "Filtrar por setor",
                    ["Todos"] + list(set(a['sector'] for a in assessments))
                )
            
            with col3:
                filter_level = st.selectbox(
                    "Filtrar por nível de risco",
                    ["Todos", "Baixo", "Médio", "Alto", "Muito Alto"]
                )
            
            # Aplicar filtros
            filtered = assessments
            
            if search_client:
                filtered = [a for a in filtered if search_client.lower() in a['client_name'].lower()]
            
            if filter_sector != "Todos":
                filtered = [a for a in filtered if a['sector'] == filter_sector]
            
            if filter_level != "Todos":
                filtered = [a for a in filtered if a['risk_level'] == filter_level]
            
            st.write(f"**{len(filtered)} avaliação(ões)**")
            
            for assessment in filtered:
                risk_class = f"risk-card-{assessment['risk_level'].lower().replace(' ', '_')}"
                
                st.markdown(f"""
                <div class='proposal-card {risk_class}'>
                    <b>{assessment['client_name']}</b><br>
                    📁 {assessment['sector']} | 👥 {assessment['employees_count']} funcionários<br>
                    📊 Score: {assessment['risk_score']:.1f}/100 | 🛡️ Risco: <b>{assessment['risk_level']}</b><br>
                    📅 {assessment['created_at'][:10]} | 🆔 {assessment['id'][:8]}
                </div>
                """, unsafe_allow_html=True)
        else:
            st.info("Nenhuma avaliação criada ainda")
    
    with tab3:
        st.subheader("👁️ Visualizar Avaliação Completa")
        
        assessments = risk_assessments_manager.get_all_assessments()
        
        if assessments:
            assessment_ids = [f"{a['id'][:8]} - {a['client_name']}" for a in assessments]
            selected_display = st.selectbox("Selecione uma avaliação", assessment_ids)
            
            selected_id = selected_display.split(" - ")[0]
            selected_assessment = None
            
            for a in assessments:
                if a['id'][:8] == selected_id:
                    selected_assessment = a
                    break
            
            if selected_assessment:
                # Header
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.write("**Cliente:**")
                    st.write(selected_assessment['client_name'])
                
                with col2:
                    st.write("**Setor:**")
                    st.write(selected_assessment['sector'])
                
                with col3:
                    st.write("**Funcionários:**")
                    st.write(selected_assessment['employees_count'])
                
                st.divider()
                
                # Score de Risco
                col1, col2 = st.columns(2)
                
                with col1:
                    risk_score = selected_assessment['risk_score']
                    risk_level = selected_assessment['risk_level']
                    
                    st.metric("Score de Risco", f"{risk_score}/100")
                    st.metric("Nível de Risco", risk_level)
                
                with col2:
                    # Gauge chart
                    fig = go.Figure(go.Indicator(
                        mode="gauge+number",
                        value=risk_score,
                        domain={'x': [0, 100], 'y': [0, 100]},
                        title={'text': "Score"},
                        gauge={
                            'axis': {'range': [0, 100]},
                            'bar': {'color': "darkblue"},
                            'steps': [
                                {'range': [0, 25], 'color': "lightgray"},
                                {'range': [25, 50], 'color': "gray"},
                                {'range': [50, 75], 'color': "orange"},
                                {'range': [75, 100], 'color': "red"}
                            ],
                            'threshold': {
                                'line': {'color': "red", 'width': 4},
                                'thickness': 0.75,
                                'value': 90
                            }
                        }
                    ))
                    
                    fig.update_layout(height=300)
                    st.plotly_chart(fig, use_container_width=True)
                
                st.divider()
                
                # Fatores
                st.subheader("📊 Análise dos Fatores")
                
                factors = selected_assessment['factors']
                factors_data = pd.DataFrame([
                    {
                        "Fator": key,
                        "Score (0-10)": value,
                        "Avaliação": "🔴 Crítico" if value >= 8 else "🟠 Alto" if value >= 6 else "🟡 Médio" if value >= 4 else "🟢 Baixo"
                    }
                    for key, value in factors.items()
                ])
                
                st.dataframe(factors_data, use_container_width=True, hide_index=True)
                
                st.divider()
                
                # Gráfico de fatores
                fig = px.bar(
                    factors_data,
                    x="Fator",
                    y="Score (0-10)",
                    title="Distribuição de Scores por Fator",
                    color="Score (0-10)",
                    color_continuous_scale="Reds"
                )
                
                fig.update_layout(height=400, xaxis_tickangle=-45)
                st.plotly_chart(fig, use_container_width=True)
                
                st.divider()
                
                # Recomendações
                st.subheader("💡 Recomendações")
                st.write(selected_assessment['recommendations'])
                
                st.divider()
                
                # Ações Preventivas
                st.subheader("🛡️ Ações Preventivas")
                st.write(selected_assessment['preventive_actions'])
                
                st.divider()
                
                # Data
                st.caption(f"Criada em: {selected_assessment['created_at']}")
        else:
            st.info("Nenhuma avaliação criada ainda")
    
    with tab4:
        st.subheader("📊 Relatório Geral de Avaliações")
        
        assessments = risk_assessments_manager.get_all_assessments()
        
        if assessments:
            # Resumo geral
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Total de Avaliações", len(assessments))
            
            with col2:
                avg_score = sum(a['risk_score'] for a in assessments) / len(assessments)
                st.metric("Score Médio", f"{avg_score:.1f}")
            
            with col3:
                total_employees = sum(a['employees_count'] for a in assessments)
                st.metric("Total de Funcionários", total_employees)
            
            with col4:
                risk_levels = {"Baixo": 0, "Médio": 0, "Alto": 0, "Muito Alto": 0}
                for a in assessments:
                    risk_levels[a['risk_level']] += 1
                
                critical = risk_levels["Alto"] + risk_levels["Muito Alto"]
                st.metric("Casos Críticos", critical)
            
            st.divider()
            
            # Gráfico de distribuição
            col1, col2 = st.columns(2)
            
            with col1:
                st.write("**Distribuição por Nível de Risco**")
                
                risk_counts = {"Baixo": 0, "Médio": 0, "Alto": 0, "Muito Alto": 0}
                for a in assessments:
                    risk_counts[a['risk_level']] += 1
                
                fig_risk = go.Figure(data=[
                    go.Pie(labels=list(risk_counts.keys()), values=list(risk_counts.values()))
                ])
                
                st.plotly_chart(fig_risk, use_container_width=True)
            
            with col2:
                st.write("**Scores de Risco**")
                
                scores_data = pd.DataFrame([
                    {"Cliente": a['client_name'], "Score": a['risk_score']}
                    for a in assessments
                ])
                
                fig_scores = px.bar(
                    scores_data,
                    x="Cliente",
                    y="Score",
                    title="Scores por Cliente",
                    color="Score",
                    color_continuous_scale="Reds"
                )
                
                fig_scores.update_layout(height=300)
                st.plotly_chart(fig_scores, use_container_width=True)
            
            st.divider()
            
            # Exportar dados
            st.write("**📥 Exportar Relatório**")
            
            export_df = pd.DataFrame([
                {
                    "Cliente": a['client_name'],
                    "Setor": a['sector'],
                    "Funcionários": a['employees_count'],
                    "Score": f"{a['risk_score']:.1f}",
                    "Nível": a['risk_level'],
                    "Data": a['created_at'][:10]
                }
                for a in assessments
            ])
            
            csv = export_df.to_csv(index=False)
            
            st.download_button(
                label="📥 Baixar CSV",
                data=csv,
                file_name="avaliacoes_risco_nr01.csv",
                mime="text/csv"
            )
        else:
            st.info("Nenhuma avaliação criada ainda")

# ===== RELATÓRIOS =====
elif selected == "Relatórios":
    st.markdown("<h1 class='header-title'>📊 Relatórios Gerais</h1>", unsafe_allow_html=True)
    
    services = load_services()
    proposals = proposals_manager.get_all_proposals()
    assessments = risk_assessments_manager.get_all_assessments()
    
    st.subheader("📈 Resumo Geral da Plataforma")
    
    col1, col2, col3, col4, col5 = st.columns(5)
    
    with col1:
        st.metric("Serviços", len(services))
    
    with col2:
        st.metric("Propostas", len(proposals))
    
    with col3:
        if proposals:
            approved = len([p for p in proposals if p['status'] == 'approved'])
            st.metric("Aprovadas", approved)
    
    with col4:
        st.metric("Avaliações", len(assessments))
    
    with col5:
        if proposals:
            total_value = sum(p['final_total'] for p in proposals)
            st.metric("Faturamento", f"R\$ {total_value/1000:.0f}k")

st.divider()
st.markdown("""
<div style='text-align: center; color: #666; font-size: 12px; padding: 20px;'>
</div>
""", unsafe_allow_html=True)
