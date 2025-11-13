import streamlit as st

def is_form_only_access():
    """Verifica se esta acessando com token de email (respondente)"""
    query_params = st.query_params
    token = query_params.get("token", [None])[0] if isinstance(query_params.get("token", []), list) else query_params.get("token")
    return bool(token)

def restrict_admin_access():
    """Bloqueia acesso a paginas de admin quando acessa via token"""
    if is_form_only_access():
        st.error("❌ Acesso negado: Voce so pode acessar o formulario atraves do link de convite.")
        st.stop()

def get_token_from_url():
    """Obtem o token da URL"""
    query_params = st.query_params
    token = query_params.get("token", [None])[0] if isinstance(query_params.get("token", []), list) else query_params.get("token")
    return token
