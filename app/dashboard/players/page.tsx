"use client"

import { useState } from "react"
import { useClub } from "@/contexts/club-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, UserCircle } from "lucide-react"

const positions = [
  "Portero",
  "Extremo Izquierdo",
  "Extremo Derecho",
  "Lateral Izquierdo",
  "Lateral Derecho",
  "Central",
  "Pivote",
]

export default function PlayersPage() {
  const {
    currentUser,
    getAccessibleTeams,
    players,
    addPlayer,
    updatePlayer,
    deletePlayer,
    getPlayersByTeam,
    canEditTeam,
    canDeleteFromTeam,
  } = useClub()
  const accessibleTeams = getAccessibleTeams()
  const [selectedTeam, setSelectedTeam] = useState(accessibleTeams[0]?.id || "")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    position: "",
  })

  const teamPlayers = getPlayersByTeam(selectedTeam)

  const handleAddPlayer = () => {
    setEditingPlayer(null)
    setFormData({ name: "", number: "", position: "" })
    setIsDialogOpen(true)
  }

  const handleEditPlayer = (playerId: string) => {
    const player = players.find((p) => p.id === playerId)
    if (player) {
      setEditingPlayer(playerId)
      setFormData({
        name: player.name,
        number: player.number.toString(),
        position: player.position,
      })
      setIsDialogOpen(true)
    }
  }

  const handleDeletePlayer = (playerId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este jugador?")) {
      deletePlayer(playerId)
    }
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.number || !formData.position) {
      alert("Por favor completa todos los campos")
      return
    }

    if (editingPlayer) {
      updatePlayer(editingPlayer, {
        name: formData.name,
        number: Number.parseInt(formData.number),
        position: formData.position as any,
      })
    } else {
      addPlayer({
        id: Date.now().toString(),
        name: formData.name,
        number: Number.parseInt(formData.number),
        position: formData.position as any,
        teamId: selectedTeam,
      })
    }

    setIsDialogOpen(false)
    setFormData({ name: "", number: "", position: "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Plantilla</h1>
          <p className="text-muted-foreground">
            {currentUser?.role === "player"
              ? "Vista de solo lectura de tu equipo"
              : "Añade, edita o elimina jugadores de tu equipo"}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-full sm:w-[200px] bg-card border-border">
              <SelectValue placeholder="Seleccionar equipo" />
            </SelectTrigger>
            <SelectContent>
              {accessibleTeams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canEditTeam(selectedTeam) && (
            <Button onClick={handleAddPlayer} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Añadir Jugador
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Plantilla Actual</CardTitle>
          <CardDescription className="text-muted-foreground">
            {teamPlayers.length} jugadores registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay jugadores registrados en este equipo</p>
              {canEditTeam(selectedTeam) && (
                <Button
                  onClick={handleAddPlayer}
                  variant="outline"
                  className="mt-4 border-primary text-primary hover:bg-primary/10 bg-transparent"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir primer jugador
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Dorsal</TableHead>
                  <TableHead className="text-muted-foreground">Nombre</TableHead>
                  <TableHead className="text-muted-foreground">Posición</TableHead>
                  {canEditTeam(selectedTeam) && <TableHead className="text-right text-muted-foreground">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamPlayers.map((player) => (
                  <TableRow key={player.id} className="border-border">
                    <TableCell className="font-bold text-primary">{player.number}</TableCell>
                    <TableCell className="text-card-foreground">{player.name}</TableCell>
                    <TableCell className="text-card-foreground">{player.position}</TableCell>
                    {canEditTeam(selectedTeam) && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPlayer(player.id)}
                            className="text-secondary hover:bg-secondary/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {canDeleteFromTeam(selectedTeam) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePlayer(player.id)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog para añadir/editar jugador */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              {editingPlayer ? "Editar Jugador" : "Añadir Jugador"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">Completa la información del jugador</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-card-foreground">
                Nombre Completo
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Pablo García"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="number" className="text-card-foreground">
                Dorsal
              </Label>
              <Input
                id="number"
                type="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="Ej: 10"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="position" className="text-card-foreground">
                Posición
              </Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData({ ...formData, position: value })}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Seleccionar posición" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {editingPlayer ? "Guardar Cambios" : "Añadir Jugador"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
