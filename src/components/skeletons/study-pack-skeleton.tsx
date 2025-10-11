import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PDFViewerSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
          <Skeleton className="h-[600px] w-full" />
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((col) => (
        <Card key={col}>
          <CardContent className="p-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2].map((item) => (
                <div key={item} className="p-3 border rounded-lg">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function FlashcardsSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="border-2 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
            <div className="text-center w-full space-y-4">
              <Skeleton className="h-6 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function NotesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-28" />
      </div>
      {[1, 2, 3].map((note) => (
        <Card key={note}>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SummarySkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-48 mb-4" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((topic) => (
            <Skeleton key={topic} className="h-6 w-20" />
          ))}
        </div>
      </div>
    </div>
  )
}
