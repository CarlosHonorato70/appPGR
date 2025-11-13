from utils.email_sender import smtp_self_test

try:
    smtp_self_test('contato@blackbeltconsultoria.com.br')
    print('✅ Envio de teste solicitado. Verifique a caixa de entrada.')
except Exception as e:
    print('❌ Falha no teste SMTP:', e)
