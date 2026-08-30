import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
      <p className="text-sm text-gray-600 mb-4">Could not find the requested resource.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-[#D40511] text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
