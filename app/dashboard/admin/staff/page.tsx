"use client"

import { useState } from "react"
import { useClub, User } from "@/contexts/club-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, UserPlus, Shield } from "lucide-react"

export default function StaffManagementPage() {
    const { coaches, teams, updateCoachTeams } = useClub()
    const [selectedCoach, setSelectedCoach] = useState<User | null>(null)

    // State for the assignment modal
    const [selectedTeamsForAssignment, setSelectedTeamsForAssignment] = useState<string[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openAssignModal = (coach: User) => {
        setSelectedCoach(coach)
        setSelectedTeamsForAssignment(coach.assignedTeamIds || [])
        setIsModalOpen(true)
    }

    const handleTeamToggle = (teamId: string) => {
        setSelectedTeamsForAssignment(prev =>
            prev.includes(teamId)
                ? prev.filter(id => id !== teamId)
                : [...prev, teamId]
        )
    }

    const saveAssignments = () => {
        if (selectedCoach) {
            updateCoachTeams(selectedCoach.id, selectedTeamsForAssignment)
            setIsModalOpen(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Gestión de Plantilla Técnica</h1>
                    <p className="text-muted-foreground">Administra a tus entrenadores y asigna sus equipos.</p>
                </div>
                <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nuevo Entrenador
                </Button>
            </div>

            <div className="grid gap-4">
                {coaches.map(coach => (
                    <Card key={coach.id} className="bg-card border-border">
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{coach.name}</h3>
                                    <p className="text-sm text-muted-foreground">{coach.email}</p>
                                </div>
                            </div>

                            <div className="flex-1 px-8">
                                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Equipos Asignados</p>
                                <div className="flex flex-wrap gap-2">
                                    {coach.assignedTeamIds && coach.assignedTeamIds.length > 0 ? (
                                        coach.assignedTeamIds.map(teamId => {
                                            const team = teams.find(t => t.id === teamId)
                                            return team ? (
                                                <Badge key={teamId} variant="secondary">
                                                    {team.name}
                                                </Badge>
                                            ) : null
                                        })
                                    ) : (
                                        <span className="text-sm text-muted-foreground italic">Sin asignación</span>
                                    )}
                                </div>
                            </div>

                            <Button variant="outline" onClick={() => openAssignModal(coach)}>
                                <Shield className="w-4 h-4 mr-2" />
                                Gestionar Asignaciones
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal de Asignación */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Asignar Equipos</DialogTitle>
                        <DialogDescription>
                            Selecciona qué equipos entrenará <strong>{selectedCoach?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {teams.map(team => (
                            <div key={team.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                                <Checkbox
                                    id={`team-${team.id}`}
                                    checked={selectedTeamsForAssignment.includes(team.id)}
                                    onCheckedChange={() => handleTeamToggle(team.id)}
                                />
                                <label
                                    htmlFor={`team-${team.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                                >
                                    {team.name}
                                    <span className="ml-2 text-xs text-muted-foreground">({team.category})</span>
                                </label>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={saveAssignments}>Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
