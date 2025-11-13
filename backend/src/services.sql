-- Inserir serviços da Black Belt no banco de dados

INSERT INTO services (id, name, description, basePrice, estimatedHours, tenantId, createdAt, updatedAt) VALUES
('srv-001', 'Questionário Individual', 'Questionário de avaliação de riscos psicossociais por pessoa', 125.00, 0.5, 'default-tenant', NOW(), NOW()),
('srv-002', 'Entrevista Individual', 'Entrevista aprofundada de avaliação de riscos', 337.50, 1.0, 'default-tenant', NOW(), NOW()),
('srv-003', 'Avaliação Completa Individual', 'Avaliação completa incluindo questionário + entrevista', 510.00, 1.5, 'default-tenant', NOW(), NOW()),
('srv-004', 'Avaliação 10 Pessoas + Relatório', 'Avaliação organizacional para 10 pessoas com relatório executivo', 2500.00, 20.0, 'default-tenant', NOW(), NOW()),
('srv-005', 'Avaliação Micro/Pequena Empresa', 'Avaliação completa para empresa com até 50 funcionários', 3750.00, 30.0, 'default-tenant', NOW(), NOW()),
('srv-006', 'Pacote Essencial NR-01', 'Pacote completo com avaliação inicial, análise e recomendações - 4-6 semanas', 12800.00, 80.0, 'default-tenant', NOW(), NOW()),
('srv-007', 'Pacote Avançado NR-01', 'Pacote com diagnóstico profundo, plano de ação e acompanhamento inicial - 6-8 semanas', 22900.00, 140.0, 'default-tenant', NOW(), NOW()),
('srv-008', 'Pacote Elite NR-01', 'Pacote premium com implementação completa, treinamento e gestão contínua - 8-12 semanas', 34900.00, 220.0, 'default-tenant', NOW(), NOW()),
('srv-009', 'Acompanhamento Mensal Basic', 'Acompanhamento mensal básico - suporte para implementação', 1900.00, 12.0, 'default-tenant', NOW(), NOW()),
('srv-010', 'Acompanhamento Mensal Standard', 'Acompanhamento mensal padrão - consultoria completa (10% desconto anual: R$ 3.060)', 3400.00, 24.0, 'default-tenant', NOW(), NOW()),
('srv-011', 'Acompanhamento Mensal Executive', 'Acompanhamento mensal executive - suporte premium (10% desconto anual: R$ 5.310)', 5900.00, 40.0, 'default-tenant', NOW(), NOW()),
('srv-012', 'Plano de Ação Customizado', 'Elaboração de plano de ação personalizado', 1750.00, 14.0, 'default-tenant', NOW(), NOW()),
('srv-013', 'Workshop NR-01 (4 horas)', 'Workshop de sensibilização e treinamento sobre NR-01', 2000.00, 4.0, 'default-tenant', NOW(), NOW()),
('srv-014', 'Consultoria Mensal Contínua', 'Consultoria contínua para implementação de ações', 2750.00, 20.0, 'default-tenant', NOW(), NOW()),
('srv-015', 'Palestra Presencial', 'Palestra presencial sobre riscos psicossociais', 1150.00, 2.0, 'default-tenant', NOW(), NOW()),
('srv-016', 'Palestra Online', 'Palestra online sobre riscos psicossociais', 700.00, 2.0, 'default-tenant', NOW(), NOW()),
('srv-017', 'Treinamento de Gestores', 'Treinamento especializado para gestores sobre NR-01', 1900.00, 8.0, 'default-tenant', NOW(), NOW()),
('srv-018', 'Simulado Incidente Crítico', 'Simulação de gerenciamento de incidente psicossocial crítico', 3000.00, 24.0, 'default-tenant', NOW(), NOW());
