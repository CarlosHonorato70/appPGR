import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import sys
import os

sys.path.insert(0, 'utils')
from copsoq_invites_manager import copsoq_invites_manager
from copsoq_responses_manager import copsoq_responses_manager, DIMENSION_MAP

st.set_page_config(page_title='Dashboard COPSOQ-II', page_icon='📈', layout='wide')
st.markdown('<h2>📈 Dashboard COPSOQ-II Avançado</h2>', unsafe_allow_html=True)

# Carregar dados
all_invites = copsoq_invites_manager.get_all_invites()
all_responses = copsoq_responses_manager.get_all_responses()

if not all_responses:
    st.info('Nenhuma resposta recebida ainda. Dispare convites para começar.')
    st.stop()

df_invites = pd.DataFrame(all_invites)
df_responses = pd.DataFrame(all_responses)

# Filtros
st.sidebar.header('🔍 Filtros')
assessment_ids = ['Todos'] + sorted(df_invites['assessment_id'].unique().tolist()) if not df_invites.empty else ['Todos']
selected_assessment = st.sidebar.selectbox('Avaliação', assessment_ids)

if selected_assessment != 'Todos':
    df_filt_invites = df_invites[df_invites['assessment_id'] == selected_assessment]
    df_filt_responses = df_responses[df_responses['assessment_id'] == selected_assessment]
else:
    df_filt_invites = df_invites
    df_filt_responses = df_responses

departments = ['Todos'] + sorted(df_filt_invites['department'].unique().tolist()) if not df_filt_invites.empty else ['Todos']
selected_dept = st.sidebar.selectbox('Departamento', departments)

if selected_dept != 'Todos':
    df_filt_invites = df_filt_invites[df_filt_invites['department'] == selected_dept]
    df_filt_responses = df_filt_responses[df_filt_responses['department'] == selected_dept]

# Tabs
tab1, tab2, tab3, tab4, tab5 = st.tabs(['📊 Visão Geral', '🏢 Por Departamento', '📈 Dimensões', '🚨 Alertas', '💾 Exportar'])

with tab1:
    st.subheader('Métricas Gerais')
    total_invites = len(df_filt_invites)
    total_sent = len(df_filt_invites[df_filt_invites['sent'] == True]) if not df_filt_invites.empty else 0
    total_completed = len(df_filt_responses)
    overall_avg = df_filt_responses['overall_score'].mean() if not df_filt_responses.empty else 0
    response_rate = (total_completed / total_sent * 100) if total_sent > 0 else 0
    
    col1, col2, col3, col4, col5 = st.columns(5)
    col1.metric('Convites Criados', total_invites)
    col2.metric('Enviados', total_sent)
    col3.metric('Respondidos', total_completed)
    col4.metric('Taxa (%)', f'{response_rate:.1f}%')
    col5.metric('Score Médio', f'{overall_avg:.2f}')
    
    if response_rate < 50 and total_sent > 0:
        st.error(f'🔴 Taxa de resposta ({response_rate:.1f}%) abaixo de 50%. Considere enviar lembretes.')
    elif response_rate >= 75:
        st.success(f'🟢 Excelente! Taxa de resposta ({response_rate:.1f}%).')

with tab2:
    st.subheader('Análise por Departamento')
    if not df_filt_invites.empty and selected_dept == 'Todos':
        dept_summary = df_filt_invites.groupby('department').agg(
            total_convites=('id', 'count'),
            enviados=('sent', 'sum')
        ).reset_index()
        
        dept_respondidos = df_filt_responses.groupby('department').size().reset_index(name='respondidos')
        dept_summary = pd.merge(dept_summary, dept_respondidos, on='department', how='left').fillna(0)
        dept_summary['respondidos'] = dept_summary['respondidos'].astype(int)
        dept_summary['taxa_resposta'] = (dept_summary['respondidos'] / dept_summary['enviados'] * 100).round(1)
        
        fig = px.bar(dept_summary, x='department', y='taxa_resposta', title='Taxa de Resposta por Departamento', 
                    color='taxa_resposta', color_continuous_scale='RdYlGn', range_color=[0, 100])
        st.plotly_chart(fig, use_container_width=True)
        
        st.dataframe(dept_summary, use_container_width=True, hide_index=True)

