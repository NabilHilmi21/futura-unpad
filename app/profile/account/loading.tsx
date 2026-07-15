export default function AccountLoading() {
    return (
        <div className="mx-auto w-full max-w-4xl animate-pulse">
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                {/* Banner Skeleton */}
                <div className="h-32 w-full bg-muted/40 relative">
                    <div className="absolute right-4 top-4 h-9 w-24 bg-muted rounded-md"></div>
                </div>

                {/* Profile Info Skeleton */}
                <div className="px-6 sm:px-10 pb-10">
                    {/* Avatar Skeleton */}
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="h-24 w-24 rounded-full bg-muted border-4 border-card"></div>
                    </div>

                    {/* Name/Email Skeleton */}
                    <div className="mb-8 space-y-3">
                        <div className="h-7 w-48 bg-muted rounded"></div>
                        <div className="h-4 w-32 bg-muted rounded"></div>
                    </div>

                    {/* 2x2 Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 bg-muted rounded"></div>
                                    <div className="h-3 w-24 bg-muted rounded"></div>
                                </div>
                                <div className="h-5 w-32 bg-muted rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
