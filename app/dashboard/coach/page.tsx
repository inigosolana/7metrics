import Link from 'next/link'

export default function CoachDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Coach Dashboard</h1>
            <div className="grid gap-6 md:grid-cols-2">
                <Link href="/dashboard/coach/tactical-hub" className="block group">
                    <div className="p-6 border rounded-lg hover:border-primary transition-colors h-full">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">Tactical Hub</h3>
                        <p className="text-muted-foreground">Manage Roster, Analytics & Video.</p>
                    </div>
                </Link>

                <Link href="/dashboard/coach/import" className="block group">
                    <div className="p-6 border rounded-lg hover:border-primary transition-colors h-full">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">Import Center</h3>
                        <p className="text-muted-foreground">Upload Match Data (JSON).</p>
                    </div>
                </Link>
            </div>
        </div>
    )
}
