import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from copsoq_invites import create_invite

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "blackbeltconsultoria2025@gmail.com"
SMTP_PASSWORD = "pxitmtbvazvcntzw"
SENDER_NAME = "Black Belt Consultoria"
REPLY_TO = "blackbeltconsultoria2025@gmail.com"
APP_BASE_URL = "http://localhost:8501"

def render_invite_email(employee_name, invite_link, assessment_name="COPSOQ-II"):
    html_body = f"""<html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <div style="background-color: #1a73e8; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Convite para Participar</h1>
                </div>
                
                <div style="padding: 20px;">
                    <p>Ola <strong>{employee_name}</strong>,</p>
                    
                    <p>Voce foi convidado a participar da seguinte avaliacao:</p>
                    
                    <div style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #1a73e8; margin: 15px 0;">
                        <h3 style="margin: 0; color: #1a73e8;">{assessment_name}</h3>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Questionario de Avaliacao Psicossocial no Trabalho</p>
                    </div>
                    
                    <p><strong>O que voce precisa fazer:</strong></p>
                    <ol>
                        <li>Clique no botao abaixo</li>
                        <li>Responda as 41 perguntas com honestidade</li>
                        <li>Envie suas respostas</li>
                    </ol>
                    
                    <p style="text-align: center; margin: 25px 0;">
                        <a href="{invite_link}" style="background-color: #1a73e8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                            Responder Questionario
                        </a>
                    </p>
                    
                    <p><strong>Tempo estimado:</strong> 15-20 minutos</p>
                    
                    <p><small><strong>Nota:</strong> Suas respostas sao completamente confidenciais e anonimas. Voce tera acesso apenas a este questionario.</small></p>
                    
                    <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
                        <strong>Se o botao acima nao funcionar, copie e cole este link no seu navegador:</strong><br>
                        <code style="background-color: #f5f5f5; padding: 10px; border-radius: 3px; display: block; margin-top: 5px; word-break: break-all;">{invite_link}</code>
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    
                    <p style="color: #666; font-size: 12px; text-align: center;">
                        <strong>Black Belt Consultoria</strong><br>
                        Expertise em Qualidade, Produtividade e Gestao<br>
                        <a href="mailto:{REPLY_TO}" style="color: #1a73e8; text-decoration: none;">{REPLY_TO}</a>
                    </p>
                </div>
            </div>
        </body>
    </html>"""
    return html_body

def send_email(to_email, subject, html_content, text_content=None):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{SENDER_NAME} <{SMTP_USER}>"
        msg["Reply-To"] = REPLY_TO
        msg["To"] = to_email
        
        if text_content:
            msg.attach(MIMEText(text_content, "plain", "utf-8"))
        
        msg.attach(MIMEText(html_content, "html", "utf-8"))
        
        print(f"[EMAIL] Conectando a {SMTP_SERVER}:{SMTP_PORT}...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10)
        server.starttls()
        print(f"[EMAIL] Autenticando...")
        server.login(SMTP_USER, SMTP_PASSWORD)
        print(f"[EMAIL] Enviando para {to_email}...")
        server.sendmail(SMTP_USER, [to_email], msg.as_string())
        server.quit()
        
        print(f"[EMAIL] ✅ Sucesso: e-mail enviado para {to_email}")
        return True
        
    except Exception as e:
        print(f"[EMAIL] ❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        raise Exception(f"Erro ao enviar e-mail para {to_email}: {str(e)}")

def send_invitation_email(to_email, employee_name, assessment_name="COPSOQ-II"):
    """Enviar convite com token garantido"""
    try:
        print(f"\n[INVITE_SEND] Iniciando envio para {to_email}...")
        
        # IMPORTANTE: Criar o convite primeiro
        print(f"[INVITE_SEND] Criando token...")
        token, invite_link = create_invite(employee_name, to_email)
        
        print(f"[INVITE_SEND] Token criado: {token[:20]}...")
        print(f"[INVITE_SEND] Link: {invite_link}")
        
        # Renderizar email
        html_body = render_invite_email(employee_name, invite_link, assessment_name)
        
        text_body = f"""Ola {employee_name},

Voce foi convidado a participar da avaliacao: {assessment_name}

Por favor, clique no link abaixo para responder o questionario:
{invite_link}

O questionario leva aproximadamente 15-20 minutos para ser concluido.

Todas as respostas sao confidenciais e anonimas.
Voce tera acesso apenas a este questionario.

Atenciosamente,
Black Belt Consultoria
Expertise em Qualidade, Produtividade e Gestao
"""
        
        subject = f"Convite: {assessment_name} - Black Belt Consultoria"
        
        # Enviar email
        send_email(to_email, subject, html_body, text_body)
        
        print(f"[INVITE_SEND] ✅ Convite enviado com sucesso para {to_email}")
        
        return True, token
        
    except Exception as e:
        print(f"[INVITE_SEND] ❌ Erro: {e}")
        raise Exception(f"Erro ao enviar convite para {to_email}: {str(e)}")
