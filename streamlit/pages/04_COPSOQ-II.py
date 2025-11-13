import streamlit as st
import sys
import os

sys.path.insert(0, 'utils')
from copsoq_responses_manager import copsoq_responses_manager
from copsoq_invites_manager import copsoq_invites_manager

st.set_page_config(page_title='COPSOQ-II - Black Belt', page_icon='📋', layout='wide')

st.markdown('<h2>📋 Questionário COPSOQ-II</h2>', unsafe_allow_html=True)

query_params = st.query_params
token = query_params.get('token', None)

if not token:
    st.error('Link inválido. Token ausente.')
    st.stop()

invite = copsoq_invites_manager.get_invite_by_token(token)
if not invite:
    st.error('Token inválido ou expirado.')
    st.stop()

# Marca “aberto” na primeira renderização
copsoq_invites_manager.mark_opened(token)

st.info(f'Avaliação: {invite["assessment_id"]} | Colaborador: {invite["employee_name"]}')

# Campos informativos (email/nome podem vir do convite)
employee_name = st.text_input('Nome', value=invite.get('employee_name') or '')
employee_email = st.text_input('Email', value=invite.get('employee_email') or '')
department = st.text_input('Departamento', value=invite.get('department') or '')

st.divider()
st.write('Responda as questões (0=Nunca/Discordo totalmente ... 4=Sempre/Concordo totalmente)')

def q(label, key):
    return st.select_slider(label, options=[0,1,2,3,4], value=2, key=key)

# 14 dimensões (56 itens)
q_values = {}
labels = [
 ('Demandas Quantitativas', ['Trabalha muito rápido?', 'Decisões rápidas?', 'Tempo suficiente?', 'Horas extras?']),
 ('Demandas Emotivas', ['Emocionalmente exigente?', 'Esconder sentimentos?', 'Difícil desligar?', 'Afeta sua saúde?']),
 ('Demandas Cognitivas', ['Concentração intensa?', 'Guardar muitas infos?', 'Erros frequentes?', 'Pensar rápido?']),
 ('Influência', ['Influencia decisões?', 'Voz nas decisões?', 'Influencia ritmo?', 'Influencia prazos?']),
 ('Desenvolvimento', ['Aprende coisas novas?', 'Aplica habilidades?', 'Desenvolve profissionalmente?', 'Oportunidades de qualificação?']),
 ('Variedade', ['Trabalho variado?', 'Tarefas diferentes?', 'Monotonia?', 'Mesmo trabalho todo dia?']),
 ('Significado', ['Trabalho significativo?', 'Contribui para algo?', 'Orgulho do trabalho?', 'Trabalho relevante?']),
 ('Compromisso', ['Comprometido?', 'Empenho?', 'Entusiasmo?', 'Dedicação total?']),
 ('Suporte do Gestor', ['Gestor resolve problemas?', 'Gestor ouve?', 'Valoriza trabalho?', 'Feedback construtivo?']),
 ('Suporte dos Colegas', ['Colegas ajudam?', 'Boa comunicação?', 'Parte do grupo?', 'Cooperação?']),
 ('Justiça Organizacional', ['Decisões justas?', 'Tratado com respeito?', 'Regras iguais para todos?', 'Confia na liderança?']),
 ('Qualidade da Liderança', ['Planeja bem?', 'Distribui equitativamente?', 'Objetivos claros?', 'Bom modelo?']),
 ('Segurança do Emprego', ['Preocupação com emprego?', 'Pode perder o emprego?', 'Empresa estável?', 'Risco de desemprego?']),
 ('Bem-estar (Burnout)', ['Esgotado no fim do dia?', 'Cansaço mental?', 'Frustração?', 'Dificuldade de concentração?']),
]

idx = 1
for dim, qs in labels:
    st.subheader(dim)
    cols = st.columns(2)
    q_values[f"q{idx}"]   = q(qs[0], f"q{idx}"); idx+=1
    q_values[f"q{idx}"]   = q(qs[1], f"q{idx}"); idx+=1
    q_values[f"q{idx}"]   = q(qs[2], f"q{idx}"); idx+=1
    q_values[f"q{idx}"]   = q(qs[3], f"q{idx}"); idx+=1
    st.divider()

comments = st.text_area('Comentários (opcional)', height=80)

if st.button('✅ Enviar Respostas', use_container_width=True):
    if not employee_name or not employee_email:
        st.error('Preencha nome e email.')
    else:
        q_values['comments'] = comments
        resp = copsoq_responses_manager.add_response(
            assessment_id=invite['assessment_id'],
            employee_name=employee_name,
            employee_email=employee_email,
            department=department,
            responses=q_values,
            token=token
        )
        copsoq_invites_manager.mark_completed(token)
        st.success('Respostas enviadas com sucesso! Obrigado pela participação.')
        st.balloons()
