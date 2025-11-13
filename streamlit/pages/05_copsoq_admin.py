import streamlit as st
import sys
sys.path.insert(0, 'utils')

from page_protector import protect_admin_page
import pandas as pd
from email_sender import send_invitation_email
import sqlite3
from datetime import datetime

protect_admin_page()

st.set_page_config(page_title="Admin COPSOQ-II", layout="wide")

st.title("📨 Admin COPSOQ-II")
st.markdown("---")

st.subheader("➕ Disparar Convites")

tab1, tab2 = st.tabs(["📧 Individual", "📊 Lote"])

# ========== TAB 1: INDIVIDUAL ==========
with tab1:
    st.markdown("**Envie um convite para um respondente:**")
    
    col1, col2 = st.columns(2)
    
    with col1:
        email = st.text_input("E-mail:", placeholder="respondente@empresa.com", key="invite_email")
    
    with col2:
        name = st.text_input("Nome:", placeholder="Nome completo", key="invite_name")
    
    if st.button("📧 Enviar Convite Individual", type="primary", use_container_width=True):
        if not email or not name:
            st.error("❌ Preencha email e nome!")
        else:
            try:
                send_invitation_email(email, name)
                st.success(f"✅ Convite enviado para {email}!")
                st.info(f"Respondente: {name}")
            except Exception as e:
                st.error(f"❌ Erro ao enviar: {e}")

# ========== TAB 2: LOTE ==========
with tab2:
    st.markdown("**Envie convites em lote via arquivo:**")
    st.info("""
    **Formato esperado:**
    - CSV ou Excel
    - Colunas: `email` e `nome`
    
    **Exemplo:**
    ```
    email,nome
    joao@empresa.com,Joao Silva
    maria@empresa.com,Maria Santos
    ```
    """)
    
    uploaded_file = st.file_uploader("Escolha arquivo (CSV/Excel):", type=["csv", "xlsx", "xls"], key="bulk_upload")
    
    if uploaded_file is not None:
        try:
            if uploaded_file.name.endswith('.csv'):
                df = pd.read_csv(uploaded_file)
            else:
                df = pd.read_excel(uploaded_file)
            
            df.columns = df.columns.str.lower()
            
            if "email" not in df.columns or "nome" not in df.columns:
                st.error("❌ Arquivo deve conter colunas: email, nome")
            else:
                df = df.dropna(subset=['email', 'nome'])
                
                st.markdown(f"**Preview ({len(df)} registros):**")
                st.dataframe(df, use_container_width=True)
                
                if st.button("📧 Enviar Lote", type="primary", use_container_width=True):
                    progress_bar = st.progress(0)
                    status_container = st.empty()
                    
                    success_count = 0
                    error_count = 0
                    errors = []
                    
                    for idx, (_, row) in enumerate(df.iterrows()):
                        try:
                            email_addr = str(row['email']).strip()
                            nome = str(row['nome']).strip()
                            send_invitation_email(email_addr, nome)
                            success_count += 1
                        except Exception as e:
                            error_count += 1
                            errors.append(f"{email_addr}: {str(e)}")
                        
                        progress = (idx + 1) / len(df)
                        progress_bar.progress(progress)
                        status_container.text(f"✅ {success_count} enviados | ⚠️ {error_count} erros")
                    
                    st.success(f"✅ Convites enviados!")
                    st.info(f"**Resultado:**\n- Enviados: {success_count}\n- Erros: {error_count}")
                    
                    if errors:
                        with st.expander("📋 Ver erros"):
                            for error in errors:
                                st.error(error)
        
        except Exception as e:
            st.error(f"❌ Erro ao processar arquivo: {e}")

st.markdown("---")
st.subheader("📋 Convites Enviados")

try:
    conn = sqlite3.connect('copsoq_invites.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, employee_name, email, token, created_date, accessed_date, completed
        FROM invites
        ORDER BY created_date DESC
        LIMIT 20
    """)
    
    invites = cursor.fetchall()
    conn.close()
    
    if invites:
        st.markdown(f"**Ultimos convites ({len(invites)}):**")
        
        for invite_id, name, email_addr, token, created, accessed, completed in invites:
            with st.container(border=True):
                col1, col2, col3, col4 = st.columns([2, 2, 1, 1])
                
                with col1:
                    st.markdown(f"**{name}**")
                    st.caption(email_addr)
                
                with col2:
                    created_date = datetime.fromisoformat(created).strftime("%d/%m/%Y %H:%M")
                    st.caption(f"📅 {created_date}")
                    
                    if completed == 1:
                        st.success("✅ Respondido")
                    elif accessed:
                        st.info("👁️ Acessado")
                    else:
                        st.warning("⏳ Pendente")
                
                with col3:
                    if st.button("📋 Copiar", key=f"copy_{token}", use_container_width=True, size="small"):
                        link = f"http://localhost:8501/COPSOQ-II?token={token}"
                        st.write(link)
                
                with col4:
                    if st.button("🗑️", key=f"delete_{token}", use_container_width=True, size="small"):
                        try:
                            conn = sqlite3.connect('copsoq_invites.db')
                            cursor = conn.cursor()
                            cursor.execute('DELETE FROM invites WHERE id = ?', (invite_id,))
                            conn.commit()
                            conn.close()
                            st.rerun()
                        except:
                            st.error("Erro ao deletar")
    else:
        st.info("Nenhum convite enviado ainda.")

except Exception as e:
    st.warning(f"Banco de dados nao encontrado: {e}")

st.markdown("---")
st.caption("Admin - Black Belt Consultoria COPSOQ-II 2024")
