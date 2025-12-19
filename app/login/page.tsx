"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClub, type UserRole } from "@/contexts/club-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Shield, User, Users } from "lucide-react"

const mockUsers = [
  {
    id: "superadmin1",
    name: "Administrador Global",
    role: "superadmin" as UserRole,
    description: "Control total del sistema y gestión de accesos para entrenadores.",
    icon: Shield,
  },
  {
    id: "coach1",
    name: "Entrenador Senior A",
    role: "coach" as UserRole,
    clubId: "club1",
    assignedTeamIds: ["1"],
    description: "Acceso completo para editar su equipo asignado. Modo lectura en el resto.",
    icon: Users,
  },
  {
    id: "player1",
    name: "Jugador de Plantilla",
    role: "player" as UserRole,
    clubId: "club1",
    teamId: "1",
    description: "Visualización de estadísticas personales y del equipo. Sin permisos de edición.",
    icon: User,
  },
]

export default function LoginPage() {
  const router = useRouter()
  const { login } = useClub()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const handleLogin = (user: (typeof mockUsers)[0]) => {
    setSelectedUser(user.id)
    setTimeout(() => {
      login({
        id: user.id,
        name: user.name,
        role: user.role,
        clubId: user.clubId,
        teamId: user.teamId,
        assignedTeamIds: user.assignedTeamIds, // Agregado para RBAC avanzado
      })
      router.push("/dashboard")
    }, 300)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-foreground">
              Handball<span className="text-primary">.AI</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Login Simulado - Sistema RBAC</h1>
          <p className="text-muted-foreground">Selecciona con qué rol quieres acceder al sistema</p>
        </div>

        {/* Cards de roles */}
        <div className="grid gap-6 md:grid-cols-3">
          {mockUsers.map((user) => (
            <Card
              key={user.id}
              className={`bg-card border-border cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg ${
                selectedUser === user.id ? "border-primary ring-2 ring-primary/20" : ""
              }`}
              onClick={() => handleLogin(user)}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <user.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-card-foreground text-lg">{user.name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  <span className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
                    {user.role === "superadmin" ? "Superadmin" : user.role === "coach" ? "Entrenador" : "Jugador"}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{user.description}</p>
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={selectedUser === user.id}
                >
                  {selectedUser === user.id ? "Accediendo..." : "Acceder"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info adicional */}
        <Card className="mt-8 bg-card/50 border-border">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-card-foreground mb-3 text-lg">Sistema de Permisos Avanzado (RBAC):</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                  <strong className="text-primary">Superadmin</strong>
                </div>
                <ul className="space-y-1 text-muted-foreground pl-7 list-disc">
                  <li>Ve todos los clubes y equipos</li>
                  <li>Crea/edita/borra clubes</li>
                  <li>Asigna entrenadores a equipos</li>
                  <li>Edición completa en todo</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-secondary flex-shrink-0" />
                  <strong className="text-secondary">Entrenador</strong>
                </div>
                <ul className="space-y-1 text-muted-foreground pl-7 list-disc">
                  <li>Ve todos los equipos de su club</li>
                  <li>
                    <strong>EDITA solo equipos asignados</strong>
                  </li>
                  <li>Otros equipos: modo observador</li>
                  <li>Puede usar modo partido</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <strong className="text-card-foreground">Jugador</strong>
                </div>
                <ul className="space-y-1 text-muted-foreground pl-7 list-disc">
                  <li>Ve equipos de su club</li>
                  <li>Solo lectura total</li>
                  <li>Sin botones de edición</li>
                  <li>Puede ver estadísticas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
