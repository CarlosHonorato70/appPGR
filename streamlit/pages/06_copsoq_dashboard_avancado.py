import streamlit as st
import pandas as pd
import plotly.express as px
import sys
import os

sys.path.insert(0, 'utils')
from copsoq_invites_manager import copsoq_invites_manager
from copsoq_responses_manager import copsoq_responses_manager, DIMENSION_MAP

st.set_page_config(page_title='Dashboard COPSOQ-II Avançado', page_icon='📈', layout='wide')
st.markdown('<h2>📈 Dashboard COPSOQ-II Avançado</h2>', unsafe_allow_html=True)

# --- Carregar Dados ---
all_invites = copsoq_invites_manager.get_all_invites()
all_responses = copsoq_responses_manager.get_all_responses()

df_invites = pd.DataFrame(all_invites)
df_responses = pd.DataFrame(all_responses)

# --- Filtros ---
st.sidebar.header('Filtros')
assessment_ids = ['Todos'] + sorted(df_invites['assessment_id'].unique().tolist())
selected_assessment = st.sidebar.selectbox('Selecionar Avaliação', assessment_ids)

if selected_assessment != 'Todos':
    df_filtered_invites = df_invites[df_invites['assessment_id'] == selected_assessment]
    df_filtered_responses = df_responses[df_responses['assessment_id'] == selected_assessment]
else:
    df_filtered_invites = df_invites
    df_filtered_responses = df_responses

departments = ['Todos'] + sorted(df_filtered_invites['department'].unique().tolist())
selected_department = st.sidebar.selectbox('Selecionar Departamento', departments)

if selected_department != 'Todos':
    df_filtered_invites = df_filtered_invites[df_filtered_invites['department'] == selected_department]
    df_filtered_responses = df_filtered_responses[df_filtered_responses['department'] == selected_department]

# --- Métricas de Resposta ---
st.subheader('Métricas de Resposta')
total_invites = len(df_filtered_invites)
total_sent = len(df_filtered_invites[df_filtered_invites['sent']])
total_opened = len(df_filtered_invites[df_filtered_invites['opened']])
total_completed = len(df_filtered_invites[df_filtered_invites['completed']])

response_rate = (total_completed / total_sent * 100) if total_sent > 0 else 0

col1, col2, col3, col4, col5 = st.columns(5)
with col1: st.metric('Convites Criados', total_invites)
with col2: st.metric('Enviados', total_sent)
with col3: st.metric('Abertos', total_opened)
with col4: st.metric('Concluídos', total_completed)
with col5: st.metric('Taxa de Resposta', f'{response_rate:.1f}%')

# --- Alertas de Resposta ---
if response_rate < 50 and total_sent > 0:
    st.warning(f'🚨 Alerta: A taxa de resposta ({response_rate:.1f}%) está abaixo do ideal (50%). Considere enviar lembretes.')
elif response_rate >= 50 and response_rate < 75 and total_sent > 0:
    st.info(f'💡 Dica: A taxa de resposta ({response_rate:.1f}%) é boa, mas pode ser melhorada. Um lembrete final pode ajudar.')
elif response_rate >= 75 and total_sent > 0:
    st.success(f'🎉 Excelente! A taxa de resposta ({response_rate:.1f}%) é muito alta.')

st.divider()

# --- Análise por Departamento (Taxa de Resposta) ---
st.subheader('Taxa de Resposta por Departamento')
if not df_filtered_invites.empty:
    dept_invites = df_filtered_invites.groupby('department').size().reset_index(name='Total Convites')
    dept_completed = df_filtered_invites[df_filtered_invites['completed']].groupby('department').size().reset_index(name='Total Concluídos')
    
    df_dept_summary = pd.merge(dept_invites, dept_completed, on='department', how='left').fillna(0)
    df_dept_summary['Taxa de Resposta (%)'] = (df_dept_summary['Total Concluídos'] / df_dept_summary['Total Convites'] * 100).round(1)
    
    st.dataframe(df_dept_summary, use_container_width=True, hide_index=True)
    
    fig_dept_rate = px.bar(df_dept_summary, x='department', y='Taxa de Resposta (%)', 
                           title='Taxa de Resposta por Departamento',
                           labels={'department': 'Departamento', 'Taxa de Resposta (%)': 'Taxa de Resposta (%)'},
                           color='Taxa de Resposta (%)',
                           color_continuous_scale=px.colors.sequential.RdYlGn)
    st.plotly_chart(fig_dept_rate, use_container_width=True)
