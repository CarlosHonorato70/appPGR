import smtplib
from email.mime.text import MIMEText

# Valores diretos (sem .env)
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "blackbeltconsultoria2025@gmail.com"
SMTP_PASSWORD = "pxitmtbvazvcntzw"

print(f"DEBUG: SMTP_SERVER={SMTP_SERVER}")
print(f"DEBUG: SMTP_PORT={SMTP_PORT}")
print(f"DEBUG: SMTP_USER={SMTP_USER}")

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
