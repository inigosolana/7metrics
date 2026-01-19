import { redirect } from "next/navigation"

export default async function SuperadminDashboard() {
    // TODO: Integrate external authentication if available.
    // Currently skipping auth check as Supabase was removed and we rely on external API which might manage its own auth or use API keys.
    // For now, we allow access to the dashboard.

    // const { data: profile } = await supabase...

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
