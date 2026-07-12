export default function OurLocation() {
    return (
        <section className="relative mx-auto flex max-w-7xl flex-col items-center justify-center gap-8 px-6 py-20 text-center sm:px-8 lg:py-28">
            <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Temukan Kami
                </h2>
                <p className="mx-auto max-w-2xl text-balance text-lg text-neutral-400 sm:text-xl">
                    Aula Graha Sanusi Hardjadinata, Universitas Padjadjaran
                </p>
            </div>

            <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-md">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl sm:aspect-video lg:aspect-[21/9]">
                    <iframe
                        className="absolute inset-0 h-full w-full border-0"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9848904239084!2d107.6144918749962!3d-6.8924101931067!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6ff3218aacd%3A0xce249fca022b09c4!2sGraha%20Sanusi%20Hardjadinata!5e0!3m2!1sen!2sid!4v1783634649226!5m2!1sen!2sid"
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
                <div className="relative aspect-square w-full overflow-hidden rounded-xl sm:aspect-video lg:aspect-[21/9]">
                    <iframe
                        className="absolute inset-0 h-full w-full border-0"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9848904239084!2d107.6144918749962!3d-6.8924101931067!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6ff3218aacd%3A0xce249fca022b09c4!2sGraha%20Sanusi%20Hardjadinata!5e0!3m2!1sen!2sid!4v1783634649226!5m2!1sen!2sid"
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </div>
        </section>
    );
}