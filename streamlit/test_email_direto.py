import sys
sys.path.insert(0, 'utils')

from email_sender import send_invitation_email

try:
    print("Testando envio de convite...")
    send_invitation_email(
        to_email="carlos.sergio.sun@gmail.com",
        employee_name="Carlos Sergio",
        invite_link="http://localhost:8501/COPSOQ-II?token=teste123",
        assessment_name="COPSOQ-II Teste"
    )
    print("✅ E-mail enviado com sucesso!")
except Exception as e:
    print(f"❌ ERRO: {e}")
