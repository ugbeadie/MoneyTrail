import { Card, CardContent } from "@/components/ui/card";

export function LoadingCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-8 bg-muted rounded w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

export function LoadingCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}
