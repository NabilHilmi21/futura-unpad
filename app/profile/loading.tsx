export default function ProfileLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Skeleton Card 1 */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-muted rounded-lg"></div>
                            <div className="h-5 w-32 bg-muted rounded"></div>
                        </div>
                    </div>
                    <div className="px-6 py-6 space-y-6">
                        <div className="space-y-3">
                            <div className="h-4 w-24 bg-muted rounded"></div>
                            <div className="h-6 w-48 bg-muted rounded"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-muted rounded"></div>
                                <div className="h-4 w-32 bg-muted rounded"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-muted rounded"></div>
                                <div className="h-4 w-32 bg-muted rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skeleton Card 2 */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-muted rounded-lg"></div>
                            <div className="h-5 w-32 bg-muted rounded"></div>
                        </div>
                    </div>
                    <div className="px-6 py-6 space-y-6">
                        <div className="space-y-3">
                            <div className="h-4 w-24 bg-muted rounded"></div>
                            <div className="h-6 w-48 bg-muted rounded"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-muted rounded"></div>
                                <div className="h-4 w-32 bg-muted rounded"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-muted rounded"></div>
                                <div className="h-4 w-32 bg-muted rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
}
