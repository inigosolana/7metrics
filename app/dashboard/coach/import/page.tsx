
import { createClient } from "@/lib/supabase/server"

export default async function ImportZonePage() {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Import Match Data</h1>

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 text-center hover:bg-muted/5 transition-colors cursor-pointer">
                <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                    {/* Upload Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">Drag and drop JSON file</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Exported from the Handball Stats App
                </p>
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
                    Select File
                </button>
            </div>

            <div className="mt-8">
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Recent Imports</h4>
                <div className="space-y-2">
                    {/* List of previous imports would go here */}
                    <div className="p-4 border rounded-lg bg-card flex justify-between items-center">
                        <span>Match_2023_10_12.json</span>
                        <span className="text-green-500 text-sm">Processed</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
