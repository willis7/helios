import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center">
      <h1 className="text-6xl font-semibold tracking-tight">404</h1>
      <p className="mt-4 text-xl">Page not found</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-primary-700"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
