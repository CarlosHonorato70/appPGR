import streamlit as st
import sys
sys.path.insert(0, 'utils')

from access_control import restrict_admin_access

# BLOQUEAR acesso via token
restrict_admin_access()

st.set_page_config(page_title="Dashboard COPSOQ-II", layout="wide")

st.title("📈 Dashboard COPSOQ-II Avancado")
st.markdown("---")

st.info("Dashboard de analise e visualizacao de dados em tempo real.")

# ... resto do codigo do dashboard ...
