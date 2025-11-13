import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ✅ VALORES DIRETOS (sem .env)
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "blackbeltconsultoria2025@gmail.com"
SMTP_PASSWORD = "pxitmtbvazvcntzw"
SENDER_NAME = "Black Belt Consultoria"
REPLY_TO = "blackbeltconsultoria2025@gmail.com"
APP_BASE_URL = "http://localhost:8501"

def render_invite_email(employee_name, invite_link, assessment_name):
    """Renderizar o HTML do e-mail de convite"""
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1a73e8;">Convite para Participar</h2>
                
                <p>Olá <strong>{employee_name}</strong>,</p>
                
                <p>Você foi convidado a participar da avaliação:</p>
                <p style="background-color: #f0f0f0; padding: 10px; border-left: 4px solid #1a73e8;">
                    <strong>{assessment_name}</strong>
                </p>
                
                <p>Por favor, clique no botão abaixo para responder o questionário:</p>
                
                <p>
                    <a href="{invite_link}" style="background-color: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Responder Questionário
                    </a>
                </p>
                
                <p>O questionário leva aproximadamente 15-20 minutos para ser concluído.</p>
                
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    Link direto: <a href="{invite_link}">{invite_link}</a>
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                
                <p style="color: #666; font-size: 12px;">
                    <strong>Black Belt Consultoria</strong><br>
                    Expertise em Qualidade, Produtividade e Gestão
                </p>
            </div>
        </body>
    </html>
    """
    return html_body

def send_email(to_email, subject, html_content, text_content=None):
    """Enviar e-mail genérico"""
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{SENDER_NAME} <{SMTP_USER}>"
        msg['Reply-To'] = REPLY_TO
        msg['To'] = to_email
        
        if text_content:
            msg.attach(MIMEText(text_content, 'plain', 'utf-8'))
        
        msg.attach(MIMEText(html_content, 'html', 'utf-8'))
        
        print(f"[DEBUG] Conectando a {SMTP_SERVER}:{SMTP_PORT}...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10)
        server.starttls()
        print(f"[DEBUG] Autenticando como {SMTP_USER}...")
        server.login(SMTP_USER, SMTP_PASSWORD)
        print(f"[DEBUG] Enviando para {to_email}...")
        server.sendmail(SMTP_USER, [to_email], msg.as_string())
        server.quit()
        
        print(f"[DEBUG] ✅ E-mail enviado para {to_email}")
        return True
        
    except Exception as e:
        print(f"[DEBUG] ❌ Erro ao enviar e-mail: {e}")
        import traceback
        traceback.print_exc()
        raise Exception(f"Erro ao enviar e-mail para {to_email}: {str(e)}")

def send_invitation_email(to_email, employee_name, invite_link, assessment_name):
    """Enviar e-mail de convite com o link de resposta"""
    
    try:
        # Renderizar HTML
        html_body = render_invite_email(employee_name, invite_link, assessment_name)
        
        # Versão em texto puro
        text_body = f"""
Olá {employee_name},

Você foi convidado a participar da avaliação: {assessment_name}

Por favor, clique no link abaixo para responder o questionário:
{invite_link}

O questionário leva aproximadamente 15-20 minutos para ser concluído.

Atenciosamente,
Black Belt Consultoria
Expertise em Qualidade, Produtividade e Gestão
        """
        
        subject = f"Convite: {assessment_name} - Black Belt Consultoria"
        
        return send_email(to_email, subject, html_body, text_body)
        
    except Exception as e:
        raise Exception(f"Erro ao enviar convite para {to_email}: {str(e)}")

def send_test_email():
    """Enviar e-mail de teste"""
    return send_invitation_email(
        to_email=SMTP_USER,
        employee_name="Teste",
        invite_link=f"{APP_BASE_URL}/COPSOQ-II?token=teste123",
        assessment_name="COPSOQ-II Teste"
    )
