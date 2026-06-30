import FormFileField from "@/components/form/form-file-field"
import type { MechaturaFormValues } from "@/lib/validation/mechatura"

type MechaturaDocsInfoProps = {
    documentMaxSizeInBytes: number;
};

export default function MechaturaDocsInfo({
    documentMaxSizeInBytes,
}: MechaturaDocsInfoProps){
    return (
        <section className="space-y-4 border rounded-2xl p-4" aria-labelledby="team-section-label">
            <div>
                <h2 id="team-section-label" className="font-semibold">
                    Lampiran Anggota Tim
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Mohon isi input di bawah berikut dengan satu file PDF yang berisi atas 3 hal, yaitu:
                </p>
                <ul className="mt-1 text-sm leading-6 text-muted-foreground">
                    <li>- Student ID (KTM/Kartu Pelajar) Leader</li>
                    <li>- Student ID Member 2</li>
                    <li>- Student ID Member 3</li>
                </ul>
            </div>
    
            <FormFileField<MechaturaFormValues>
                name="member_document"
                title="Upload Member Document"
                description="Mohon unggah file sesuai dengan ketentuan yang tertera."
                accept="application/pdf"
                maxSizeInBytes={documentMaxSizeInBytes}
                required
            />
        </section>
    )
}
