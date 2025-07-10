import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8 pb-20 md:pb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Welcome to Your Dashboard
          </h1>
          <p className="text-muted-foreground">
            Navigate between different sections using the tabs above and toggle
            between light and dark themes.
          </p>
        </div>
      </main>
    </div>
  );
}
