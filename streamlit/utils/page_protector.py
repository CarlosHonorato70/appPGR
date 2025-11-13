import streamlit as st
import sys
sys.path.insert(0, 'utils')

from auth_system import is_admin_authenticated, is_respondent_with_token

def protect_admin_page():
    if is_respondent_with_token():
        st.error("❌ Acesso negado: Respondentes nao podem acessar esta pagina.")
        st.stop()
    
    if not is_admin_authenticated():
        st.error("❌ Acesso negado: Faca login para continuar.")
        st.info("Volte a pagina inicial e faca login.")
        st.stop()

def protect_form_page():
    if not is_respondent_with_token():
        st.error("❌ Acesso invalido.")
        st.stop()
