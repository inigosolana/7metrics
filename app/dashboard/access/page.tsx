"use client"

import { useClub } from "@/contexts/club-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ShieldAlert, Users } from "lucide-react"

export default function AccessManagementPage() {
  const { coaches, teams, updateCoachTeams, currentUser } = useClub()

  if (currentUser?.role !== "superadmin") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-foreground">Acceso Restringido</h2>
        <p className="text-muted-foreground">
          Solo los Superadministradores pueden gestionar los accesos de los entrenadores.
        </p>
      </div>
    )
  }

  const toggleTeamAccess = (coachId: string, teamId: string, isChecked: boolean) => {
    const coach = coaches.find((c) => c.id === coachId)
    if (!coach) return

    const currentTeamIds = coach.assignedTeamIds || []
    let newTeamIds: string[]

    if (isChecked) {
      newTeamIds = [...currentTeamIds, teamId]
    } else {
      newTeamIds = currentTeamIds.filter((id) => id !== teamId)
    }

    updateCoachTeams(coachId, newTeamIds)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Accesos</h1>
          <p className="text-muted-foreground">Asigna permisos de edición de equipos a los entrenadores</p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Matriz de Permisos Entrenador-Equipo</CardTitle>
          <CardDescription className="text-muted-foreground">
            Los entrenadores solo pueden editar estadísticas de los equipos seleccionados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[250px]">Entrenador</TableHead>
                {teams.map((team) => (
                  <TableHead key={team.id} className="text-center">
                    {team.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {coaches.map((coach) => (
                <TableRow key={coach.id} className="border-border">
                  <TableCell>
                    <div>
                      <p className="font-bold text-card-foreground">{coach.name}</p>
                      <p className="text-xs text-muted-foreground">{coach.email}</p>
                    </div>
                  </TableCell>
                  {teams.map((team) => (
                    <TableCell key={team.id} className="text-center">
                      <Checkbox
                        checked={coach.assignedTeamIds?.includes(team.id)}
                        onCheckedChange={(checked) => toggleTeamAccess(coach.id, team.id, checked as boolean)}
                        className="border-primary data-[state=checked]:bg-primary"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
