export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="h-10 w-60 animate-pulse rounded-xl bg-zinc-200" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-2xl bg-zinc-200" />
        ))}
      </div>
    </div>
  );
}
