export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">
          BTRMe - AI-Powered NoCode Builder
        </h1>
        <p className="text-center text-lg text-muted-foreground">
          Transform prompts into deployed apps instantly
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/auth/signin"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Get Started
          </a>
          <a
            href="#features"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Learn More
          </a>
        </div>
      </div>
    </main>
  )
}
