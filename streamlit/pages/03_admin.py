import streamlit as st
import pandas as pd
import sys
import os

sys.path.insert(0, 'utils')
from services_manager import manager

st.set_page_config(
    page_title="Admin - Black Belt",
    page_icon="⚙️",
    layout="wide"
)

st.markdown("<h1 style='color: #1f1f1f;'>⚙️ Painel de Administração</h1>", unsafe_allow_html=True)

tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "📋 Listar",
    "➕ Novo",
    "✏️ Editar",
    "🗑️ Deletar",
    "📤 Importar/Exportar"
])

# ===== TAB 1: LISTAR =====
with tab1:
    st.subheader("📋 Todos os Serviços")
    
    col1, col2 = st.columns([3, 1])
    
    with col2:
        if st.button("🔄 Atualizar"):
            st.rerun()
    
    services = manager.get_all_services()
    
    if services:
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
        
        st.dataframe(df, use_container_width=True)
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Total", len(services))
        with col2:
            st.metric("Preço Médio", f"R\$ {sum(s['price'] for s in services)/len(services):,.2f}")
        with col3:
            st.metric("Mínimo", f"R\$ {min(s['price'] for s in services):,.2f}")
        with col4:
            st.metric("Máximo", f"R\$ {max(s['price'] for s in services):,.2f}")
        
        st.divider()
        
        # Por categoria
        st.subheader("📊 Por Categoria")
        for cat in manager.get_categories():
            cat_services = manager.get_services_by_category(cat)
            st.write(f"**{cat}**: {len(cat_services)} serviços")
    else:
        st.warning("Nenhum serviço cadastrado")

# ===== TAB 2: NOVO =====
with tab2:
    st.subheader("➕ Novo Serviço")
    
    col1, col2 = st.columns(2)
    
    with col1:
        name = st.text_input("Nome", placeholder="Nome do serviço")
        price = st.number_input("Preço (R\$)", min_value=0.0, step=100.0)
        hours = st.number_input("Horas", min_value=0.5, step=0.5)
    
    with col2:
        cat_type = st.radio("Categoria", ["Existente", "Nova"])
        
        if cat_type == "Existente":
            category = st.selectbox("Selecione", manager.get_categories() or ["Geral"])
        else:
            category = st.text_input("Nova categoria")
    
    description = st.text_area("Descrição", height=80)
    
    if st.button("✅ Salvar"):
        if name and category:
            service = manager.add_service(name, price, hours, category, description)
            st.success(f"✅ '{name}' adicionado!")
            st.json(service)
        else:
            st.error("Preencha nome e categoria!")

# ===== TAB 3: EDITAR =====
with tab3:
    st.subheader("✏️ Editar Serviço")
    
    services = manager.get_all_services()
    
    if services:
        names = [s['name'] for s in services]
        selected = st.selectbox("Selecione", names)
        service = manager.get_service_by_name(selected)
        
        if service:
            col1, col2 = st.columns(2)
            
            with col1:
                new_name = st.text_input("Nome", value=service['name'])
                new_price = st.number_input("Preço", value=service['price'], step=100.0)
            
            with col2:
                categories = manager.get_categories()
                idx = categories.index(service['category']) if service['category'] in categories else 0
                new_category = st.selectbox("Categoria", categories, index=idx)
                new_hours = st.number_input("Horas", value=service['hours'], step=0.5)
            
            new_desc = st.text_area("Descrição", value=service.get('description', ''), height=80)
            
            if st.button("💾 Atualizar"):
                manager.update_service(
                    service['id'],
                    name=new_name,
                    price=new_price,
                    hours=new_hours,
                    category=new_category,
                    description=new_desc
                )
                st.success("✅ Atualizado!")
                st.rerun()

# ===== TAB 4: DELETAR =====
with tab4:
    st.subheader("🗑️ Deletar Serviço")
    st.warning("⚠️ IRREVERSÍVEL!")
    
    services = manager.get_all_services()
    
    if services:
        names = [s['name'] for s in services]
        selected = st.selectbox("Selecione", names)
        service = manager.get_service_by_name(selected)
        
        if service:
            st.write(f"**{service['name']}** - R\$ {service['price']:,.2f}")
            
            if st.button("🗑️ Deletar"):
                manager.delete_service(service['id'])
                st.success("✅ Deletado!")
                st.balloons()
                st.rerun()

# ===== TAB 5: IMPORTAR/EXPORTAR =====
with tab5:
    st.subheader("📤 Importar/Exportar")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.write("**📥 Exportar**")
        
        services = manager.get_all_services()
        
        if services:
            df = pd.DataFrame([
                {
                    "ID": s['id'],
                    "Nome": s['name'],
                    "Preço": f"{s['price']}",
                    "Horas": s['hours'],
                    "Categoria": s['category']
                }
                for s in services
            ])
            
            csv = df.to_csv(index=False)
            
            st.download_button(
                label="📥 Baixar CSV",
                data=csv,
                file_name="servicos_blackbelt.csv",
                mime="text/csv"
            )
    
    with col2:
        st.write("**📤 Importar**")
        uploaded_file = st.file_uploader("Upload CSV", type=['csv'])
        
        if uploaded_file:
            df = pd.read_csv(uploaded_file)
            st.dataframe(df)
            
            if st.button("✅ Importar"):
                st.info("Funcionalidade em desenvolvimento")
