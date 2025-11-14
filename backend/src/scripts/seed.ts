// backend/src/scripts/seed.ts
/**
 * Script de seed para popular banco de dados com dados de exemplo
 */
import { db } from '../database/connection';
import { 
  users, 
  clients, 
  services, 
  pricingParameters 
} from '../database/schema';
import { v4 as uuidv4 } from 'uuid';

const TENANT_ID = 'default-tenant';

async function seedDatabase() {
  console.log('🌱 Iniciando seed do banco de dados...');
  
  try {
    // Seed Users
    console.log('📝 Criando usuários...');
    const userId1 = uuidv4();
    const userId2 = uuidv4();
    
    await db.insert(users).values([
      {
        id: userId1,
        email: 'admin@blackbelt.com',
        name: 'Administrador',
        role: 'admin',
        tenantId: TENANT_ID,
        isActive: true
      },
      {
        id: userId2,
        email: 'consultant@blackbelt.com',
        name: 'Consultor',
        role: 'consultant',
        tenantId: TENANT_ID,
        isActive: true
      }
    ]);
    console.log('✅ Usuários criados');
    
    // Seed Clients
    console.log('📝 Criando clientes...');
    const clientId1 = uuidv4();
    const clientId2 = uuidv4();
    const clientId3 = uuidv4();
    
    await db.insert(clients).values([
      {
        id: clientId1,
        name: 'Empresa A Ltda',
        email: 'contato@empresaa.com',
        phone: '(11) 98765-4321',
        cnpj: '12.345.678/0001-90',
        taxRegime: 'Simples Nacional',
        tenantId: TENANT_ID
      },
      {
        id: clientId2,
        name: 'Empresa B S.A.',
        email: 'contato@empresab.com',
        phone: '(11) 91234-5678',
        cnpj: '98.765.432/0001-10',
        taxRegime: 'Lucro Presumido',
        tenantId: TENANT_ID
      },
      {
        id: clientId3,
        name: 'Consultoria C',
        email: 'contato@consultoriac.com',
        phone: '(11) 99999-8888',
        cnpj: '11.222.333/0001-44',
        taxRegime: 'MEI',
        tenantId: TENANT_ID
      }
    ]);
    console.log('✅ Clientes criados');
    
    // Seed Services
    console.log('📝 Criando serviços...');
    await db.insert(services).values([
      {
        id: uuidv4(),
        name: 'Consultoria em SST',
        description: 'Consultoria completa em Segurança e Saúde no Trabalho',
        basePrice: '5000.00',
        estimatedHours: '40.00',
        tenantId: TENANT_ID
      },
      {
        id: uuidv4(),
        name: 'Elaboração de PGR',
        description: 'Programa de Gerenciamento de Riscos conforme NR-01',
        basePrice: '8000.00',
        estimatedHours: '60.00',
        tenantId: TENANT_ID
      },
      {
        id: uuidv4(),
        name: 'Treinamento NR-35',
        description: 'Treinamento para trabalho em altura',
        basePrice: '2000.00',
        estimatedHours: '16.00',
        tenantId: TENANT_ID
      },
      {
        id: uuidv4(),
        name: 'Auditoria de Conformidade',
        description: 'Auditoria de conformidade com normas regulamentadoras',
        basePrice: '6000.00',
        estimatedHours: '48.00',
        tenantId: TENANT_ID
      },
      {
        id: uuidv4(),
        name: 'LTCAT',
        description: 'Laudo Técnico das Condições Ambientais de Trabalho',
        basePrice: '4500.00',
        estimatedHours: '32.00',
        tenantId: TENANT_ID
      }
    ]);
    console.log('✅ Serviços criados');
    
    // Seed Pricing Parameters
    console.log('📝 Criando parâmetros de precificação...');
    await db.insert(pricingParameters).values({
      id: uuidv4(),
      tenantId: TENANT_ID,
      taxRateMEI: '3.50',
      taxRateSimples: '6.00',
      taxRateLucroPresumido: '8.00',
      taxRateAutonomo: '11.00',
      fixedCosts: '5000.00',
      proLabor: '2000.00',
      productiveHours: '160.00'
    });
    console.log('✅ Parâmetros de precificação criados');
    
    console.log('🎉 Seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante seed:', error);
    throw error;
  }
}

// Executar seed se chamado diretamente
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedDatabase };
