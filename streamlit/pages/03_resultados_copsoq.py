import streamlit as st
import sys
sys.path.insert(0, 'utils')

from auth_system import require_admin
from secure_storage import get_all_responses, get_response_decrypted
from datetime import datetime

st.set_page_config(page_title="Resultados COPSOQ-II", layout="wide")

require_admin()

st.title("📊 Resultados COPSOQ-II")
st.markdown("---")

try:
    responses = get_all_responses(st.session_state.admin_id)
    
    if responses:
        st.markdown(f"**Total de respostas: {len(responses)}**")
        
        for resp_id, name, dept, email, date, completed in responses:
            with st.container(border=True):
                col1, col2, col3 = st.columns([2, 2, 1])
                
                with col1:
                    st.markdown(f"**Nome:** {name}")
                    st.markdown(f"**Departamento:** {dept}")
                
                with col2:
                    resp_date = datetime.fromisoformat(date).strftime("%d/%m/%Y %H:%M")
                    st.markdown(f"**Data:** {resp_date}")
                    st.markdown(f"**E-mail:** {email or 'N/A'}")
                
                with col3:
                    if st.button("Ver Detalhes", key=f"view_{resp_id}", use_container_width=True):
                        response_data = get_response_decrypted(resp_id, st.session_state.admin_id)
                        if response_data:
                            st.json(response_data["responses"])
    else:
        st.info("Nenhuma resposta recebida ainda.")

except Exception as e:
    st.error(f"Erro: {e}")

st.markdown("---")
st.caption("Black Belt Consultoria - COPSOQ-II 2024")
