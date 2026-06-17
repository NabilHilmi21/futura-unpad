import DiseminasiRisetForm from "./form";

export default function DiseminasiRisetPage() {
    return (
        <main className="mx-auto w-full max-w-3xl items-start space-y-12 px-6 py-16 sm:px-8">
            <section>
                <div className="space-y-2">
                    <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                        Diseminasi Riset Registration
                    </h1>
                </div>
                <DiseminasiRisetForm />
            </section>
        </main>
    )
}