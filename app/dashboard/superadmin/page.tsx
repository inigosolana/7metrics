
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function SuperadminDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Verify Role (Double Check)
    // In a real app, middleware handles this, but we do a check here for safety scaffold
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'superadmin') {
        return <div>Access Denied. You are not a Superadmin.</div>
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Superadmin Control Center</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Management Cards */}
                <div className="p-6 border rounded-lg shadow-sm bg-card text-card-foreground">
                    <h3 className="text-xl font-semibold mb-2">Club Management</h3>
                    <p className="text-muted-foreground">Create clubs, assign teams.</p>
                </div>
                <div className="p-6 border rounded-lg shadow-sm bg-card text-card-foreground">
                    <h3 className="text-xl font-semibold mb-2">Assign Coaches</h3>
                    <p className="text-muted-foreground">Link coaches to specific teams.</p>
                </div>
            </div>
        </div>
    )
}
