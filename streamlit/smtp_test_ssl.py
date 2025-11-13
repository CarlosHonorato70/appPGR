import smtplib
from email.mime.text import MIMEText
import ssl

SMTP_SERVER = "smtp.titan.email"
SMTP_PORT = 465
SMTP_USER = "contato@blackbeltconsultoria.com.br"
SMTP_PASSWORD = input("Digite a senha do e-mail Titan: ")

try:
    print("Conectando com SSL na porta 465...")
    context = ssl.create_default_context()
    server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=context)
    print(f"✅ Conectado com SSL")
    
    print(f"Autenticando como {SMTP_USER}...")
    server.login(SMTP_USER, SMTP_PASSWORD)
    print("✅ Autenticado com sucesso!")
    
    print("Enviando e-mail de teste...")
    msg = MIMEText("Teste de SMTP SSL - Black Belt", "plain", "utf-8")
    msg["Subject"] = "Teste SMTP SSL - Black Belt"
    msg["From"] = SMTP_USER
    msg["To"] = SMTP_USER
    
    server.sendmail(SMTP_USER, [SMTP_USER], msg.as_string())
    print("✅ E-mail enviado com sucesso!")
    
    server.quit()
    print("✅ Conexão encerrada")
    
except Exception as e:
    print(f"❌ ERRO: {e}")
