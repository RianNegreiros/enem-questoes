import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <Skeleton className="h-10 w-32" />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-6 w-48 mt-2" />
        </CardHeader>

        <CardContent className="space-y-4">
          <Skeleton className="h-28 w-full rounded-lg" />

          <div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mt-2" />
            <Skeleton className="h-4 w-4/6 mt-2" />
          </div>

          <div className="space-y-4 mt-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="p-4 rounded-lg border-2">
                <div className="flex items-start">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="ml-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6 mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
