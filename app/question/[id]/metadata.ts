import { Metadata, ResolvingMetadata } from 'next'

// Define the type for the params object
type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

// Revalidate this metadata every 24 hours
export const revalidate = 86400

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id
  const [year, index] = id.split('-')

  // Default metadata
  const defaultMetadata: Metadata = {
    title: 'Questão ENEM',
    description: 'Pratique questões do ENEM para se preparar para o exame.',
  }

  if (!year || !index) {
    return {
      title: 'Questão não encontrada',
      description: 'A questão solicitada não foi encontrada.',
    }
  }

  try {
    // In Next.js 15, we could optionally fetch the question data here
    // and use its content to generate richer metadata
    const questionMetadata: Metadata = {
      title: `Questão ${index} - ENEM ${year}`,
      description: `Pratique com a questão ${index} do ENEM ${year}.`,
      openGraph: {
        title: `Questão ${index} - ENEM ${year}`,
        description: `Pratique com a questão ${index} do ENEM ${year}.`,
        type: 'article',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/question/${id}`,
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_APP_URL}/question/${id}`,
      },
    }

    // Get the parent metadata and combine with our metadata
    const previousImages = (await parent).openGraph?.images || []

    return {
      ...questionMetadata,
      openGraph: {
        ...questionMetadata.openGraph,
        images: previousImages,
      },
    }
  } catch (error) {
    return defaultMetadata
  }
}
