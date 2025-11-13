import os
import smtplib
from email.mime.text import MIMEText
from email.utils import formataddr
from dotenv import load_dotenv
from pathlib import Path

def load_env_robust():
    load_dotenv(override=True)
    here = Path(__file__).resolve().parent
    if not os.getenv('SMTP_SERVER'):
        load_dotenv(dotenv_path=here / '.env', override=True)
    if not os.getenv('SMTP_SERVER'):
        load_dotenv(dotenv_path=here.parent / '.env', override=True)

load_env_robust()

SMTP_SERVER = os.getenv('SMTP_SERVER', '')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
APP_BASE_URL = os.getenv('APP_BASE_URL', 'http://localhost:8501')
SENDER_NAME = os.getenv('SENDER_NAME', 'Black Belt Consultoria')
REPLY_TO = os.getenv('REPLY_TO', '')

def send_email(to_email: str, subject: str, html_body: str, sender_name: str = None):
    missing = [k for k in ['SMTP_SERVER', 'SMTP_USER', 'SMTP_PASSWORD'] if not os.getenv(k)]
    if missing:
        raise RuntimeError(f'Configuração SMTP ausente (.env). Defina {", ".join(missing)}.')

    sender_name = sender_name or SENDER_NAME
    msg = MIMEText(html_body, 'html', 'utf-8')
    msg['Subject'] = subject
    msg['From'] = formataddr((sender_name, SMTP_USER))
    msg['To'] = to_email
    if REPLY_TO:
        msg['Reply-To'] = REPLY_TO

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()  # Titan requer STARTTLS na 587
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, [to_email], msg.as_string())

def render_invite_email(employee_name: str, link: str):
    return f"""
    <div style='font-family: Arial, sans-serif;'>
      <p>Prezado(a) {employee_name},</p>
      <p>Você foi convidado(a) a responder o questionário COPSOQ-II (NR-01) para avaliação de riscos psicossociais.</p>
      <p><b>Acesse o formulário pelo link abaixo:</b><br>
      <a href="{link}" target="_blank">{link}</a></p>
      <p>O questionário leva ~15-20 minutos. Suas respostas são confidenciais.</p>
      <hr />
      <p style='color:#666'>Black Belt Consultoria</p>
    </div>
    """

def smtp_self_test(target_email: str):
    html = '<p>Teste SMTP Black Belt (Titan) ✅</p>'
    send_email(target_email, 'Teste SMTP - Black Belt (Titan)', html)
