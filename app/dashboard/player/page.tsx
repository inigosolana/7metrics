import { createClient } from "@/lib/supabase/server"

export default async function PlayerDashboard() {
    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">My Performance</h1>
                <p className="text-muted-foreground">Inigo Solana (Left Wing)</p>
            </header>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Evolution Graph */}
                <div className="col-span-2 p-6 border rounded-lg bg-card">
                    <h3 className="text-xl font-semibold mb-4">Season Evolution</h3>
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                        {/* Mock Graph Bars */}
                        {[40, 60, 45, 70, 80, 55, 65, 85].map((h, i) => (
                            <div key={i} className="w-full bg-primary/20 hover:bg-primary/40 transition-colors rounded-t" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground uppercase">
                        <span>Game 1</span>
                        <span>Game 8</span>
                    </div>
                </div>

                {/* Key Stats */}
                <div className="p-6 border rounded-lg bg-card">
                    <h3 className="text-lg font-medium mb-2">Shooting Efficiency</h3>
                    <div className="text-4xl font-bold text-primary">72%</div>
                    <p className="text-sm text-muted-foreground">+5% from last month</p>
                </div>

                {/* Team Context */}
                <div className="p-6 border rounded-lg bg-card">
                    <h3 className="text-lg font-medium mb-2">Team Rank</h3>
                    <div className="text-4xl font-bold">#3</div>
                    <p className="text-sm text-muted-foreground">Top Scorer</p>
                </div>
            </div>
        </div>
    )
}
