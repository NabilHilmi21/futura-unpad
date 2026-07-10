import { FormTextField } from "@/components/form/form-text-field"
import { MechaturaFormValues } from "@/lib/validation"

export default function MechaturaMemberInfo(){
    return (
        <section className="overflow-hidden rounded-xl border border-border bg-card" aria-labelledby="team-section-label">
            <div className="border-b border-border p-8">
                <h2 id="team-section-label" className="text-lg font-semibold">
                    Identitas Anggota Tim
                </h2>
                <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
                    Mohon isi data member tim
                </p>
            </div>
            
            <div className="space-y-6 p-8">
    
            {/* FORM KETUA TIM */}
            <FormTextField<MechaturaFormValues>
                name="leader_name"
                label="Nama Ketua Tim"
                placeholder="Masukkan nama ketua tim anda"
                required
            />
    
            <div className="grid gap-3 sm:grid-cols-2">
                <FormTextField<MechaturaFormValues>
                    name="leader_email"
                    label="Email Ketua Tim"
                    placeholder="Masukkan email ketua tim anda"
                    required
                />
        
                <FormTextField<MechaturaFormValues>
                    name="leader_phone"
                    label="No. WhatsApp Ketua Tim"
                    placeholder="Masukkan nama WhatsApp ketua tim anda"
                    required
                />
            </div>

            {/* FORM ANGGOTA TIM */}
             <FormTextField<MechaturaFormValues>
                name="member2_name"
                label="Nama Anggota 1"
                placeholder="Masukkan nama ketua tim anda"
            />
    
            <div className="grid gap-3 sm:grid-cols-2">
                <FormTextField<MechaturaFormValues>
                    name="member2_email"
                    label="Email Anggota 1"
                    placeholder="Masukkan email anggota anda"
                />
        
                <FormTextField<MechaturaFormValues>
                    name="member2_phone"
                    label="No. WhatsApp Anggota 1"
                    placeholder="Masukkan nama WhatsApp anggota anda"
                />
            </div>

            <FormTextField<MechaturaFormValues>
                name="member3_name"
                label="Nama Anggota 2"
                placeholder="Masukkan nama ketua tim anda"
            />
    
            <div className="grid gap-3 sm:grid-cols-2">
                <FormTextField<MechaturaFormValues>
                    name="member3_email"
                    label="Email Anggota 2"
                    placeholder="Masukkan email anggota anda"
                />
        
                <FormTextField<MechaturaFormValues>
                    name="member3_phone"
                    label="No. WhatsApp Anggota 2"
                    placeholder="Masukkan nama WhatsApp anggota anda"
                />
            </div>
            </div>
        </section>
    )
}