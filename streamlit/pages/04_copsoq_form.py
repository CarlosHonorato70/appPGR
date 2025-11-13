import streamlit as st
import sys
import os
from urllib.parse import urlparse, parse_qs

sys.path.insert(0, 'utils')
from copsoq_responses_manager import copsoq_responses_manager
from risk_assessments_manager import risk_assessments_manager

st.set_page_config(
    page_title="COPSOQ-II - Black Belt",
    page_icon="📋",
    layout="wide"
)

st.markdown("""
<style>
    .header-form {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 30px;
        border-radius: 10px;
        color: white;
        margin-bottom: 20px;
    }
    .question-box {
        background-color: #f0f2f6;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 10px;
        border-left: 4px solid #667eea;
    }
    .progress-bar {
        background-color: #e0e0e0;
        border-radius: 10px;
        height: 30px;
        overflow: hidden;
    }
    .progress-fill {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class='header-form'>
    <h1>📋 Questionário COPSOQ-II</h1>
    <p>Avaliação de Riscos Psicossociais no Trabalho - NR-01</p>
    <p style='font-size: 12px; margin-top: 10px;'>Este questionário é confidencial e será usado apenas para melhorar as condições de trabalho.</p>
</div>
""", unsafe_allow_html=True)

# Verificar se tem um token na URL
query_params = st.query_params

