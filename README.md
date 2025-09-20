# Sistema de Gestão de PGR

Este sistema permite a gestão do Programa de Gerenciamento de Riscos (PGR), em conformidade com a NR-01.

## 🔐 Segurança e Autenticação

### Recursos de Segurança Implementados

- **Hash de Senhas**: Todas as senhas são criptografadas usando algoritmo bcrypt antes do armazenamento
- **Recuperação de Conta**: Sistema de recuperação por email ou pergunta de segurança
- **Validação de Força de Senha**: Senhas devem ter pelo menos 8 caracteres com letras maiúsculas, minúsculas, números e símbolos
- **Migração Automática**: Usuários com senhas antigas são automaticamente migrados para hash seguro no próximo login
- **Logs de Segurança**: Todas as operações de autenticação são registradas para auditoria

### Como Criar uma Conta Segura

1. **Nome de Usuário**: Escolha um nome único (mínimo 3 caracteres)
2. **Senha Forte**: Use pelo menos 8 caracteres incluindo:
   - Letras maiúsculas (A-Z)
   - Letras minúsculas (a-z)  
   - Números (0-9)
   - Símbolos (!@#$%^&*)
3. **Email (Opcional)**: Para recuperação de conta
4. **Pergunta de Segurança**: Para recuperação alternativa

### Recuperação de Senha

Se você esquecer sua senha, pode recuperá-la usando:

1. **Email**: Se cadastrado, confirme seu email para redefinir
2. **Pergunta de Segurança**: Responda corretamente para redefinir

### ⚠️ Avisos de Segurança

- **Frontend Hash**: As senhas são hasheadas no frontend por ser uma aplicação client-side. Em produção, mova o hash para o backend
- **Armazenamento Local**: Os dados ficam armazenados localmente no navegador (IndexedDB)
- **HTTPS**: Use sempre HTTPS em produção para proteger dados em trânsito
- **Backup**: Faça backup regular dos dados importantes
- **Atualizações**: Mantenha o sistema atualizado com as últimas versões de segurança

## Funcionalidades

- **Login seguro** (usuário padrão: admin / senha: admin123)
- Cadastro e gestão de unidades
- Checklist interativo do PGR
- Inventário de diversos tipos de riscos
- Plano de ação para riscos e pendências
- Upload e gestão de documentos (LTCAT, PCMSO, PPR, ASO, EPI)
- Relatórios e dashboards
- Notificações de prazos e ações pendentes
- **Gerenciamento seguro de usuários com recuperação de conta**

## Instalação

1. Clone este repositório:
   ```
   git clone https://github.com/CarlosHonorato70/appPGR.git
   ```
2. Abra o arquivo `index.html` em seu navegador.

## 🛡️ Boas Práticas de Segurança

### Para Usuários

- Nunca compartilhe suas credenciais de acesso
- Use senhas únicas e fortes para cada sistema
- Faça logout ao sair do sistema
- Mantenha suas informações de recuperação atualizadas

### Para Administradores

- Configure HTTPS em produção
- Implemente backups regulares do IndexedDB
- Monitore logs de segurança
- Considere migrar para backend com autenticação JWT
- Implemente rate limiting para tentativas de login

### Arquitetura de Segurança

```
Frontend (Client-Side)
├── bcrypt.js - Hash de senhas
├── SecurityUtils - Utilitários de segurança  
├── IndexedDB - Armazenamento criptografado
└── Validação - Força de senha e dados

Futuro Backend (Server-Side)
├── Autenticação JWT
├── Rate Limiting
├── Logs de Auditoria
└── Banco de Dados Seguro
```

## Observações

- Este sistema é uma versão de demonstração preparada para expansão
- **Hash de senhas implementado com bcrypt.js para máxima segurança**
- **Sistema de recuperação de conta robusto implementado**
- Modular e preparado para migração ao backend
- Para exportação em PDF, recomenda-se integrar bibliotecas como [jsPDF](https://github.com/parallax/jsPDF) ou [html2pdf](https://github.com/eKoopmans/html2pdf.js).

## Licença

MIT
