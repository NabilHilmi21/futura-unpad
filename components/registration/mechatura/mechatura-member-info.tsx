import { FormTextField } from "../form-text-field"
import { MechaturaFormValues } from "@/lib/validation"

export default function MechaturaMemberInfo(){
    return (
        <section className="space-y-4 border rounded-2xl p-4" aria-labelledby="team-section-label">
            <div>
                <h2 id="team-section-label" className="text-base font-semibold">
                    Identitas Anggota Tim
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Mohon isi data member tim
                </p>
            </div>
    
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
        </section>
    )
}