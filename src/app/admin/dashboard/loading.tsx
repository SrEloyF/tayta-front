export default function Loading() {
  return (
    <div className="p-8 space-y-8 bg-gray-950 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900/50 rounded-2xl p-6 h-36 animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-800 rounded w-1/2 mt-2"></div>
        </div>
        <div className="bg-gray-900/50 rounded-2xl p-6 h-36 animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-800 rounded w-1/2 mt-2"></div>
        </div>
        <div className="bg-gray-900/50 rounded-2xl p-6 h-36 animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-800 rounded w-1/2 mt-2"></div>
        </div>
        <div className="bg-gray-900/50 rounded-2xl p-6 h-36 animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-800 rounded w-1/2 mt-2"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-900/50 rounded-2xl p-6 h-80 animate-pulse">
          <div className="h-6 bg-gray-800 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-800 rounded w-full"></div>
            ))}
          </div>
        </div>
        <div className="bg-gray-900/50 rounded-2xl p-6 h-80 animate-pulse">
          <div className="h-6 bg-gray-800 rounded w-1/2 mb-4"></div>
          <div className="h-48 bg-gray-800 rounded w-full mt-4"></div>
        </div>
      </div>
    </div>
  );
}
