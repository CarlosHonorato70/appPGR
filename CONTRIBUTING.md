# 🤝 Guia de Contribuição - Black Belt Platform

Obrigado por considerar contribuir para o projeto Black Belt! Este guia fornece instruções sobre como contribuir de forma efetiva.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)

---

## 📜 Código de Conduta

Este projeto adere a um Código de Conduta. Ao participar, espera-se que você mantenha este código. Por favor, reporte comportamento inaceitável para contato@blackbeltconsultoria.com.br.

---

## 🎯 Como Posso Contribuir?

### 1. Reportando Bugs

Antes de criar um relatório de bug:
- Verifique se o bug já foi reportado nas [Issues](https://github.com/CarlosHonorato70/appPGR/issues)
- Se encontrar uma issue existente, adicione um comentário em vez de abrir uma nova

**Como submeter um bom relatório de bug:**

```markdown
## Descrição
[Descrição clara e concisa do bug]

## Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

## Comportamento Esperado
[O que você esperava que acontecesse]

## Comportamento Atual
[O que realmente aconteceu]

## Screenshots
[Se aplicável, adicione screenshots]

## Ambiente
- OS: [e.g. Windows 10, macOS 13, Ubuntu 22.04]
- Node Version: [e.g. 18.17.0]
- Python Version: [e.g. 3.10.12]
- Browser: [e.g. Chrome 120, Firefox 121]
```

### 2. Sugerindo Melhorias

**Como submeter uma boa sugestão de melhoria:**

```markdown
## Resumo
[Descrição clara e concisa da melhoria]

## Motivação
[Por que esta melhoria é necessária]

## Proposta Detalhada
[Como você imagina que isso funcione]

## Alternativas Consideradas
[Outras abordagens que você considerou]

## Impacto
- [ ] Breaking change
- [ ] Nova funcionalidade
- [ ] Melhoria de performance
- [ ] Melhoria de UX
```

### 3. Contribuindo com Código

---

## 🔄 Processo de Desenvolvimento

### Setup do Ambiente

**Backend:**
```bash
cd backend
npm install
cp .env.example .env.local
# Configure as variáveis de ambiente
npm run dev
```

**Frontend:**
```bash
cd streamlit
python -m venv venv
source venv/bin/activate  # ou .\venv\Scripts\Activate.ps1 no Windows
pip install -r requirements.txt
streamlit run app.py
```

### Executando Testes

**Backend:**
```bash
cd backend
npm test                # Rodar todos os testes
npm run test:watch      # Modo watch
npm run test:coverage   # Com cobertura
```

**Frontend:**
```bash
cd streamlit
pytest                  # Quando implementado
```

### Executando Linters

**Backend:**
```bash
cd backend
npm run lint            # ESLint
npm run type-check      # TypeScript
```

---

## 📝 Padrões de Código

### TypeScript/JavaScript

- Use **TypeScript** para todos os novos arquivos
- Siga o guia de estilo [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Configure seu editor para usar ESLint e Prettier
- Mantenha funções pequenas e focadas (max 50 linhas)
- Use nomes descritivos para variáveis e funções

**Exemplo:**

```typescript
/**
 * Calcula a hora técnica baseada em custos e horas produtivas
 * 
 * @param fixedCosts - Custos fixos mensais
 * @param proLabor - Pró-labore mensal
 * @param productiveHours - Horas produtivas por mês
 * @returns Valor da hora técnica
 */
export function calculateTechnicalHour(
  fixedCosts: number,
  proLabor: number,
  productiveHours: number
): number {
  if (productiveHours <= 0) {
    throw new Error('Productive hours must be greater than 0');
  }
  
  const totalCosts = fixedCosts + proLabor;
  return totalCosts / productiveHours;
}
```

### Python

- Siga [PEP 8](https://pep8.org/) style guide
- Use **type hints** para todas as funções
- Docstrings para funções e classes
- Máximo de 88 caracteres por linha (Black formatter)

**Exemplo:**

```python
def calculate_technical_hour(
    fixed_costs: float,
    pro_labor: float,
    productive_hours: float
) -> float:
    """
    Calcula a hora técnica baseada em custos e horas produtivas.
    
    Args:
        fixed_costs: Custos fixos mensais
        pro_labor: Pró-labore mensal
        productive_hours: Horas produtivas por mês
        
    Returns:
        Valor da hora técnica
        
    Raises:
        ValueError: Se productive_hours for <= 0
    """
    if productive_hours <= 0:
        raise ValueError("Productive hours must be greater than 0")
    
    total_costs = fixed_costs + pro_labor
    return total_costs / productive_hours
```

### Testes

- **Escreva testes** para todas as novas funcionalidades
- Mantenha cobertura de código acima de **80%**
- Use nomes descritivos para testes

**Estrutura de Teste:**

```typescript
describe('PricingCalculator', () => {
  describe('calculateTechnicalHour', () => {
    it('should calculate technical hour correctly with valid inputs', () => {
      const result = calculateTechnicalHour(5000, 2000, 160);
      expect(result).toBe(43.75);
    });
    
    it('should throw error when productive hours is zero', () => {
      expect(() => {
        calculateTechnicalHour(5000, 2000, 0);
      }).toThrow('Productive hours must be greater than 0');
    });
  });
});
```

---

## 💬 Commit Guidelines

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

### Formato

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Apenas documentação
- **style**: Formatação, ponto e vírgula, etc (sem mudança de código)
- **refactor**: Refatoração de código
- **perf**: Melhoria de performance
- **test**: Adição ou correção de testes
- **chore**: Manutenção, atualização de dependências

### Exemplos

```bash
feat(pricing): add volume discount calculation

Implementa cálculo de desconto por volume conforme especificado
na issue #123. Adiciona validação e testes unitários.

Closes #123
```

```bash
fix(api): resolve CORS error on production

Configura CORS para aceitar requisições do domínio de produção.
Adiciona teste de integração para verificar headers CORS.

Fixes #456
```

---

## 🔀 Pull Request Process

### 1. Fork o Projeto

```bash
# Clone seu fork
git clone https://github.com/seu-usuario/appPGR.git
cd appPGR

# Adicione o repositório original como upstream
git remote add upstream https://github.com/CarlosHonorato70/appPGR.git
```

### 2. Crie uma Branch

```bash
# Atualize main
git checkout main
git pull upstream main

# Crie nova branch
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-bugfix
```

### 3. Faça suas Mudanças

```bash
# Faça commits incrementais
git add .
git commit -m "feat(scope): descrição da mudança"

# Push para seu fork
git push origin feature/minha-feature
```

### 4. Abra um Pull Request

**Checklist do PR:**

- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Todos os testes passam localmente
- [ ] Commit messages seguem o padrão
- [ ] PR tem título descritivo
- [ ] PR tem descrição completa

**Template do PR:**

```markdown
## Descrição
[Descrição clara das mudanças]

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Atualização de documentação

## Como Testar
1. [Passo 1]
2. [Passo 2]
3. [Verificar resultado esperado]

## Screenshots
[Se aplicável]

## Checklist
- [ ] Meu código segue os padrões do projeto
- [ ] Revisei meu próprio código
- [ ] Comentei código complexo
- [ ] Atualizei a documentação
- [ ] Não gerei novos warnings
- [ ] Adicionei testes
- [ ] Todos os testes passam localmente
```

### 5. Code Review

- Responda aos comentários de forma construtiva
- Faça as alterações solicitadas
- Mantenha a branch atualizada com main:

```bash
git fetch upstream
git rebase upstream/main
git push origin feature/minha-feature --force-with-lease
```

### 6. Merge

Após aprovação, o mantenedor fará o merge do seu PR.

---

## 🐛 Reportando Bugs

### Informações Necessárias

1. **Descrição clara** do bug
2. **Passos para reproduzir**
3. **Comportamento esperado vs. atual**
4. **Screenshots** (se aplicável)
5. **Ambiente**:
   - Sistema operacional
   - Versão do Node.js
   - Versão do Python
   - Browser (se aplicável)
6. **Logs relevantes**

### Template de Bug Report

Disponível em [.github/ISSUE_TEMPLATE/bug_report.md](.github/ISSUE_TEMPLATE/bug_report.md)

---

## 💡 Sugerindo Melhorias

### Áreas de Contribuição

- **Backend**: APIs, validação, performance
- **Frontend**: UX/UI, componentes, integrações
- **Testes**: Cobertura, casos de uso
- **Documentação**: Guias, exemplos, API docs
- **DevOps**: CI/CD, Docker, monitoring
- **Segurança**: Vulnerabilidades, best practices

### Como Sugerir

1. Verifique se já não foi sugerido em [Issues](https://github.com/CarlosHonorato70/appPGR/issues)
2. Use o template apropriado
3. Seja específico e forneça contexto
4. Considere implementar você mesmo!

---

## 📞 Contato

- **Email**: contato@blackbeltconsultoria.com.br
- **Issues**: [GitHub Issues](https://github.com/CarlosHonorato70/appPGR/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CarlosHonorato70/appPGR/discussions)

---

## 📚 Recursos Adicionais

- [Documentação Completa](./README_INTEGRATED.md)
- [Guia de Início Rápido](./QUICKSTART.md)
- [Análise de Melhorias](./IMPROVEMENTS.md)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Python Best Practices](https://docs.python-guide.org/)
- [Streamlit Documentation](https://docs.streamlit.io/)

---

**Obrigado por contribuir! 🎉**

Toda contribuição, por menor que seja, é valiosa e apreciada.
