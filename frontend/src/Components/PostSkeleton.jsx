export default function PostSkeleton() {
  return (
    <div className="border-b border-gray-100 px-4 py-4" aria-hidden="true">
      <div className="flex animate-pulse gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="h-3 w-32 rounded-full bg-gray-200" />
          <div className="h-3 w-full rounded-full bg-gray-100" />
          <div className="h-3 w-2/3 rounded-full bg-gray-100" />
          <div className="flex gap-6 pt-2">
            <div className="h-3 w-8 rounded-full bg-gray-100" />
            <div className="h-3 w-8 rounded-full bg-gray-100" />
            <div className="h-3 w-8 rounded-full bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
