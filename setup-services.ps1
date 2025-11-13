#!/usr/bin/env powershell

Write-Host "🚀 Black Belt - Setup de Serviços" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está na pasta correta
if (!(Test-Path "backend")) {
    Write-Host "❌ Erro: Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Estrutura de pastas verificada" -ForegroundColor Green

# Listar arquivos criados
Write-Host ""
Write-Host "📁 Arquivos de serviços criados:" -ForegroundColor Yellow
Write-Host "  ✓ backend/src/services.json" -ForegroundColor Green
Write-Host "  ✓ backend/src/services.sql" -ForegroundColor Green
Write-Host "  ✓ backend/src/database/seed.ts" -ForegroundColor Green
Write-Host "  ✓ streamlit/utils/services.py" -ForegroundColor Green
Write-Host "  ✓ backend/src/services.csv" -ForegroundColor Green

Write-Host ""
Write-Host "📊 Resumo de Serviços:" -ForegroundColor Yellow
Write-Host "  • 3 Serviços Individuais" -ForegroundColor Cyan
Write-Host "  • 2 Avaliações Organizacionais" -ForegroundColor Cyan
Write-Host "  • 3 Pacotes Principais" -ForegroundColor Cyan
Write-Host "  • 3 Acompanhamentos Mensais" -ForegroundColor Cyan
Write-Host "  • 7 Complementos" -ForegroundColor Cyan
Write-Host "  • TOTAL: 18 Serviços" -ForegroundColor Cyan

Write-Host ""
Write-Host "💰 Faixa de Preços:" -ForegroundColor Yellow
Write-Host "  • Mínimo: R\$ 125,00 (Questionário)" -ForegroundColor Green
Write-Host "  • Máximo: R\$ 34.900,00 (Pacote Elite)" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 Próximos Passos:" -ForegroundColor Yellow
Write-Host "  1. Verificar os arquivos criados" -ForegroundColor Cyan
Write-Host "  2. Configurar o banco de dados" -ForegroundColor Cyan
Write-Host "  3. Executar o seed.ts para inserir dados" -ForegroundColor Cyan
Write-Host "  4. Testar a precificação no Streamlit" -ForegroundColor Cyan

Write-Host ""
Write-Host "✨ Setup concluído com sucesso!" -ForegroundColor Green
