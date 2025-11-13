import requests
import json

API_URL = "http://localhost:3000/trpc"

SERVICES = [
    {
        "id": "srv-001",
        "name": "Questionário Individual",
        "price": 125.00,
        "category": "Serviços Individuais"
    },
    {
        "id": "srv-002",
        "name": "Entrevista Individual",
        "price": 337.50,
        "category": "Serviços Individuais"
    },
    {
        "id": "srv-003",
        "name": "Avaliação Completa Individual",
        "price": 510.00,
        "category": "Serviços Individuais"
    },
    {
        "id": "srv-004",
        "name": "Avaliação 10 Pessoas + Relatório",
        "price": 2500.00,
        "category": "Avaliações Organizacionais"
    },
    {
        "id": "srv-005",
        "name": "Avaliação Micro/Pequena Empresa",
        "price": 3750.00,
        "category": "Avaliações Organizacionais"
    },
    {
        "id": "srv-006",
        "name": "Pacote Essencial NR-01",
        "price": 12800.00,
        "category": "Pacotes Principais"
    },
    {
        "id": "srv-007",
        "name": "Pacote Avançado NR-01",
        "price": 22900.00,
        "category": "Pacotes Principais"
    },
    {
        "id": "srv-008",
        "name": "Pacote Elite NR-01",
        "price": 34900.00,
        "category": "Pacotes Principais"
    },
    {
        "id": "srv-009",
        "name": "Acompanhamento Mensal Basic",
        "price": 1900.00,
        "category": "Acompanhamento Mensal"
    },
    {
        "id": "srv-010",
        "name": "Acompanhamento Mensal Standard",
        "price": 3400.00,
        "category": "Acompanhamento Mensal"
    },
    {
        "id": "srv-011",
        "name": "Acompanhamento Mensal Executive",
        "price": 5900.00,
        "category": "Acompanhamento Mensal"
    },
    {
        "id": "srv-012",
        "name": "Plano de Ação Customizado",
        "price": 1750.00,
        "category": "Complementos"
    },
    {
        "id": "srv-013",
        "name": "Workshop NR-01 (4 horas)",
        "price": 2000.00,
        "category": "Complementos"
    },
    {
        "id": "srv-014",
        "name": "Consultoria Mensal Contínua",
        "price": 2750.00,
        "category": "Complementos"
    },
    {
        "id": "srv-015",
        "name": "Palestra Presencial",
        "price": 1150.00,
        "category": "Complementos"
    },
    {
        "id": "srv-016",
        "name": "Palestra Online",
        "price": 700.00,
        "category": "Complementos"
    },
    {
        "id": "srv-017",
        "name": "Treinamento de Gestores",
        "price": 1900.00,
        "category": "Complementos"
    },
    {
        "id": "srv-018",
        "name": "Simulado Incidente Crítico",
        "price": 3000.00,
        "category": "Complementos"
    }
]

def get_services_by_category(category=None):
    if category:
        return [s for s in SERVICES if s["category"] == category]
    return SERVICES

def get_service_by_id(service_id):
    for s in SERVICES:
        if s["id"] == service_id:
            return s
    return None

def get_categories():
    return list(set([s["category"] for s in SERVICES]))
