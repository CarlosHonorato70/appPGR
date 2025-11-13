import streamlit as st
import pandas as pd
import sys
import os

sys.path.insert(0, 'utils')
from services_manager import manager

st.set_page_config(
    page_title="⚙️ Admin - Black Belt",
    page_icon="⚙️",
    layout="wide"
)

st.markdown("""
<style>
    .header-admin {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 10px;
        color: white;
        margin-bottom: 20px;
    }
    .service-card {
        background-color: #f0f2f6;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #667eea;
        margin-bottom: 10px;
    }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class='header-admin'>
    <h1>⚙️ Painel de Administração</h1>
    <p>Gerencie os 18 serviços da Black Belt Consultoria</p>
</div>
""", unsafe_allow_html=True)

tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "📋 Listar Todos",
    "✏️ Editar Preço",
    "➕ Novo Serviço",
    "🗑️ Deletar",
    "📊 Relatório"
])

# ===== TAB 1: LISTAR TODOS =====
with tab1:
    st.subheader("📋 Todos os 18 Serviços")
    
    services = manager.get_all_services()
    
    if services:
        col1, col2 = st.columns([3, 1])
        
        with col2:
            if st.button("🔄 Atualizar", key="refresh"):
                st.rerun()
        
        # Métricas gerais
        col1, col2, col3, col4, col5 = st.columns(5)
        
        with col1:
            st.metric("Total", len(services))
        
        with col2:
            preços = [s['price'] for s in services]
            st.metric("Mínimo", f"R\$ {min(preços):,.0f}")
        
        with col3:
            st.metric("Máximo", f"R\$ {max(preços):,.0f}")
        
        with col4:
            st.metric("Médio", f"R\$ {sum(preços)/len(preços):,.0f}")
        
        with col5:
            st.metric("Valor Total", f"R\$ {sum(preços):,.0f}")
        
        st.divider()
        
        # Tabela principal
        st.subheader("Tabela de Serviços")
        
        df = pd.DataFrame([
            {
                "ID": s['id'],
                "Nome": s['name'],
                "Preço": f"R\$ {s['price']:,.2f}",
                "Horas": f"{s['hours']}h",
                "Categoria": s['category']
            }
            for s in services
        ])
        
        st.dataframe(df, use_container_width=True, hide_index=True)
        
        st.divider()
        
        # Por categoria
        st.subheader("📊 Análise por Categoria")
        
        categories = manager.get_categories()
        cols = st.columns(len(categories))
        
        for idx, category in enumerate(categories):
            cat_services = manager.get_services_by_category(category)
            cat_total = sum(s['price'] for s in cat_services)
            
            with cols[idx]:
                st.metric(
                    category,
                    f"{len(cat_services)} srv",
                    f"R\$ {cat_total:,.0f}"
                )
        
        st.divider()
        
        # Detalhe por categoria
        for category in categories:
            cat_services = manager.get_services_by_category(category)
            
            with st.expander(f"**{category}** ({len(cat_services)} serviços)"):
                for service in cat_services:
                    st.markdown(f"""
                    <div class='service-card'>
                        <b>{service['name']}</b><br>
                    </div>
                    """, unsafe_allow_html=True)

# ===== TAB 2: EDITAR PREÇO =====
with tab2:
    st.subheader("✏️ Editar Preço de Serviço")
    st.write("Selecione um serviço para alterar seu preço ou horas")
    
    services = manager.get_all_services()
    
    if services:
        # Busca por nome
        search = st.text_input("🔍 Buscar serviço", placeholder="Digite o nome do serviço")
        
        if search:
            filtered = [s for s in services if search.lower() in s['name'].lower()]
        else:
            filtered = services
        
        if filtered:
            selected_name = st.selectbox(
                "Selecione o serviço",
                [s['name'] for s in filtered]
            )
            
            service = manager.get_service_by_name(selected_name)
            
            if service:
                st.write(f"**ID:** {service['id']}")
                st.write(f"**Categoria:** {service['category']}")
                
                st.divider()
                
                col1, col2 = st.columns(2)
                
                with col1:
                    st.write("**Valores Atuais:**")
                    st.metric("Preço", f"R\$ {service['price']:,.2f}")
                    st.metric("Horas", f"{service['hours']}h")
                
                with col2:
                    st.write("**Novos Valores:**")
                    new_price = st.number_input(
                        "Preço (R\$)",
                        value=service['price'],
                        step=50.0,
                        min_value=0.0
                    )
                    new_hours = st.number_input(
                        "Horas",
                        value=service['hours'],
                        step=0.5,
                        min_value=0.5
                    )
                
                st.divider()
                
                # Botões de ação
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    if st.button("💾 Salvar Alterações", key="save_edit", use_container_width=True):
                        manager.update_service(
                            service['id'],
                            price=new_price,
                            hours=new_hours
                        )
                        st.success(f"✅ '{service['name']}' atualizado!")
                        st.balloons()
                        st.rerun()
                
                with col2:
                    if st.button("↩️ Cancelar", key="cancel_edit", use_container_width=True):
                        st.rerun()
                
                with col3:
                    st.write("")  # Espaço
        else:
            st.warning("Nenhum serviço encontrado")
    else:
        st.error("Nenhum serviço cadastrado")

