import smtplib
from email.mime.text import MIMEText

SMTP_SERVER = "smtp.titan.email"
SMTP_PORT = 587
SMTP_USER = "contato@blackbeltconsultoria.com.br"
SMTP_PASSWORD = input("Digite a senha do e-mail Titan: ")

try:
    print("Conectando ao servidor SMTP...")
    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    print(f"✅ Conectado ao {SMTP_SERVER}:{SMTP_PORT}")
    
    print("Iniciando STARTTLS...")
    server.starttls()
    print("✅ STARTTLS ativado")
    
    print(f"Autenticando como {SMTP_USER}...")
    server.login(SMTP_USER, SMTP_PASSWORD)
    print("✅ Autenticado com sucesso!")
    
    print("Enviando e-mail de teste...")
    msg = MIMEText("Teste de SMTP - Black Belt Consultoria", "plain", "utf-8")
    msg["Subject"] = "Teste SMTP - Black Belt"
    msg["From"] = SMTP_USER
    msg["To"] = SMTP_USER
    
    server.sendmail(SMTP_USER, [SMTP_USER], msg.as_string())
    print("✅ E-mail enviado com sucesso!")
    
    server.quit()
    print("✅ Conexão encerrada")
    
except Exception as e:
    print(f"❌ ERRO: {e}")
