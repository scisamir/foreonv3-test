export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground">
      <div className="w-12 h-12 border-4 border-t-transparent border-primary rounded-full animate-spin mb-3"></div>
      <p className="text-sm font-medium">Please wait...</p>
    </div>
  )
}
