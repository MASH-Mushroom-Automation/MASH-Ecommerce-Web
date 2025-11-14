export default function AuthLoading() {
  return (
    <div className="max-w-md w-full">
      <div className="bg-card rounded-lg shadow-md p-8">
        <div className="flex justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  );
}
