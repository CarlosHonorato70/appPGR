import streamlit as st
import sys
sys.path.insert(0, 'utils')

from page_protector import protect_form_page
from copsoq_questions import COPSOQ_QUESTIONS, get_all_categories, get_questions_by_category
from copsoq_invites import validate_token, mark_as_accessed, mark_as_completed, get_invite_by_token
from secure_storage import save_response_encrypted

st.set_page_config(page_title="Formulario COPSOQ-II", layout="wide", initial_sidebar_state="collapsed")

# Ocultar menu
st.markdown("""
<style>
    [data-testid="stSidebar"] { display: none; }
</style>
""", unsafe_allow_html=True)

# Obter token da URL
query_params = st.query_params
token = query_params.get("token", [None])[0] if isinstance(query_params.get("token", []), list) else query_params.get("token")

print(f"[DEBUG] Token recebido: {token}")

# Validar token
if not token:
    st.error("❌ Link invalido. Token nao fornecido.")
    st.stop()

if not validate_token(token):
    st.error("❌ Link invalido ou convite ja foi respondido!")
    st.stop()

invite = get_invite_by_token(token)

if not invite:
    st.error("❌ Convite nao encontrado!")
    st.stop()

mark_as_accessed(token)
employee_name = invite["employee_name"]

st.title("📝 Formulario COPSOQ-II")
st.markdown("---")

st.info("""
**Questionario de Avaliacao Psicossocial no Trabalho**
- 41 Questoes | Escala 1-5
- Tempo: 15-20 minutos
- Confidencial e Anonimo
""")

st.markdown("---")

st.subheader("Informacoes do Respondente")

col1, col2 = st.columns(2)
with col1:
    respondent_name = st.text_input("Nome:", value=employee_name, disabled=True)
with col2:
    department = st.text_input("Departamento:", placeholder="Sua area/departamento", key="department")

email = st.text_input("E-mail (opcional):", placeholder="seu@email.com", key="email")

st.markdown("---")
st.subheader("Questionario (41 Questoes - Escala 1-5)")

if "responses" not in st.session_state:
    st.session_state.responses = {}

categories = get_all_categories()

for cat_idx, category in enumerate(categories, 1):
    st.markdown(f"### {cat_idx}. {category}")
    questions = get_questions_by_category(category)
    
    for q in questions:
        st.markdown(f"**{q['id']}. {q['question']}**")
        
        response = st.radio(
            label="Resposta",
            options=q['scale'],
            key=f"q_{q['id']}",
            label_visibility="collapsed",
            horizontal=False
        )
        
        if response:
            st.session_state.responses[q['id']] = response
        
        st.divider()

st.markdown("---")

col1, col2, col3 = st.columns([1, 1, 1])

with col2:
    if st.button("✅ Enviar Respostas", type="primary", use_container_width=True):
        if len(st.session_state.responses) != len(COPSOQ_QUESTIONS):
            missing = len(COPSOQ_QUESTIONS) - len(st.session_state.responses)
            st.error(f"❌ Responda todas as {missing} perguntas!")
        elif not department:
            st.error("❌ Preencha o departamento!")
        else:
            try:
                response_id = save_response_encrypted(token, respondent_name, department, email or "", st.session_state.responses)
                mark_as_completed(token, response_id)
                
                st.success("✅ Respostas enviadas com sucesso!")
                st.balloons()
                st.info(f"ID da resposta: {response_id}")
                st.write("Obrigado pela sua participacao!")
                
            except Exception as e:
                st.error(f"❌ Erro: {e}")

st.markdown("---")
st.caption("Black Belt Consultoria - COPSOQ-II 2024")
