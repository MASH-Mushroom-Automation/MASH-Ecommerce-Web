import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-8xl font-bold text-[#6A994E] mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-xl text-gray-600 mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/" 
            className="px-6 py-3 bg-[#6A994E] text-white rounded-lg hover:bg-[#5a8342] transition-colors font-medium"
          >
            Go Home
          </Link>
          <Link 
            href="/catalog" 
            className="px-6 py-3 bg-white text-[#6A994E] border-2 border-[#6A994E] rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
