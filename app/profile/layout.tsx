import { ProfileTabs } from "@/components/layout/profile-tabs"

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="pt-32 pb-16 px-6 lg:px-8 mx-auto w-full max-w-4xl min-h-screen">
            <div className="space-y-2 mb-6">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                    Your Profile
                </h1>
                <p className="max-w-xl text-sm font-medium leading-relaxed text-neutral-500">
                    Manage your Futura account and event registrations.
                </p>
            </div>
            <ProfileTabs />
            {children}
        </div>
    )
}
