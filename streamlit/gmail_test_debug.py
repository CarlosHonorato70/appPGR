import smtplib
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv

# Limpar variáveis de ambiente antigas
for key in list(os.environ.keys()):
    if key.startswith('SMTP_'):
        del os.environ[key]

# Recarregar .env
load_dotenv(override=True)

SMTP_SERVER = os.getenv('SMTP_SERVER')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')

print(f"DEBUG: SMTP_SERVER={SMTP_SERVER}")
print(f"DEBUG: SMTP_PORT={SMTP_PORT}")
print(f"DEBUG: SMTP_USER={SMTP_USER}")
print(f"DEBUG: SMTP_PASSWORD={'*' * len(SMTP_PASSWORD) if SMTP_PASSWORD else 'VAZIO'}")

try:
    print("\nConectando ao Gmail SMTP...")
    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10)
    print(f"✅ Conectado ao {SMTP_SERVER}:{SMTP_PORT}")
    
    print("Iniciando STARTTLS...")
    server.starttls()
    print("✅ STARTTLS ativado")
    
    print(f"Autenticando como {SMTP_USER}...")
    server.login(SMTP_USER, SMTP_PASSWORD)
    print("✅ Autenticado com sucesso!")
    
    print("Enviando e-mail de teste...")
    msg = MIMEText("Teste do SMTP Gmail - Black Belt Consultoria\n\nSe recebeu este e-mail, significa que o SMTP está funcionando corretamente!", "plain", "utf-8")
    msg["Subject"] = "✅ Teste SMTP - Black Belt Consultoria"
    msg["From"] = SMTP_USER
    msg["To"] = SMTP_USER
    
    server.sendmail(SMTP_USER, [SMTP_USER], msg.as_string())
    print("✅ E-mail enviado com sucesso!")
    
    server.quit()
    print("\n🎉 SUCESSO! Gmail SMTP está funcionando!")
    
except Exception as e:
    print(f"❌ ERRO: {e}")
    import traceback
    traceback.print_exc()