else:
    st.info('Nenhum convite para analisar por departamento.')

st.divider()

# --- Análise de Dimensões COPSOQ-II ---
st.subheader('Scores Médios por Dimensão COPSOQ-II')

if not df_filtered_responses.empty:
    # Preparar dados para o gráfico de dimensões
    df_dim_scores = pd.DataFrame([
        {'department': r['department'], 'dimension': dim, 'score': score}
        for r in df_filtered_responses
        for dim, score in r['dimension_scores'].items()
    ])

    if not df_dim_scores.empty:
        # Score médio geral por dimensão
        avg_dim_scores = df_dim_scores.groupby('dimension')['score'].mean().reset_index()
        avg_dim_scores = avg_dim_scores.sort_values('score', ascending=False)

        fig_overall_dims = px.bar(avg_dim_scores, x='dimension', y='score', 
                                  title='Scores Médios por Dimensão (Geral)',
                                  labels={'dimension': 'Dimensão', 'score': 'Score Médio (0-4)'},
                                  color='score',
                                  color_continuous_scale=px.colors.sequential.Plasma)
        st.plotly_chart(fig_overall_dims, use_container_width=True)

        st.write('**Scores Detalhados por Dimensão:**')
        st.dataframe(avg_dim_scores.set_index('dimension'), use_container_width=True)

        # --- Alertas e Recomendações por Dimensão ---
        st.subheader('🚨 Alertas e Recomendações por Dimensão')
        recommendations = []
        for index, row in avg_dim_scores.iterrows():
            dim = row['dimension']
            score = row['score']

            if dim in ["Demandas Quantitativas", "Demandas Emotivas", "Demandas Cognitivas"]:
                if score >= 3.0:
                    recommendations.append(f"🔴 **{dim} (Score: {score:.2f})**: Nível de demanda muito alto. Avaliar carga de trabalho, prazos e recursos. Risco de estresse e burnout.")
                elif score >= 2.5:
                    recommendations.append(f"🟠 **{dim} (Score: {score:.2f})**: Nível de demanda elevado. Monitorar e buscar otimizações para evitar sobrecarga.")
            
            elif dim in ["Influência", "Desenvolvimento", "Variedade", "Suporte do Gestor", "Suporte dos Colegas", "Justiça Organizacional", "Qualidade da Liderança", "Significado", "Compromisso"]:
                if score <= 1.5:
                    recommendations.append(f"🔴 **{dim} (Score: {score:.2f})**: Nível muito baixo. Urgente fortalecer este aspecto (autonomia, aprendizado, apoio, justiça, liderança).")
                elif score <= 2.0:
                    recommendations.append(f"🟠 **{dim} (Score: {score:.2f})**: Nível baixo. Há espaço significativo para melhoria. Focar em ações de engajamento e desenvolvimento.")
            
            elif dim in ["Segurança do Emprego", "Bem-estar (Burnout)"]:
                if score >= 2.5:
                    recommendations.append(f"🔴 **{dim} (Score: {score:.2f})**: Nível preocupante. Indícios de insegurança ou esgotamento. Investigar causas e oferecer suporte.")
                elif score >= 2.0:
                    recommendations.append(f"🟠 **{dim} (Score: {score:.2f})**: Nível moderado. Monitorar de perto e implementar ações preventivas.")
        
        if recommendations:
            for rec in recommendations:
                st.markdown(rec)
        else:
            st.info('Nenhum alerta ou recomendação crítica com base nos scores atuais.')

        # --- Scores por Dimensão e Departamento ---
        if selected_department == 'Todos' and len(df_dim_scores['department'].unique()) > 1:
            st.subheader('Scores Médios por Dimensão e Departamento')
            avg_dim_dept_scores = df_dim_scores.groupby(['department', 'dimension'])['score'].mean().reset_index()
            
            fig_dept_dims = px.bar(avg_dim_dept_scores, x='dimension', y='score', color='department', 
                                   barmode='group',
                                   title='Scores Médios por Dimensão e Departamento',
                                   labels={'dimension': 'Dimensão', 'score': 'Score Médio (0-4)', 'department': 'Departamento'},
                                   height=500)
            st.plotly_chart(fig_dept_dims, use_container_width=True)
    else:
        st.info('Nenhum dado de score de dimensão para exibir.')
else:
    st.info('Nenhuma resposta recebida para a avaliação/departamento selecionado.')

