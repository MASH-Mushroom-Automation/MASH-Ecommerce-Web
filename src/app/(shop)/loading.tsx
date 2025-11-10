export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading products...</p>
      </div>
    </div>
  );
}
