import json
import os
from datetime import datetime

# Dados dos 18 serviços da Black Belt
INITIAL_SERVICES = [
    {
        "id": "srv-001",
        "name": "Questionário Individual",
        "description": "Questionário de avaliação de riscos psicossociais por pessoa",
        "price": 125.00,
        "hours": 0.5,
        "category": "Serviços Individuais"
    },
    {
        "id": "srv-002",
        "name": "Entrevista Individual",
        "description": "Entrevista aprofundada de avaliação de riscos",
        "price": 337.50,
        "hours": 1.0,
        "category": "Serviços Individuais"
    },
    {
        "id": "srv-003",
        "name": "Avaliação Completa Individual",
        "description": "Avaliação completa incluindo questionário + entrevista",
        "price": 510.00,
        "hours": 1.5,
        "category": "Serviços Individuais"
    },
    {
        "id": "srv-004",
        "name": "Avaliação 10 Pessoas + Relatório",
        "description": "Avaliação organizacional para 10 pessoas com relatório executivo",
        "price": 2500.00,
        "hours": 20.0,
        "category": "Avaliações Organizacionais"
    },
    {
        "id": "srv-005",
        "name": "Avaliação Micro/Pequena Empresa",
        "description": "Avaliação completa para empresa com até 50 funcionários",
        "price": 3750.00,
        "hours": 30.0,
        "category": "Avaliações Organizacionais"
    },
    {
        "id": "srv-006",
        "name": "Pacote Essencial NR-01",
        "description": "Pacote completo com avaliação inicial, análise e recomendações - 4-6 semanas",
        "price": 12800.00,
        "hours": 80.0,
        "category": "Pacotes Principais"
    },
    {
        "id": "srv-007",
        "name": "Pacote Avançado NR-01",
        "description": "Pacote com diagnóstico profundo, plano de ação e acompanhamento inicial - 6-8 semanas",
        "price": 22900.00,
        "hours": 140.0,
        "category": "Pacotes Principais"
    },
    {
        "id": "srv-008",
        "name": "Pacote Elite NR-01",
        "description": "Pacote premium com implementação completa, treinamento e gestão contínua - 8-12 semanas",
        "price": 34900.00,
        "hours": 220.0,
        "category": "Pacotes Principais"
    },
    {
        "id": "srv-009",
        "name": "Acompanhamento Mensal Basic",
        "description": "Acompanhamento mensal básico - suporte para implementação",
        "price": 1900.00,
        "hours": 12.0,
        "category": "Acompanhamento Mensal"
    },
    {
        "id": "srv-010",
        "name": "Acompanhamento Mensal Standard",
        "description": "Acompanhamento mensal padrão - consultoria completa (10% desconto anual: R$ 3.060)",
        "price": 3400.00,
        "hours": 24.0,
        "category": "Acompanhamento Mensal"
    },
    {
        "id": "srv-011",
        "name": "Acompanhamento Mensal Executive",
        "description": "Acompanhamento mensal executive - suporte premium (10% desconto anual: R$ 5.310)",
        "price": 5900.00,
        "hours": 40.0,
        "category": "Acompanhamento Mensal"
    },
    {
        "id": "srv-012",
        "name": "Plano de Ação Customizado",
        "description": "Elaboração de plano de ação personalizado",
        "price": 1750.00,
        "hours": 14.0,
        "category": "Complementos"
    },
    {
        "id": "srv-013",
        "name": "Workshop NR-01 (4 horas)",
        "description": "Workshop de sensibilização e treinamento sobre NR-01",
        "price": 2000.00,
        "hours": 4.0,
        "category": "Complementos"
    },
    {
        "id": "srv-014",
        "name": "Consultoria Mensal Contínua",
        "description": "Consultoria contínua para implementação de ações",
        "price": 2750.00,
        "hours": 20.0,
        "category": "Complementos"
    },
    {
        "id": "srv-015",
        "name": "Palestra Presencial",
        "description": "Palestra presencial sobre riscos psicossociais",
        "price": 1150.00,
        "hours": 2.0,
        "category": "Complementos"
    },
    {
        "id": "srv-016",
        "name": "Palestra Online",
        "description": "Palestra online sobre riscos psicossociais",
        "price": 700.00,
        "hours": 2.0,
        "category": "Complementos"
    },
    {
        "id": "srv-017",
        "name": "Treinamento de Gestores",
        "description": "Treinamento especializado para gestores sobre NR-01",
        "price": 1900.00,
        "hours": 8.0,
        "category": "Complementos"
    },
    {
        "id": "srv-018",
        "name": "Simulado Incidente Crítico",
        "description": "Simulação de gerenciamento de incidente psicossocial crítico",
        "price": 3000.00,
        "hours": 24.0,
        "category": "Complementos"
    }
]

def initialize_services():
    """Inicializa o banco de dados com os 18 serviços"""
    db_file = 'services_db.json'
    
    # Verificar se o arquivo já existe
    if os.path.exists(db_file):
        print(f"✅ Banco de dados já existe: {db_file}")
        with open(db_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"✅ {len(data.get('services', []))} serviços carregados")
        return
    
    # Criar novo banco com os 18 serviços
    data = {
        'services': INITIAL_SERVICES,
        'created_at': datetime.now().isoformat(),
        'version': '1.0'
    }
    
    with open(db_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("✅ Banco de dados criado com sucesso!")
    print(f"✅ {len(INITIAL_SERVICES)} serviços inseridos!")
    print(f"✅ Arquivo: {db_file}")

if __name__ == "__main__":
    initialize_services()