if 'token' in query_params:
    token = query_params['token']
    
    st.write("**Token recebido:** Carregando formulário...")
    
    # Aqui você faria a validação do token
    # Por enquanto, vamos criar um formulário genérico
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("📝 Informações Pessoais")
        
        employee_name = st.text_input("Nome Completo", placeholder="Digite seu nome")
        employee_email = st.text_input("Email", placeholder="seu.email@empresa.com")
        department = st.selectbox(
            "Departamento",
            ["Selecione...", "TI", "RH", "Financeiro", "Vendas", "Operações", "Outro"]
        )
    
    with col2:
        st.subheader("📊 Progresso")
        progress = 0
        st.metric("Perguntas Respondidas", f"{progress}/56")
    
    st.divider()
    
    st.subheader("🎯 Instruções")
    st.write("""
    Para cada afirmação, indique seu grau de concordância:
    - **0** = Nunca / Discordo totalmente
    - **1** = Raramente / Discordo
    - **2** = Às vezes / Neutro
    - **3** = Frequentemente / Concordo
    - **4** = Sempre / Concordo totalmente
    """)
    
    st.divider()
    
    # Responder ao formulário
    st.subheader("📋 Formulário COPSOQ-II")
    
    # Dimensão 1: Demandas Quantitativas
    st.write("**Dimensão 1: Demandas Quantitativas**")
    st.write("*Pressão de tempo e quantidade de trabalho*")
    
    col1, col2 = st.columns(2)
    
    with col1:
        q1 = st.select_slider("Você tem que trabalhar muito rápido?", options=[0, 1, 2, 3, 4], value=2)
        q2 = st.select_slider("O seu trabalho exige decisões rápidas?", options=[0, 1, 2, 3, 4], value=2)
    
    with col2:
        q3 = st.select_slider("Você tem tempo suficiente para executar bem?", options=[0, 1, 2, 3, 4], value=2)
        q4 = st.select_slider("Precisa trabalhar horas extras?", options=[0, 1, 2, 3, 4], value=2)
    
    st.divider()
    
    # Dimensão 2: Demandas Emotivas
    st.write("**Dimensão 2: Demandas Emotivas**")
    st.write("*Exigências emocionais do trabalho*")
    
    col1, col2 = st.columns(2)
    
    with col1:
        q5 = st.select_slider("O seu trabalho é emocionalmente exigente?", options=[0, 1, 2, 3, 4], value=2)
        q6 = st.select_slider("Precisa esconder seus sentimentos no trabalho?", options=[0, 1, 2, 3, 4], value=2)
    
    with col2:
        q7 = st.select_slider("É difícil desligar do trabalho depois do turno?", options=[0, 1, 2, 3, 4], value=2)
        q8 = st.select_slider("O seu trabalho afeta sua saúde?", options=[0, 1, 2, 3, 4], value=2)
    
    st.divider()
    
    # Dimensão 3: Demandas Cognitivas
    st.write("**Dimensão 3: Demandas Cognitivas**")
    st.write("*Exigências de concentração e atenção*")
    
    col1, col2 = st.columns(2)
    
    with col1:
        q9 = st.select_slider("O seu trabalho exige concentração intensa?", options=[0, 1, 2, 3, 4], value=2)
        q10 = st.select_slider("Você tem de guardar muitas informações?", options=[0, 1, 2, 3, 4], value=2)
    
    with col2:
        q11 = st.select_slider("Comete erros com frequência?", options=[0, 1, 2, 3, 4], value=2)
        q12 = st.select_slider("Necessita pensar rápido?", options=[0, 1, 2, 3, 4], value=2)
    
    st.divider()
    
    # Dimensão 4: Influência
    st.write("**Dimensão 4: Influência no Trabalho**")
    st.write("*Capacidade de influenciar decisões sobre o trabalho*")
    
    col1, col2 = st.columns(2)
    
    with col1:
        q13 = st.select_slider("Pode influenciar as decisões sobre seu trabalho?", options=[0, 1, 2, 3, 4], value=2)
        q14 = st.select_slider("Tem voz nas decisões importantes?", options=[0, 1, 2, 3, 4], value=2)
    
    with col2:
        q15 = st.select_slider("Pode influenciar o ritmo de trabalho?", options=[0, 1, 2, 3, 4], value=2)
        q16 = st.select_slider("Pode influenciar os prazos?", options=[0, 1, 2, 3, 4], value=2)
    
    st.divider()
    
    # Dimensão 5: Desenvolvimento
    st.write("**Dimensão 5: Possibilidade de Desenvolvimento**")
    st.write("*Oportunidades de aprendizado e desenvolvimento*")
    
    col1, col2 = st.columns(2)
    
    with col1:
        q17 = st.select_slider("Aprende coisas novas no trabalho?", options=[0, 1, 2, 3, 4], value=2)
        q18 = st.select_slider("Pode aplicar suas habilidades?", options=[0, 1, 2, 3, 4], value=2)
    
    with col2:
        q19 = st.select_slider("Sente que está se desenvolvendo profissionalmente?", options=[0, 1, 2, 3, 4], value=2)
        q20 = st.select_slider("Tem oportunidades de qualificação?", options=[0, 1, 2, 3, 4], value=2)
    
    st.divider()
    
    # Dimensão 6: Variedade
    st.write("**Dimensão 6: Variedade do Trabalho**")
    st.write("*Diversidade nas tarefas realizadas*")
    
    col1, col2 = st.columns(2)
    
    with col1:
        q21 = st.select_slider("Seu trabalho é variado?", options=[0, 1, 2, 3, 4], value=2)
        q22 = st.select_slider("Realiza tarefas muito diferentes?", options=[0, 1, 2, 3, 4], value=2)
    
    with col2:
        q23 = st.select_slider("Tem monotonia no trabalho?", options=[0, 1, 2, 3, 4], value=2)
        q24 = st.select_slider("Realiza o mesmo tipo de trabalho todos os dias?", options=[0, 1, 2, 3, 4], value=2)
    
    st.divider()
    
    # Dimensão 7: Significado
    st.write("**Dimensão 7: Significado do Trabalho**")
    st.write("*Sentido e propósito do trabalho*")
    
    col1, col2 = st.columns(2)
    
    with col1:
        q25 = st.select_slider("Sente que seu trabalho é significativo?", options=[0, 1, 2, 3, 4], value=2)
        q26 = st.select_slider("Seu trabalho contribui para algo importante?", options=[0, 1, 2, 3, 4], value=2)
    
    with col2:
        q27 = st.select_slider("Sente-se orgulhoso do seu trabalho?", options=[0, 1, 2, 3, 4], value=2)
        q28 = st.select_slider("Acredita que seu trabalho é relevante?", options=[0, 1, 2, 3, 4], value=2)
    
    st.divider()
    
    # Dimensão 8: Compromisso
    st.write("**Dimensão 8: Compromisso com o Trabalho**")
    st.write("*Envolvimento e dedicação ao trabalho*")
    
    col1, col2 = st.columns(2)
    
    with col1:
        q29 = st.select_slider("Está comprometido com o seu trabalho?", options=[0, 1, 2, 3, 4], value=2)
        q30 = st.select_slider("Trabalha com empenho?", options=[0, 1, 2, 3, 4], value=2)
    
    with col2:
        q31 = st.select_slider("Sente-se entusiasmado com seu trabalho?", options=[0, 1, 2, 3, 4], value=2)
        q32 = st.select_slider("Dedica-se totalmente ao trabalho?", options=[0, 1, 2, 3, 4], value=2)
    
    st.divider()
    
    # Dimensão 9: Suporte do Gestor
    st.write("**Dimensão 9: Suporte Social do Gestor**")
    st.write("*Apoio recebido do supervisor/gerente*")
    
    col1, col2 = st.columns(2)
    
    with col1:
        q33 = st.select_slider("Seu gestor ajuda a resolver problemas?", options=[0, 1, 2, 3, 4], value=2)
        q34 = st.select_slider("Seu gestor ouve seus problemas?", options=[0, 1, 2, 3, 4], value=2)
    
    with col2:
        q35 = st.select_slider("Seu gestor valoriza seu trabalho?", options=[0, 1, 2, 3, 4], value=2)
        q36 = st.select_slider("Seu gestor oferece feedback construtivo?", options=[0, 1, 2, 3, 4], value=2)
    
    st.divider()
    
    # Dimensão 10: Suporte dos Colegas
    st.write("**Dimensão 10: Suporte Social dos Colegas**")
    st.write("*Apoio recebido dos colegas de trabalho*")
    
    col1, col2 = st.columns(2)
    
    with col1:
        q37 = st.select_slider("Seus colegas ajudam quando tem problemas?", options=[0, 1, 2, 3, 4], value=2)
        q38 = st.select_slider("Existe boa comunicação entre os colegas?", options=[0, 1, 2, 3, 4], value=2)
    
    with col2:
        q39 = st.select_slider("Sente-se parte do grupo?", options=[0, 1, 2, 3, 4], value=2)
        q40 = st.select_slider("Há cooperação entre os colegas?", options=[0, 1, 2, 3, 4], value=2)
    
    st.divider()
    
    # Dimensão 11: Justiça
    st.write("**Dimensão 11: Justiça Organizacional**")
    st.write("*Percepção de justiça nas decisões organizacionais*")
    
    col1, col2 = st.columns(2)
    
    with col1:
        q41 = st.select_slider("As decisões na organização são justas?", options=[0, 1, 2, 3, 4], value=2)
        q42 = st.select_slider("É tratado com respeito na organização?", options=[0, 1, 2, 3, 4], value=2)
    
    with col2:
        q43 = st.select_slider("As regras são aplicadas igualmente para todos?", options=[0, 1, 2, 3, 4], value=2)
        q44 = st.select_slider("Confia na liderança da organização?", options=[0, 1, 2, 3, 4], value=2)
    
    st.divider()
    
    # Dimensão 12: Liderança
    st.write("**Dimensão 12: Qualidade da Liderança**")
    st.write("*Avaliação da qualidade de liderança*")
    
    col1, col2 = st.columns(2)
    
    with col1:
        q45 = st.select_slider("Seu gestor planeja bem o trabalho?", options=[0, 1, 2, 3, 4], value=2)
        q46 = st.select_slider("Seu gestor distribui o trabalho equitativamente?", options=[0, 1, 2, 3, 4], value=2)
    
    with col2:
        q47 = st.select_slider("Seu gestor comunica claramente os objetivos?", options=[0, 1, 2, 3, 4], value=2)
        q48 = st.select_slider("Seu gestor é um bom modelo de conduta?", options=[0, 1, 2, 3, 4], value=2)
    
    st.divider()
    
    # Dimensão 13: Segurança
    st.write("**Dimensão 13: Segurança do Emprego**")
    st.write("*Preocupação com estabilidade no emprego*")
    
    col1, col2 = st.columns(2)
    
    with col1:
        q49 = st.select_slider("Preocupa-se com a segurança do seu emprego?", options=[0, 1, 2, 3, 4], value=2)
        q50 = st.select_slider("Acha que pode perder seu emprego?", options=[0, 1, 2, 3, 4], value=2)
    
    with col2:
        q51 = st.select_slider("A empresa é estável?", options=[0, 1, 2, 3, 4], value=2)
        q52 = st.select_slider("Há risco de desemprego na sua área?", options=[0, 1, 2, 3, 4], value=2)
    
    st.divider()
    
    # Dimensão 14: Bem-estar
    st.write("**Dimensão 14: Bem-estar (Burnout)**")
    st.write("*Indicadores de esgotamento emocional*")
    
    col1, col2 = st.columns(2)
    
    with col1:
        q53 = st.select_slider("Sente-se esgotado no final do dia?", options=[0, 1, 2, 3, 4], value=2)
        q54 = st.select_slider("Está cansado mentalmente?", options=[0, 1, 2, 3, 4], value=2)
    
    with col2:
        q55 = st.select_slider("Sente-se frustrado no trabalho?", options=[0, 1, 2, 3, 4], value=2)
        q56 = st.select_slider("Acha difícil concentrar-se?", options=[0, 1, 2, 3, 4], value=2)
    
    st.divider()
    
    # Comentários adicionais
    st.subheader("💬 Comentários Adicionais (Opcional)")
    comments = st.text_area("Se desejar adicionar algum comentário", height=80)
    
    st.divider()
    
    # Botões
    col1, col2, col3 = st.columns(3)
    
    with col1:
        if st.button("✅ Enviar Respostas", use_container_width=True):
            if not employee_name or not employee_email or department == "Selecione...":
                st.error("❌ Preencha todos os campos obrigatórios!")
            else:
                # Compilar respostas
                responses = {
                    "q1": q1, "q2": q2, "q3": q3, "q4": q4,
                    "q5": q5, "q6": q6, "q7": q7, "q8": q8,
                    "q9": q9, "q10": q10, "q11": q11, "q12": q12,
                    "q13": q13, "q14": q14, "q15": q15, "q16": q16,
                    "q17": q17, "q18": q18, "q19": q19, "q20": q20,
                    "q21": q21, "q22": q22, "q23": q23, "q24": q24,
                    "q25": q25, "q26": q26, "q27": q27, "q28": q28,
                    "q29": q29, "q30": q30, "q31": q31, "q32": q32,
                    "q33": q33, "q34": q34, "q35": q35, "q36": q36,
                    "q37": q37, "q38": q38, "q39": q39, "q40": q40,
                    "q41": q41, "q42": q42, "q43": q43, "q44": q44,
                    "q45": q45, "q46": q46, "q47": q47, "q48": q48,
                    "q49": q49, "q50": q50, "q51": q51, "q52": q52,
                    "q53": q53, "q54": q54, "q55": q55, "q56": q56,
                    "comments": comments
                }
                
                # Salvar resposta
                response = copsoq_responses_manager.add_response(
                    assessment_id="temp",  # Seria fornecido pelo link
                    employee_name=employee_name,
                    employee_email=employee_email,
                    department=department,
                    responses=responses,
                    token=token
                )
                
                st.success("✅ Respostas enviadas com sucesso!")
                st.write("Obrigado por responder. Seu feedback é valioso para melhorar o ambiente de trabalho.")
                st.balloons()
    
    with col2:
        if st.button("🔄 Limpar Formulário", use_container_width=True):
            st.rerun()
    
    with col3:
        st.write("")  # Espaço

else:
    st.warning("⚠️ Link inválido ou expirado!")
    st.write("Por favor, verifique o link fornecido por email.")
