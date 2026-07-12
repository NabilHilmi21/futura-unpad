interface LocationProps {
    id?: string;
    title: string;
    location: string;
    mapSrc: string;
}

export default function Location({ id, title, location, mapSrc }: LocationProps) {
    return (
        <section id={id} className="relative mx-auto flex max-w-7xl flex-col items-center justify-center gap-8 px-6 py-20 text-center sm:px-8 lg:py-28">
            <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    {title}
                </h2>
                <p className="mx-auto max-w-2xl text-balance text-lg text-neutral-400 sm:text-xl">
                    {location}
                </p>
            </div>

            <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-md">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl sm:aspect-video lg:aspect-[21/9]">
                    <iframe
                        className="absolute inset-0 h-full w-full border-0"
                        src={mapSrc}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </div>
        </section>
    );
}