with tab3:
    st.subheader('Scores Médios das Dimensões')
    if not df_filt_responses.empty:
        # Calcular médias por dimensão
        dim_scores = {}
        for dim in DIMENSION_MAP.keys():
            scores = []
            for _, resp in df_filt_responses.iterrows():
                if dim in resp['dimension_scores']:
                    scores.append(resp['dimension_scores'][dim])
            dim_scores[dim] = sum(scores) / len(scores) if scores else 0
        
        df_dims = pd.DataFrame(list(dim_scores.items()), columns=['Dimensão', 'Score']).sort_values('Score')
        
        # Gráfico de barras
        fig = px.bar(df_dims, x='Score', y='Dimensão', orientation='h', 
                    title='Scores por Dimensão (0-4)', color='Score',
                    color_continuous_scale=px.colors.sequential.RdYlGn, range_color=[0, 4])
        st.plotly_chart(fig, use_container_width=True)
        
        # Gráfico de radar
        fig_radar = go.Figure(data=go.Scatterpolar(
            r=df_dims['Score'],
            theta=df_dims['Dimensão'],
            fill='toself',
            line_color='blue'
        ))
        fig_radar.update_layout(polar=dict(radialaxis=dict(visible=True, range=[0, 4])), title='Visão de Radar das Dimensões')
        st.plotly_chart(fig_radar, use_container_width=True)
        
        st.dataframe(df_dims.set_index('Dimensão'), use_container_width=True)

with tab4:
    st.subheader('🚨 Alertas Inteligentes')
    if not df_filt_responses.empty:
        dim_scores = {}
        for dim in DIMENSION_MAP.keys():
            scores = [resp['dimension_scores'].get(dim, 0) for _, resp in df_filt_responses.iterrows()]
            dim_scores[dim] = sum(scores) / len(scores) if scores else 0
        
        alertas = []
        for dim, score in dim_scores.items():
            if dim in ['Demandas Quantitativas', 'Demandas Emotivas', 'Demandas Cognitivas']:
                if score >= 3.5:
                    alertas.append(('🔴 Alto', f'{dim}: Score {score:.2f} - Nível de demanda crítico'))
                elif score >= 2.5:
                    alertas.append(('🟠 Moderado', f'{dim}: Score {score:.2f} - Demanda elevada'))
            else:
                if score < 1.5:
                    alertas.append(('🔴 Alto', f'{dim}: Score {score:.2f} - Nível crítico, requer ação'))
                elif score < 2.0:
                    alertas.append(('🟠 Moderado', f'{dim}: Score {score:.2f} - Nível baixo, atenção necessária'))
        
        if alertas:
            for nivel, msg in alertas:
                if '🔴' in nivel:
                    st.error(msg)
                else:
                    st.warning(msg)
        else:
            st.success('✅ Nenhum alerta crítico. Todos os scores estão dentro de níveis saudáveis.')

with tab5:
    st.subheader('💾 Exportar Dados')
    
    csv_responses = df_filt_responses.to_csv(index=False).encode('utf-8')
    st.download_button('📥 Baixar Respostas (CSV)', csv_responses, 'copsoq_respostas.csv', 'text/csv', use_container_width=True)
    
    if not df_filt_invites.empty and selected_dept == 'Todos':
        csv_dept = dept_summary.to_csv(index=False).encode('utf-8')
        st.download_button('📥 Baixar Sumário Departamentos (CSV)', csv_dept, 'copsoq_departamentos.csv', 'text/csv', use_container_width=True)