# ===== TAB 3: NOVO SERVIÇO =====
with tab3:
    st.subheader("➕ Adicionar Novo Serviço")
    
    col1, col2 = st.columns(2)
    
    with col1:
        name = st.text_input("Nome do Serviço", placeholder="Ex: Auditoria de Segurança")
        price = st.number_input("Preço (R\$)", min_value=0.0, step=100.0, value=5000.0)
        hours = st.number_input("Horas Estimadas", min_value=0.5, step=0.5, value=40.0)
    
    with col2:
        categories = manager.get_categories()
        cat_option = st.radio("Categoria", ["Existente", "Nova"], horizontal=True)
        
        if cat_option == "Existente":
            category = st.selectbox("Selecione a categoria", categories or ["Geral"])
        else:
            category = st.text_input("Nome da nova categoria")
    
    description = st.text_area(
        "Descrição (opcional)",
        placeholder="Descreva o serviço...",
        height=80
    )
    
    st.divider()
    
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("✅ Adicionar Serviço", key="add_new", use_container_width=True):
            if not name:
                st.error("❌ Nome é obrigatório!")
            elif not category:
                st.error("❌ Categoria é obrigatória!")
            else:
                new_service = manager.add_service(
                    name=name,
                    price=price,
                    hours=hours,
                    category=category,
                    description=description
                )
                st.success(f"✅ '{name}' adicionado com sucesso!")
                st.json(new_service)
                st.rerun()
    
    with col2:
        st.info("ℹ️ Preencha todos os campos obrigatórios")

# ===== TAB 4: DELETAR =====
with tab4:
    st.subheader("🗑️ Deletar Serviço")
    st.warning("⚠️ ATENÇÃO: Essa ação é IRREVERSÍVEL!")
    
    services = manager.get_all_services()
    
    if services:
        selected_name = st.selectbox(
            "Selecione o serviço para deletar",
            [s['name'] for s in services]
        )
        
        service = manager.get_service_by_name(selected_name)
        
        if service:
            st.markdown(f"""
            <div class='service-card'>
                <b>{service['name']}</b><br>
                💰 R\$ {service['price']:,.2f} | ⏱️ {service['hours']}h<br>
                📁 {service['category']}
            </div>
            """, unsafe_allow_html=True)
            
            st.divider()
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                if st.button("🗑️ Deletar Permanentemente", key="delete", use_container_width=True):
                    manager.delete_service(service['id'])
                    st.success("✅ Serviço deletado!")
                    st.balloons()
                    st.rerun()
            
            with col2:
                st.warning("Não há volta!")
            
            with col3:
                st.write("")
    else:
        st.error("Nenhum serviço cadastrado")

# ===== TAB 5: RELATÓRIO =====
with tab5:
    st.subheader("📊 Relatório de Serviços")
    
    services = manager.get_all_services()
    
    if services:
        col1, col2 = st.columns(2)
        
        with col1:
            st.write("**📥 Exportar Dados**")
            
            df = pd.DataFrame([
                {
                    "ID": s['id'],
                    "Nome": s['name'],
                    "Preço": s['price'],
                    "Horas": s['hours'],
                    "Categoria": s['category']
                }
                for s in services
            ])
            
            csv = df.to_csv(index=False)
            
            st.download_button(
                label="📥 Baixar CSV",
                data=csv,
                file_name="servicos_blackbelt_export.csv",
                mime="text/csv"
            )
        
        with col2:
            st.write("**📊 Resumo Geral**")
            
            preços = [s['price'] for s in services]
            
            st.write(f"""
            - **Total de Serviços:** {len(services)}
            - **Valor Total:** R\$ {sum(preços):,.2f}
            - **Preço Médio:** R\$ {sum(preços)/len(preços):,.2f}
            - **Preço Mínimo:** R\$ {min(preços):,.2f}
            - **Preço Máximo:** R\$ {max(preços):,.2f}
            """)
        
        st.divider()
        
        # Gráfico de distribuição
        st.write("**Distribuição de Preços por Categoria**")
        
        categories = manager.get_categories()
        chart_data = []
        
        for cat in categories:
            cat_services = manager.get_services_by_category(cat)
            chart_data.append({
                "Categoria": cat,
                "Total": sum(s['price'] for s in cat_services),
                "Qtd": len(cat_services)
            })
        
        df_chart = pd.DataFrame(chart_data)
        
        st.bar_chart(df_chart.set_index("Categoria")["Total"])
        
        st.dataframe(df_chart, use_container_width=True)

st.divider()
st.markdown("""
<div style='text-align: center; color: #666; font-size: 12px;'>
    <p>🔷 Black Belt - Painel Administrativo | © 2025</p>
</div>
""", unsafe_allow_html=True)
