# Configurações de email para Black Belt

SMTP_CONFIG = {
    "server": "seu-servidor-smtp.com",
    "port": 587,
    "email": "seu-email@blackbelt.com.br",
    "password": "sua-senha"
}

EMAIL_TEMPLATE_COPSOQ = """
Prezado(a) {employee_name},

Você foi convidado a participar de uma avaliação de riscos psicossociais no trabalho.

Por favor, clique no link abaixo para responder ao questionário COPSOQ-II:

{link}

O questionário leva aproximadamente 15-20 minutos para ser respondido.

Suas respostas são confidenciais e serão usadas apenas para melhorar as condições de trabalho.

Obrigado pela participação!

---
Black Belt Consultoria
www.blackbelt.com.br
"""

EMAIL_TEMPLATE_REMINDER = """
Prezado(a) {employee_name},

Este é um lembrete para responder ao questionário COPSOQ-II.

Você ainda não respondeu ao formulário. Clique no link abaixo:

{link}

Obrigado!

---
Black Belt Consultoria
"""
