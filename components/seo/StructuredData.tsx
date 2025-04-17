import Script from 'next/script'

interface StructuredDataProps {
  data: Record<string, any>;
  id?: string;
}

export function StructuredData({ data, id = "schema-org" }: StructuredDataProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Exporta os dados estruturados pré-configurados para facilitar o uso
export function getWebsiteStructuredData(url: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Questões ENEM",
    "url": url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${url}?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }
}

export function getEducationalAppStructuredData(url: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Questões do ENEM",
    "description": "Plataforma de estudo com questões de provas anteriores do ENEM (Exame Nacional do Ensino Médio).",
    "url": url,
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "inLanguage": "pt-BR",
    "audience": {
      "@type": "Audience",
      "audienceType": "Estudantes do Ensino Médio"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL"
    },
    "featureList": [
      "Acesso a questões de provas anteriores do ENEM",
      "Filtragem por ano",
      "Modo de estudo com verificação de respostas",
      "Suporte a fórmulas matemáticas"
    ],
    "datePublished": "2024-01-01",
    "provider": {
      "@type": "Organization",
      "name": "Questões ENEM",
      "url": url
    }
  }
} 