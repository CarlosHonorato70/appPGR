# COPSOQ-II ESTRUTURA
# Conforme manual Portugal 2013 e versão curta

COPSOQ_DIMENSIONS = {
    "Demandas Quantitativas": {
        "nome": "Demandas Quantitativas",
        "descricao": "Quantidade de trabalho e pressão de tempo",
        "questoes": [
            "Você tem que trabalhar muito rápido?",
            "O seu trabalho exige decisões rápidas?",
            "Você tem tempo suficiente para executar bem o seu trabalho?",
            "Precisa trabalhar horas extras?"
        ],
        "escala": "0-4"  # 0=Nunca, 4=Sempre
    },
    
    "Demandas Emotivas": {
        "nome": "Demandas Emotivas",
        "descricao": "Exigências emocionais do trabalho",
        "questoes": [
            "O seu trabalho é emocionalmente exigente?",
            "Você precisa esconder seus sentimentos no trabalho?",
            "É difícil desligar do trabalho depois do turno?",
            "O seu trabalho afeta sua saúde?"
        ],
        "escala": "0-4"
    },
    
    "Demandas Cognitivas": {
        "nome": "Demandas Cognitivas",
        "descricao": "Exigências de concentração e atenção",
        "questoes": [
            "O seu trabalho exige concentração intensa?",
            "Você tem de guardar muitas informações?",
            "Comete erros com frequência?",
            "Necessita pensar rápido?"
        ],
        "escala": "0-4"
    },
    
    "Influência no Trabalho": {
        "nome": "Influência no Trabalho",
        "descricao": "Capacidade de influenciar decisões sobre o trabalho",
        "questoes": [
            "Pode influenciar as decisões sobre seu trabalho?",
            "Tem voz nas decisões importantes?",
            "Pode influenciar o ritmo de trabalho?",
            "Pode influenciar os prazos?"
        ],
        "escala": "0-4"  # 0=Sem influência, 4=Grande influência
    },
    
    "Possibilidade de Desenvolvimento": {
        "nome": "Possibilidade de Desenvolvimento",
        "descricao": "Oportunidades de aprendizado e desenvolvimento",
        "questoes": [
            "Aprende coisas novas no trabalho?",
            "Pode aplicar suas habilidades?",
            "Sente que está se desenvolvendo profissionalmente?",
            "Tem oportunidades de qualificação?"
        ],
        "escala": "0-4"  # 0=Nunca, 4=Sempre
    },
    
    "Variedade do Trabalho": {
        "nome": "Variedade do Trabalho",
        "descricao": "Diversidade nas tarefas realizadas",
        "questoes": [
            "Seu trabalho é variado?",
            "Realiza tarefas muito diferentes?",
            "Tem monotonia no trabalho?",
            "Realiza o mesmo tipo de trabalho todos os dias?"
        ],
        "escala": "0-4"
    },
    
    "Significado do Trabalho": {
        "nome": "Significado do Trabalho",
        "descricao": "Sentido e propósito do trabalho",
        "questoes": [
            "Sente que seu trabalho é significativo?",
            "Seu trabalho contribui para algo importante?",
            "Sente-se orgulhoso do seu trabalho?",
            "Acredita que seu trabalho é relevante?"
        ],
        "escala": "0-4"  # 0=Discordo totalmente, 4=Concordo totalmente
    },
    
    "Compromisso com o Trabalho": {
        "nome": "Compromisso com o Trabalho",
        "descricao": "Envolvimento e dedicação ao trabalho",
        "questoes": [
            "Está comprometido com o seu trabalho?",
            "Trabalha com empenho?",
            "Sente-se entusiasmado com seu trabalho?",
            "Dedica-se totalmente ao trabalho?"
        ],
        "escala": "0-4"
    },
    
    "Suporte Social do Gestor": {
        "nome": "Suporte Social do Gestor",
        "descricao": "Apoio recebido do supervisor/gerente",
        "questoes": [
            "Seu gestor ajuda a resolver problemas?",
            "Seu gestor ouve seus problemas?",
            "Seu gestor valoriza seu trabalho?",
            "Seu gestor oferece feedback construtivo?"
        ],
        "escala": "0-4"  # 0=Nunca, 4=Sempre
    },
    
    "Suporte Social dos Colegas": {
        "nome": "Suporte Social dos Colegas",
        "descricao": "Apoio recebido dos colegas de trabalho",
        "questoes": [
            "Seus colegas ajudam quando tem problemas?",
            "Existe boa comunicação entre os colegas?",
            "Sente-se parte do grupo?",
            "Há cooperação entre os colegas?"
        ],
        "escala": "0-4"  # 0=Nunca, 4=Sempre
    },
    
    "Justiça Organizacional": {
        "nome": "Justiça Organizacional",
        "descricao": "Percepção de justiça nas decisões organizacionais",
        "questoes": [
            "As decisões na organização são justas?",
            "É tratado com respeito na organização?",
            "As regras são aplicadas igualmente para todos?",
            "Confia na liderança da organização?"
        ],
        "escala": "0-4"  # 0=Discordo totalmente, 4=Concordo totalmente
    },
    
    "Qualidade da Liderança": {
        "nome": "Qualidade da Liderança",
        "descricao": "Avaliação da qualidade de liderança",
        "questoes": [
            "Seu gestor planeja bem o trabalho?",
            "Seu gestor distribui o trabalho equitativamente?",
            "Seu gestor comunica claramente os objetivos?",
            "Seu gestor é um bom modelo de conduta?"
        ],
        "escala": "0-4"  # 0=Discordo totalmente, 4=Concordo totalmente
    },
    
    "Segurança do Emprego": {
        "nome": "Segurança do Emprego",
        "descricao": "Preocupação com estabilidade no emprego",
        "questoes": [
            "Preocupa-se com a segurança do seu emprego?",
            "Acha que pode perder seu emprego?",
            "A empresa é estável?",
            "Há risco de desemprego na sua área?"
        ],
        "escala": "0-4"  # 0=Muito preocupado, 4=Sem preocupação
    },
    
    "Bem-estar (Burnout)": {
        "nome": "Bem-estar (Burnout)",
        "descricao": "Indicadores de esgotamento emocional",
        "questoes": [
            "Sente-se esgotado no final do dia?",
            "Está cansado mentalmente?",
            "Sente-se frustrado no trabalho?",
            "Acha difícil concentrar-se?"
        ],
        "escala": "0-4"  # 0=Nunca, 4=Sempre
    },
    
    "Absenteísmo": {
        "nome": "Absenteísmo",
        "descricao": "Indicadores de afastamento do trabalho",
        "questoes": [
            "Quantos dias faltou nos últimos 3 meses?",
            "Teve absenteísmo por motivos de saúde?",
            "Teve que se ausentar por razões de bem-estar?",
            "Sofreu acidentes de trabalho?"
        ],
        "escala": "Numérica"
    },
    
    "Retenção de Pessoal": {
        "nome": "Retenção de Pessoal",
        "descricao": "Intenção de permanecer na empresa",
        "questoes": [
            "Planeja deixar a empresa no próximo ano?",
            "Está procurando outro emprego?",
            "Continuaria aqui se tivesse outras opções?",
            "Recomendaria esta empresa como empregadora?"
        ],
        "escala": "0-4"  # 0=Sim, deixaria, 4=Não, ficaria
    }
}
