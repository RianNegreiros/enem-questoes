import { MetadataRoute } from 'next'

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

  // Base sitemap entries
  const routes: Array<{
    url: string
    lastModified: Date
    changeFrequency: ChangeFrequency
    priority: number
  }> = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  try {
    // Add years/exams as important pages
    const examsResponse = await fetch(`${apiBaseUrl}/exams`)
    if (examsResponse.ok) {
      const examsData = await examsResponse.json()
      const years = Array.isArray(examsData)
        ? examsData.map((exam: { year: number }) => exam.year)
        : examsData.exams?.map((exam: { year: number }) => exam.year) || []

      // Add year-specific pages
      for (const year of years) {
        routes.push({
          url: `${baseUrl}/?year=${year}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }

      // Get a sample of questions to add to the sitemap
      // Adding all questions could make the sitemap too large
      for (const year of years.slice(0, 3)) {
        // Only latest 3 years for popular content
        try {
          const questionsResponse = await fetch(
            `${apiBaseUrl}/questions?year=${year}&limit=30&offset=0`
          )
          if (questionsResponse.ok) {
            const questionsData = await questionsResponse.json()
            const questions = questionsData.questions || []

            for (const question of questions) {
              routes.push({
                url: `${baseUrl}/question/${question.id}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.7,
              })
            }
          }
        } catch (error) {
          console.error(`Error fetching questions for year ${year}:`, error)
        }
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return routes
}
