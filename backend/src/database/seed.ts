import { db } from './database';
import { services } from './database/schema';
import { v4 as uuidv4 } from 'uuid';

const servicesData = [
  {
    name: 'Questionário Individual',
    description: 'Questionário de avaliação de riscos psicossociais por pessoa',
    basePrice: 125.00,
    estimatedHours: 0.5
  },
  {
    name: 'Entrevista Individual',
    description: 'Entrevista aprofundada de avaliação de riscos',
    basePrice: 337.50,
    estimatedHours: 1.0
  },
  {
    name: 'Avaliação Completa Individual',
    description: 'Avaliação completa incluindo questionário + entrevista',
    basePrice: 510.00,
    estimatedHours: 1.5
  },
  {
    name: 'Avaliação 10 Pessoas + Relatório',
    description: 'Avaliação organizacional para 10 pessoas com relatório executivo',
    basePrice: 2500.00,
    estimatedHours: 20.0
  },
  {
    name: 'Avaliação Micro/Pequena Empresa',
    description: 'Avaliação completa para empresa com até 50 funcionários',
    basePrice: 3750.00,
    estimatedHours: 30.0
  },
  {
    name: 'Pacote Essencial NR-01',
    description: 'Pacote completo com avaliação inicial, análise e recomendações - 4-6 semanas',
    basePrice: 12800.00,
    estimatedHours: 80.0
  },
  {
    name: 'Pacote Avançado NR-01',
    description: 'Pacote com diagnóstico profundo, plano de ação e acompanhamento inicial - 6-8 semanas',
    basePrice: 22900.00,
    estimatedHours: 140.0
  },
  {
    name: 'Pacote Elite NR-01',
    description: 'Pacote premium com implementação completa, treinamento e gestão contínua - 8-12 semanas',
    basePrice: 34900.00,
    estimatedHours: 220.0
  },
  {
    name: 'Acompanhamento Mensal Basic',
    description: 'Acompanhamento mensal básico - suporte para implementação',
    basePrice: 1900.00,
    estimatedHours: 12.0
  },
  {
    name: 'Acompanhamento Mensal Standard',
    description: 'Acompanhamento mensal padrão - consultoria completa (10% desconto anual)',
    basePrice: 3400.00,
    estimatedHours: 24.0
  },
  {
    name: 'Acompanhamento Mensal Executive',
    description: 'Acompanhamento mensal executive - suporte premium (10% desconto anual)',
    basePrice: 5900.00,
    estimatedHours: 40.0
  },
  {
    name: 'Plano de Ação Customizado',
    description: 'Elaboração de plano de ação personalizado',
    basePrice: 1750.00,
    estimatedHours: 14.0
  },
  {
    name: 'Workshop NR-01 (4 horas)',
    description: 'Workshop de sensibilização e treinamento sobre NR-01',
    basePrice: 2000.00,
    estimatedHours: 4.0
  },
  {
    name: 'Consultoria Mensal Contínua',
    description: 'Consultoria contínua para implementação de ações',
    basePrice: 2750.00,
    estimatedHours: 20.0
  },
  {
    name: 'Palestra Presencial',
    description: 'Palestra presencial sobre riscos psicossociais',
    basePrice: 1150.00,
    estimatedHours: 2.0
  },
  {
    name: 'Palestra Online',
    description: 'Palestra online sobre riscos psicossociais',
    basePrice: 700.00,
    estimatedHours: 2.0
  },
  {
    name: 'Treinamento de Gestores',
    description: 'Treinamento especializado para gestores sobre NR-01',
    basePrice: 1900.00,
    estimatedHours: 8.0
  },
  {
    name: 'Simulado Incidente Crítico',
    description: 'Simulação de gerenciamento de incidente psicossocial crítico',
    basePrice: 3000.00,
    estimatedHours: 24.0
  }
];

export async function seedServices(tenantId: string) {
  console.log('🌱 Seeding services...');

  for (const service of servicesData) {
    await db.insert(services).values({
      id: uuidv4(),
      tenantId,
      ...service
    });
  }

  console.log(\✅ \ services inserted!\);
}
