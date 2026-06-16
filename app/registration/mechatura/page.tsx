import MechaturaForm from "./form"

export default function MechaturaPage(){
    return (
        <main className="mx-auto w-full max-w-4xl items-start space-y-12 px-6 py-16 sm:px-8">
            <section>
                <div className="space-y-2">
                    <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                        Mechatura Registration
                    </h1>
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                        Choose Robot Sumo or Robot Transporter, complete team and
                        robot details, review eligibility documents, then continue
                        to the payment preview.
                    </p>
                </div>
            </section>

            <section>
                <MechaturaForm />
            </section>
        </main>
    )
}
