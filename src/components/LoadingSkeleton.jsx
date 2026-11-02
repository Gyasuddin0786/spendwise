export function SkeletonBlock({ className = "", variant = "default" }) {
  const variantClasses = {
    default: "bg-slate-200/80 dark:bg-slate-700/80",
    soft: "bg-slate-200/60 dark:bg-slate-700/60",
    accent: "bg-indigo-200/80 dark:bg-indigo-500/30",
  };

  return (
    <div
      className={[
        "animate-pulse rounded-xl",
        variantClasses[variant] || variantClasses.default,
        className,
      ].join(" ")}
    />
  );
}

export function SidebarSkeleton({ isDark = false }) {
  return (
    <aside
      className={[
        "fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r",
        isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <div className={[
        "flex h-[82px] items-center justify-between border-b px-6",
        isDark ? "border-slate-800" : "border-slate-200",
      ].join(" ")}>
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-10 w-10 rounded-xl" variant="accent" />
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-2.5 w-16" variant="soft" />
          </div>
        </div>
      </div>

      <div className="px-4 pt-8">
        <SkeletonBlock className="mb-4 h-3 w-16 rounded-full" variant="soft" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 rounded-xl px-4 py-3">
              <SkeletonBlock className="h-5 w-5 rounded-md" variant="soft" />
              <SkeletonBlock className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto space-y-5 p-4">
        <SkeletonBlock className="h-28 w-full rounded-2xl" variant="soft" />
      </div>
    </aside>
  );
}

export function PageSkeleton({ isDark = false }) {
  return (
    <div className={[
      "min-h-screen p-4 sm:p-6 lg:p-8",
      isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900",
    ].join(" ")}>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-32 rounded-full" variant="soft" />
          <SkeletonBlock className="h-9 w-60 rounded-xl" />
          <SkeletonBlock className="h-4 w-72 rounded-full" variant="soft" />
        </div>
        <SkeletonBlock className="h-12 w-32 rounded-xl" variant="accent" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={[
              "rounded-2xl border p-5",
              isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white",
            ].join(" ")}
          >
            <div className="mb-4 flex items-center justify-between">
              <SkeletonBlock className="h-4 w-20 rounded-full" variant="soft" />
              <SkeletonBlock className="h-10 w-10 rounded-xl" variant="accent" />
            </div>
            <SkeletonBlock className="mb-3 h-8 w-28 rounded-lg" />
            <SkeletonBlock className="h-3 w-20 rounded-full" variant="soft" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className={[
          "rounded-2xl border p-5 sm:p-6",
          isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white",
        ].join(" ")}>
          <SkeletonBlock className="mb-4 h-5 w-32 rounded-lg" />
          <SkeletonBlock className="h-56 w-full rounded-2xl" variant="soft" />
        </div>

        <div className={[
          "rounded-2xl border p-5 sm:p-6",
          isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white",
        ].join(" ")}>
          <SkeletonBlock className="mb-4 h-5 w-28 rounded-lg" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <SkeletonBlock className="h-8 w-8 rounded-md" variant="soft" />
                  <SkeletonBlock className="h-4 w-20 rounded-full" />
                </div>
                <SkeletonBlock className="h-4 w-16 rounded-full" variant="soft" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
