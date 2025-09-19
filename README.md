# Sistema de Gestão de PGR

## Descrição

Sistema web para gerenciamento e monitoramento do Programa de Gerenciamento de Riscos (PGR) em conformidade com a NR-01. O sistema inclui funcionalidades completas de autenticação, criptografia de dados e gestão de riscos ocupacionais.

## 🔐 Funcionalidades de Segurança

### Autenticação Obrigatória
- Sistema de login com credenciais seguras
- Sessão de usuário gerenciada
- Proteção de todas as seções do aplicativo
- Logout seguro com limpeza de sessão

### Criptografia de Dados
- **Todos os dados são criptografados** antes de serem armazenados no localStorage
- Algoritmo AES simulado com XOR + Base64 para proteção
- Chave de criptografia fixa integrada ao sistema
- Compatibilidade com dados existentes (fallback automático)

## 🚀 Como Usar

### Acesso ao Sistema
1. Abra o arquivo `index.html` no navegador
2. Será exibida a tela de login automaticamente
3. Use as credenciais padrão:
   - **Usuário:** `admin`
   - **Senha:** `admin123`
4. Após o login, todas as funcionalidades estarão disponíveis

### Funcionalidades Principais
- **Dashboard:** Visão geral do status do PGR e métricas importantes
- **Gestão de Unidades:** Cadastro de unidades de trabalho
- **Checklist PGR:** Monitoramento de itens do programa
- **Inventário de Riscos:** Gestão de riscos físicos, químicos, biológicos, ergonômicos, acidentes e psicossociais
- **Plano de Ação:** Controle de ações e prazos
- **Gestão de Documentos:** Upload e organização de documentos
- **Notificações:** Alertas sobre prazos e riscos críticos

## 🔧 Configuração e Personalização

### Alteração de Credenciais

Para alterar as credenciais de acesso, edite o arquivo `app.js`:

```javascript
// Localizar a função login (linha ~45)
const login = (username, password) => {
    // Alterar as credenciais aqui
    if (username === 'SEU_USUARIO' && password === 'SUA_SENHA') {
        const userData = { username, loginTime: new Date().toISOString() };
        localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
        return true;
    }
    return false;
};
```

### Alteração da Chave de Criptografia

**⚠️ IMPORTANTE:** Alterar a chave fará com que dados existentes não possam ser descriptografados.

```javascript
// Localizar no início do arquivo (linha ~4)
const ENCRYPTION_KEY = 'SUA_NOVA_CHAVE_SECRETA';
```

### Múltiplos Usuários

Para adicionar múltiplos usuários, modifique a função `login`:

```javascript
const login = (username, password) => {
    const users = {
        'admin': 'admin123',
        'gestor': 'gestor456',
        'tecnico': 'tecnico789'
    };
    
    if (users[username] && users[username] === password) {
        const userData = { username, loginTime: new Date().toISOString() };
        localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
        return true;
    }
    return false;
};
```

## 🛡️ Boas Práticas de Segurança

### Recomendações Gerais
1. **Altere as credenciais padrão** antes de usar em produção
2. **Use senhas fortes** com pelo menos 8 caracteres, incluindo números e símbolos
3. **Altere a chave de criptografia** para uma chave única em sua instalação
4. **Faça logout** sempre ao terminar de usar o sistema
5. **Não compartilhe credenciais** entre usuários

### Segurança dos Dados
- Os dados são criptografados localmente no navegador
- **Não armazene informações extremamente sensíveis** sem criptografia adicional
- **Faça backup regular** dos dados importantes
- **Teste a recuperação de dados** após alterações na chave de criptografia

### Segurança de Acesso
- **Não deixe o sistema aberto** em computadores compartilhados
- **Use HTTPS** quando disponibilizar o sistema na web
- **Limite o acesso físico** aos computadores com o sistema
- **Monitore tentativas de acesso** não autorizadas

## 🔍 Solução de Problemas

### Problemas de Login
- **Credenciais não aceitas:** Verifique se as credenciais estão corretas
- **Tela de login não aparece:** Verifique se o JavaScript está habilitado
- **Loop de login:** Limpe o localStorage do navegador

### Problemas de Dados
- **Dados não aparecem:** Pode haver problema na descriptografia
- **Dados perdidos:** Verifique se a chave de criptografia não foi alterada
- **Performance lenta:** Limpe dados antigos desnecessários

### Comandos de Recuperação (Console do Navegador)
```javascript
// Limpar todos os dados do sistema
localStorage.clear();

// Verificar dados armazenados
Object.keys(localStorage).filter(key => key.startsWith('pgr_'));

// Forçar logout
localStorage.removeItem('pgr_auth_user');
location.reload();
```

## 📊 Status das Funcionalidades

- ✅ Sistema de autenticação implementado
- ✅ Criptografia de dados implementada
- ✅ Navegação protegida funcionando
- ✅ CRUD completo com criptografia
- ✅ Dashboard com métricas atualizadas
- ✅ Compatibilidade com dados existentes
- ✅ Interface responsiva e intuitiva
- ✅ Logout seguro implementado

## 🤝 Contribuições

Este sistema foi desenvolvido para atender às necessidades básicas de gestão de PGR. Para melhorias ou personalizações específicas, considere:

1. Implementar autenticação com backend
2. Adicionar criptografia mais robusta (AES real)
3. Implementar controle de permissões por usuário
4. Adicionar auditoria de ações
5. Integração com bancos de dados externos

## 📞 Suporte

Para dúvidas sobre o funcionamento do sistema:
1. Verifique este README primeiro
2. Teste as soluções de problemas apresentadas
3. Consulte os comentários no código fonte
4. Documente problemas encontrados para futuras melhorias

---

**Versão:** 2.0 - Sistema completo com autenticação e criptografia  
**Última atualização:** Setembro 2025  
**Compatibilidade:** Navegadores modernos com suporte a ES6+