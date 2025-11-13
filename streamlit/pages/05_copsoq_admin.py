import streamlit as st
import pandas as pd
import sys
import os
from io import StringIO
from urllib.parse import urlencode
from dotenv import load_dotenv

sys.path.insert(0, 'utils')
from email_sender import send_email, render_invite_email, APP_BASE_URL
from copsoq_invites_manager import copsoq_invites_manager
from copsoq_responses_manager import copsoq_responses_manager

load_dotenv()

st.set_page_config(page_title='COPSOQ-II Admin', page_icon='📨', layout='wide')
st.markdown('<h2>📨 Admin COPSOQ-II | Convites e Dashboard</h2>', unsafe_allow_html=True)

tab1, tab2, tab3 = st.tabs(['➕ Disparar Convites', '📊 Dashboard de Respostas', '📥 Exportação'])

with tab1:
    st.subheader('➕ Disparar Convites (Manual ou CSV)')
    st.write('1) Informe o ID da Avaliação (assessment_id) que receberá as respostas dos colaboradores.')
    assessment_id = st.text_input('Assessment ID', placeholder='Ex.: NR01-2025-EMPRESA-XYZ')

    st.write('2) Insira manualmente ou faça upload de CSV (colunas: name,email,department)')
    col1, col2 = st.columns(2)

    with col1:
        manual_name = st.text_input('Nome (manual)')
        manual_email = st.text_input('Email (manual)')
        manual_dept = st.text_input('Departamento (manual)', value='')

    with col2:
        uploaded = st.file_uploader('Upload CSV (name,email,department)', type=['csv'])

    invite_rows = []

    if manual_name and manual_email:
        invite_rows.append({'name': manual_name, 'email': manual_email, 'department': manual_dept})

    if uploaded:
        df = pd.read_csv(uploaded)
        if not {'name', 'email'}.issubset(set(df.columns)):
            st.error('CSV precisa ter colunas: name,email (department opcional).')
        else:
            for _, r in df.iterrows():
                invite_rows.append({
                    'name': r['name'],
                    'email': r['email'],
                    'department': r.get('department', '') if 'department' in df.columns else ''
                })

    st.write(f'Total de convites a criar: {len(invite_rows)}')

    if st.button('📤 Criar e Enviar Convites', use_container_width=True, disabled=not assessment_id or len(invite_rows)==0):
        success, failures = 0, 0
        details = []
        for row in invite_rows:
            inv = copsoq_invites_manager.create_invite(
                assessment_id=assessment_id,
                employee_name=row['name'],
                employee_email=row['email'],
                department=row['department']
            )
            # Link para o formulário com token
            link = f"{APP_BASE_URL}/COPSOQ-II?token={inv['token']}"
            html = render_invite_email(employee_name=inv["employee_name"], invite_link=link, assessment_name="COPSOQ-II")
            try:
                send_email(inv['employee_email'], 'Convite - COPSOQ-II (NR-01)', html)
                copsoq_invites_manager.mark_sent(inv['id'])
                success += 1
                details.append({'email': inv['employee_email'], 'status': 'sent', 'link': link})
            except Exception as e:
                failures += 1
                details.append({'email': inv['employee_email'], 'status': f'error: {e}', 'link': link})
        st.success(f'Convites enviados: {success} | Falhas: {failures}')
        st.dataframe(pd.DataFrame(details), use_container_width=True)

with tab2:
    st.subheader('📊 Dashboard de Acompanhamento')
    assessment_filter = st.text_input('Filtrar por Assessment ID (vazio = todos)', value='')

    invites = copsoq_invites_manager.get_all_invites()
    responses = copsoq_responses_manager.get_all_responses()

    if assessment_filter:
        invites = [i for i in invites if i['assessment_id'] == assessment_filter]
        responses = [r for r in responses if r['assessment_id'] == assessment_filter]

    total_sent = len([i for i in invites if i['sent']])
    total_open = len([i for i in invites if i['opened']])
    total_completed = len([i for i in invites if i['completed']])

    col1, col2, col3, col4 = st.columns(4)
    with col1: st.metric('Convites Criados', len(invites))
    with col2: st.metric('Enviados', total_sent)
    with col3: st.metric('Abertos', total_open)
    with col4: st.metric('Concluídos', total_completed)

    st.divider()
    st.write('Convites (status)')
    if invites:
        df_inv = pd.DataFrame([
            {
                'Assessment': i['assessment_id'],
                'Nome': i['employee_name'],
                'Email': i['employee_email'],
                'Depto': i['department'],
                'Enviado?': 'Sim' if i['sent'] else 'Não',
                'Aberto?': 'Sim' if i['opened'] else 'Não',
                'Concluído?': 'Sim' if i['completed'] else 'Não',
                'Criado em': i['created_at'][:19],
                'Token': i['token']
            } for i in invites
        ])
        st.dataframe(df_inv, use_container_width=True, hide_index=True)
    else:
        st.info('Nenhum convite encontrado.')

    st.divider()
    st.write('Respostas Recebidas (agregado por dimensão)')
    if responses:
        # Agregado rápido por dimensão (média)
        rows = []
        for r in responses:
            dims = r['dimension_scores']
            for d, v in dims.items():
                rows.append({'Assessment': r['assessment_id'], 'Dimensão': d, 'Score': float(v)})
        if rows:
            df_dim = pd.DataFrame(rows)
            if assessment_filter:
                df_dim = df_dim[df_dim['Assessment'] == assessment_filter]
            if not df_dim.empty:
                summary = df_dim.groupby('Dimensão')['Score'].mean().reset_index()
                st.bar_chart(summary.set_index('Dimensão'))
                st.dataframe(summary, use_container_width=True, hide_index=True)
            else:
                st.info('Sem dados agregados.')
        else:
            st.info('Sem dados de dimensões.')
    else:
        st.info('Nenhuma resposta recebida ainda.')

with tab3:
    st.subheader('📥 Exportação (Invites e Respostas)')
    invites = copsoq_invites_manager.get_all_invites()
    responses = copsoq_responses_manager.get_all_responses()

    if invites:
        df_i = pd.DataFrame(invites)
        st.download_button('Baixar Invites (CSV)', data=df_i.to_csv(index=False), file_name='copsoq_invites.csv', mime='text/csv')
    else:
        st.info('Sem invites para exportar.')

    if responses:
        # Resumo por resposta
        flat = []
        for r in responses:
            base = {
                'assessment_id': r['assessment_id'],
                'employee_name': r['employee_name'],
                'employee_email': r['employee_email'],
                'department': r['department'],
                'overall_score': r['overall_score'],
                'created_at': r['created_at']
            }
            for d, v in r['dimension_scores'].items():
                base[f'dim_{d}'] = v
            flat.append(base)
        df_r = pd.DataFrame(flat)
        st.download_button('Baixar Respostas (CSV)', data=df_r.to_csv(index=False), file_name='copsoq_responses.csv', mime='text/csv')
    else:
        st.info('Sem respostas para exportar.')

