// COPSOQ II - Copenhagen Psychosocial Questionnaire II
// 7 dimensões psicossociais com 50 perguntas

export enum COPSOQDimension {
  EXIGENCIAS = 'exigencias',
  ORGANIZACAO = 'organizacao',
  RELACOES = 'relacoes',
  INTERFACE = 'interface',
  VALORES = 'valores',
  SAUDE = 'saude',
  COMPORTAMENTOS = 'comportamentos'
}

export enum COPSOQScale {
  ALWAYS = 5,
  OFTEN = 4,
  SOMETIMES = 3,
  RARELY = 2,
  NEVER = 1
}

export interface COPSOQQuestion {
  id: string;
  dimension: COPSOQDimension;
  subdimension: string;
  text: string;
  scaleLabels: string[];
  weight: number;
  reverse?: boolean; // Indica se a pontuação é reversa
}

export const copsoqQuestions: COPSOQQuestion[] = [
  // 1. EXIGÊNCIAS NO TRABALHO (9 perguntas)
  {
    id: 'q1',
    dimension: COPSOQDimension.EXIGENCIAS,
    subdimension: 'Exigências Quantitativas',
    text: 'Com que frequência você precisa trabalhar muito rápido?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q2',
    dimension: COPSOQDimension.EXIGENCIAS,
    subdimension: 'Exigências Quantitativas',
    text: 'Com que frequência a quantidade de trabalho é desigualmente distribuída causando acúmulo?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q3',
    dimension: COPSOQDimension.EXIGENCIAS,
    subdimension: 'Ritmo de Trabalho',
    text: 'Você precisa manter-se em um ritmo de trabalho elevado durante toda a jornada?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q4',
    dimension: COPSOQDimension.EXIGENCIAS,
    subdimension: 'Exigências Emocionais',
    text: 'Seu trabalho exige que você lide com situações emocionalmente difíceis?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q5',
    dimension: COPSOQDimension.EXIGENCIAS,
    subdimension: 'Exigências Emocionais',
    text: 'Você se envolve emocionalmente com seu trabalho?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q6',
    dimension: COPSOQDimension.EXIGENCIAS,
    subdimension: 'Exigências Cognitivas',
    text: 'Seu trabalho exige que você tome decisões difíceis?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q7',
    dimension: COPSOQDimension.EXIGENCIAS,
    subdimension: 'Exigências Cognitivas',
    text: 'Seu trabalho requer um alto nível de concentração?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q8',
    dimension: COPSOQDimension.EXIGENCIAS,
    subdimension: 'Exigências de Esconder Emoções',
    text: 'Você precisa esconder seus sentimentos no trabalho?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q9',
    dimension: COPSOQDimension.EXIGENCIAS,
    subdimension: 'Conflitos de Trabalho-Família',
    text: 'Seu trabalho interfere em suas responsabilidades familiares?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },

  // 2. ORGANIZAÇÃO DO TRABALHO (8 perguntas)
  {
    id: 'q10',
    dimension: COPSOQDimension.ORGANIZACAO,
    subdimension: 'Influência no Trabalho',
    text: 'Você pode influenciar as decisões importantes para o seu trabalho?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q11',
    dimension: COPSOQDimension.ORGANIZACAO,
    subdimension: 'Influência no Trabalho',
    text: 'Você tem influência sobre a quantidade de trabalho que lhe é atribuída?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q12',
    dimension: COPSOQDimension.ORGANIZACAO,
    subdimension: 'Possibilidades de Desenvolvimento',
    text: 'Você tem a possibilidade de aprender coisas novas através do seu trabalho?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q13',
    dimension: COPSOQDimension.ORGANIZACAO,
    subdimension: 'Possibilidades de Desenvolvimento',
    text: 'Seu trabalho permite que você use suas habilidades?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q14',
    dimension: COPSOQDimension.ORGANIZACAO,
    subdimension: 'Significado do Trabalho',
    text: 'Seu trabalho tem significado para você?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q15',
    dimension: COPSOQDimension.ORGANIZACAO,
    subdimension: 'Significado do Trabalho',
    text: 'Você sente que o trabalho que realiza é importante?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q16',
    dimension: COPSOQDimension.ORGANIZACAO,
    subdimension: 'Compromisso com o Local de Trabalho',
    text: 'Você gosta de falar com outros sobre o seu local de trabalho?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q17',
    dimension: COPSOQDimension.ORGANIZACAO,
    subdimension: 'Clareza do Papel',
    text: 'Você sabe exatamente quais são suas responsabilidades?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },

  // 3. RELAÇÕES SOCIAIS E LIDERANÇA (12 perguntas)
  {
    id: 'q18',
    dimension: COPSOQDimension.RELACOES,
    subdimension: 'Previsibilidade',
    text: 'No seu trabalho, você é informado com antecedência sobre mudanças importantes?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q19',
    dimension: COPSOQDimension.RELACOES,
    subdimension: 'Apoio Social de Colegas',
    text: 'Com que frequência você recebe ajuda e apoio dos seus colegas?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q20',
    dimension: COPSOQDimension.RELACOES,
    subdimension: 'Apoio Social de Colegas',
    text: 'Seus colegas estão dispostos a ouvir seus problemas de trabalho?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q21',
    dimension: COPSOQDimension.RELACOES,
    subdimension: 'Apoio Social de Superiores',
    text: 'Com que frequência seu superior imediato fala com você sobre como você realiza seu trabalho?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q22',
    dimension: COPSOQDimension.RELACOES,
    subdimension: 'Apoio Social de Superiores',
    text: 'Seu superior imediato está disposto a ouvir seus problemas de trabalho?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q23',
    dimension: COPSOQDimension.RELACOES,
    subdimension: 'Qualidade da Liderança',
    text: 'Seu superior imediato planeja bem o trabalho?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q24',
    dimension: COPSOQDimension.RELACOES,
    subdimension: 'Qualidade da Liderança',
    text: 'Seu superior imediato resolve bem os conflitos?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q25',
    dimension: COPSOQDimension.RELACOES,
    subdimension: 'Senso de Comunidade',
    text: 'Existe um bom ambiente de trabalho entre você e seus colegas?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q26',
    dimension: COPSOQDimension.RELACOES,
    subdimension: 'Senso de Comunidade',
    text: 'Há uma boa cooperação entre os colegas de trabalho?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q27',
    dimension: COPSOQDimension.RELACOES,
    subdimension: 'Feedback',
    text: 'Você recebe feedback adequado sobre seu trabalho?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q28',
    dimension: COPSOQDimension.RELACOES,
    subdimension: 'Reconhecimento',
    text: 'Você recebe o reconhecimento que merece do seu superior?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q29',
    dimension: COPSOQDimension.RELACOES,
    subdimension: 'Reconhecimento',
    text: 'O seu trabalho é respeitado pelos seus colegas?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0,
    reverse: true
  },

  // 4. INTERFACE TRABALHO-INDIVÍDUO (6 perguntas)
  {
    id: 'q30',
    dimension: COPSOQDimension.INTERFACE,
    subdimension: 'Insegurança no Trabalho',
    text: 'Você está preocupado em perder seu emprego?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q31',
    dimension: COPSOQDimension.INTERFACE,
    subdimension: 'Insegurança no Trabalho',
    text: 'Você está preocupado com mudanças indesejadas em suas condições de trabalho?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q32',
    dimension: COPSOQDimension.INTERFACE,
    subdimension: 'Satisfação no Trabalho',
    text: 'Considerando tudo, você está satisfeito com seu trabalho?',
    scaleLabels: ['Muito insatisfeito', 'Insatisfeito', 'Neutro', 'Satisfeito', 'Muito satisfeito'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q33',
    dimension: COPSOQDimension.INTERFACE,
    subdimension: 'Satisfação no Trabalho',
    text: 'Você recomendaria um bom amigo a trabalhar no seu local de trabalho?',
    scaleLabels: ['Nunca', 'Raramente', 'Talvez', 'Provavelmente', 'Certamente'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q34',
    dimension: COPSOQDimension.INTERFACE,
    subdimension: 'Conflito Trabalho-Vida',
    text: 'Você sente que seu trabalho tira energia que você gostaria de dar à sua família?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q35',
    dimension: COPSOQDimension.INTERFACE,
    subdimension: 'Conflito Trabalho-Vida',
    text: 'Você sente que seu trabalho interfere com sua vida pessoal?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },

  // 5. VALORES NO LOCAL DE TRABALHO (5 perguntas)
  {
    id: 'q36',
    dimension: COPSOQDimension.VALORES,
    subdimension: 'Confiança Horizontal',
    text: 'Os funcionários confiam uns nos outros de uma forma geral?',
    scaleLabels: ['Em pequena extensão', 'Em alguma extensão', 'Moderadamente', 'Em grande extensão', 'Em muito grande extensão'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q37',
    dimension: COPSOQDimension.VALORES,
    subdimension: 'Confiança Vertical',
    text: 'Os funcionários confiam nas informações que vêm da administração?',
    scaleLabels: ['Em pequena extensão', 'Em alguma extensão', 'Moderadamente', 'Em grande extensão', 'Em muito grande extensão'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q38',
    dimension: COPSOQDimension.VALORES,
    subdimension: 'Justiça e Respeito',
    text: 'Os conflitos são resolvidos de uma maneira justa?',
    scaleLabels: ['Em pequena extensão', 'Em alguma extensão', 'Moderadamente', 'Em grande extensão', 'Em muito grande extensão'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q39',
    dimension: COPSOQDimension.VALORES,
    subdimension: 'Justiça e Respeito',
    text: 'O trabalho é distribuído de forma justa?',
    scaleLabels: ['Em pequena extensão', 'Em alguma extensão', 'Moderadamente', 'Em grande extensão', 'Em muito grande extensão'],
    weight: 1.0,
    reverse: true
  },
  {
    id: 'q40',
    dimension: COPSOQDimension.VALORES,
    subdimension: 'Transparência',
    text: 'A administração é aberta e transparente?',
    scaleLabels: ['Em pequena extensão', 'Em alguma extensão', 'Moderadamente', 'Em grande extensão', 'Em muito grande extensão'],
    weight: 1.0,
    reverse: true
  },

  // 6. SAÚDE E BEM-ESTAR (6 perguntas)
  {
    id: 'q41',
    dimension: COPSOQDimension.SAUDE,
    subdimension: 'Problemas em Dormir',
    text: 'Nas últimas 4 semanas, você teve problemas para dormir?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q42',
    dimension: COPSOQDimension.SAUDE,
    subdimension: 'Burnout',
    text: 'Nas últimas 4 semanas, você se sentiu fisicamente exausto?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q43',
    dimension: COPSOQDimension.SAUDE,
    subdimension: 'Burnout',
    text: 'Nas últimas 4 semanas, você se sentiu emocionalmente exausto?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q44',
    dimension: COPSOQDimension.SAUDE,
    subdimension: 'Estresse',
    text: 'Nas últimas 4 semanas, você se sentiu estressado?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q45',
    dimension: COPSOQDimension.SAUDE,
    subdimension: 'Sintomas Somáticos',
    text: 'Nas últimas 4 semanas, você teve dores de cabeça?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q46',
    dimension: COPSOQDimension.SAUDE,
    subdimension: 'Sintomas Somáticos',
    text: 'Nas últimas 4 semanas, você teve tensão muscular ou dores?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },

  // 7. COMPORTAMENTOS OFENSIVOS (4 perguntas)
  {
    id: 'q47',
    dimension: COPSOQDimension.COMPORTAMENTOS,
    subdimension: 'Assédio Moral',
    text: 'Nas últimas 12 meses, você foi exposto a comentários ofensivos ou humilhantes no trabalho?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q48',
    dimension: COPSOQDimension.COMPORTAMENTOS,
    subdimension: 'Assédio Sexual',
    text: 'Nas últimas 12 meses, você foi exposto a atenção sexual indesejada no trabalho?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q49',
    dimension: COPSOQDimension.COMPORTAMENTOS,
    subdimension: 'Ameaças de Violência',
    text: 'Nas últimas 12 meses, você foi ameaçado com violência física no trabalho?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  },
  {
    id: 'q50',
    dimension: COPSOQDimension.COMPORTAMENTOS,
    subdimension: 'Violência Física',
    text: 'Nas últimas 12 meses, você foi exposto a violência física no trabalho?',
    scaleLabels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
    weight: 1.0
  }
];

// Metadados das dimensões
export interface DimensionMetadata {
  name: string;
  description: string;
  questionCount: number;
  subdimensions: string[];
}

export const dimensionMetadata: Record<COPSOQDimension, DimensionMetadata> = {
  [COPSOQDimension.EXIGENCIAS]: {
    name: 'Exigências no Trabalho',
    description: 'Avalia demandas quantitativas, ritmo, exigências emocionais e cognitivas',
    questionCount: 9,
    subdimensions: ['Exigências Quantitativas', 'Ritmo de Trabalho', 'Exigências Emocionais', 'Exigências Cognitivas']
  },
  [COPSOQDimension.ORGANIZACAO]: {
    name: 'Organização do Trabalho',
    description: 'Avalia influência, possibilidades de desenvolvimento e significado do trabalho',
    questionCount: 8,
    subdimensions: ['Influência no Trabalho', 'Possibilidades de Desenvolvimento', 'Significado do Trabalho']
  },
  [COPSOQDimension.RELACOES]: {
    name: 'Relações Sociais e Liderança',
    description: 'Avalia apoio social, qualidade da liderança e senso de comunidade',
    questionCount: 12,
    subdimensions: ['Apoio Social', 'Qualidade da Liderança', 'Senso de Comunidade', 'Reconhecimento']
  },
  [COPSOQDimension.INTERFACE]: {
    name: 'Interface Trabalho-Indivíduo',
    description: 'Avalia insegurança no trabalho, satisfação e conflito trabalho-vida',
    questionCount: 6,
    subdimensions: ['Insegurança no Trabalho', 'Satisfação no Trabalho', 'Conflito Trabalho-Vida']
  },
  [COPSOQDimension.VALORES]: {
    name: 'Valores no Local de Trabalho',
    description: 'Avalia confiança, justiça e transparência organizacional',
    questionCount: 5,
    subdimensions: ['Confiança Horizontal', 'Confiança Vertical', 'Justiça e Respeito']
  },
  [COPSOQDimension.SAUDE]: {
    name: 'Saúde e Bem-estar',
    description: 'Avalia problemas de sono, burnout, estresse e sintomas somáticos',
    questionCount: 6,
    subdimensions: ['Problemas em Dormir', 'Burnout', 'Estresse', 'Sintomas Somáticos']
  },
  [COPSOQDimension.COMPORTAMENTOS]: {
    name: 'Comportamentos Ofensivos',
    description: 'Avalia exposição a assédio, violência e discriminação',
    questionCount: 4,
    subdimensions: ['Assédio Moral', 'Assédio Sexual', 'Violência']
  }
};
