import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TacticalHubPage() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Tactical Hub</h1>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">Coach Access</span>
            </div>

            <Tabs defaultValue="roster" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="roster">Roster & Health</TabsTrigger>
                    <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
                    <TabsTrigger value="video">Video Intelligence</TabsTrigger>
                </TabsList>

                <TabsContent value="roster" className="space-y-4">
                    <div className="border rounded-lg p-6 h-96 flex items-center justify-center bg-muted/20">
                        <p className="text-muted-foreground">Team Roster Table & Physical Status</p>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <div className="border rounded-lg p-6 h-96 flex items-center justify-center bg-muted/20">
                        <p className="text-muted-foreground">Player Comparisons (Player A vs Player B)</p>
                    </div>
                </TabsContent>

                <TabsContent value="video" className="space-y-4">
                    <div className="border rounded-lg p-6 min-h-[500px] flex flex-col items-center justify-center bg-black/5 dark:bg-white/5">
                        <h3 className="text-xl font-semibold mb-2">Auto-Clipped Video Feed</h3>
                        <p className="text-muted-foreground mb-4">Syncs with imported JSON timestamps</p>
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                            Launch Video Player
                        </button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
