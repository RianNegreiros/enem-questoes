import Script from 'next/script'

interface StructuredDataProps {
  data: Record<string, any>
  id?: string
}

export function StructuredData({ data, id = 'schema-org' }: StructuredDataProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Exporta os dados estruturados pré-configurados para facilitar o uso
export function getWebsiteStructuredData(
  url: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Questões ENEM - Banco de Questões Gratuito e Ilimitado',
    url: url,
    description:
      'Banco de questões do ENEM totalmente gratuito e sem limite de uso. Estude sem pagar nada, com acesso ilimitado a todas as questões de provas anteriores.',
    keywords:
      'ENEM gratuito, questões ENEM grátis, banco questões gratuito, vestibular sem pagar, ENEM sem limite',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function getEducationalAppStructuredData(
  url: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Questões do ENEM - 100% Gratuito e Ilimitado',
    description:
      'Plataforma de estudo com questões de provas anteriores do ENEM totalmente GRATUITA e sem limite de uso. Estude sem pagar nada e sem restrições.',
    url: url,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    inLanguage: 'pt-BR',
    audience: {
      '@type': 'Audience',
      audienceType: 'Estudantes do Ensino Médio e Vestibulandos',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
      availability: 'http://schema.org/InStock',
      priceValidUntil: '2099-12-31',
      description: 'Acesso 100% gratuito e ilimitado a todas as questões',
    },
    featureList: [
      'Acesso GRATUITO a todas as questões de provas anteriores do ENEM',
      'Uso ILIMITADO e sem restrições',
      'Filtragem por ano e matéria',
      'Modo de estudo com verificação de respostas',
      'Suporte a fórmulas matemáticas',
      'Sem necessidade de cadastro para usar',
    ],
    datePublished: '2024-01-01',
    provider: {
      '@type': 'Organization',
      name: 'Questões ENEM',
      url: url,
      slogan: 'Banco de questões 100% grátis e sem limites',
    },
  }
}

// Generate structured data for a specific ENEM question
export function getQuestionStructuredData(
  questionData: {
    id: string
    year: number
    index: number
    question: string
    subject?: string
    correctAnswer?: string
  },
  url: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
) {
  // Full URL for this specific question
  const questionUrl = `${url}/question/${questionData.id}`

  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    '@id': questionUrl,
    name: `Questão ${questionData.index} - ENEM ${questionData.year}`,
    description: `Pratique com a questão ${questionData.index} do ENEM ${questionData.year}${
      questionData.subject ? ` sobre ${questionData.subject}` : ''
    }.`,
    learningResourceType: 'Quiz',
    isPartOf: {
      '@type': 'Course',
      name: `Questões do ENEM ${questionData.year}`,
      description: `Banco de questões do ENEM ${questionData.year} para prática e preparação para o exame.`,
      provider: {
        '@type': 'Organization',
        name: 'Questões ENEM',
        url: url,
      },
    },
    educationalLevel: 'Ensino Médio',
    educationalUse: 'Preparação para Exame',
    inLanguage: 'pt-BR',
    datePublished: `${questionData.year}-11-01`,
    dateCreated: new Date().toISOString().split('T')[0],
    dateModified: new Date().toISOString().split('T')[0],
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
    },
    about: [
      questionData.subject || 'ENEM',
      'Vestibular',
      'Educação',
      'Questões de múltipla escolha',
    ],
    accessMode: 'textual',
    accessModeSufficient: 'textual',
    accessibilityFeature: ['alternativeText', 'latex', 'highContrastDisplay', 'readingOrder'],
    accessibilityHazard: 'noFlashingHazard',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
      availability: 'http://schema.org/InStock',
      priceValidUntil: '2099-12-31',
    },
    url: questionUrl,
    mainEntityOfPage: url,
  }
}
