"use client"

import { useState } from "react"
import { useClub } from "@/contexts/club-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Download, Database, Zap } from "lucide-react"

export default function ExternalAppPage() {
  const { currentUser, players, matches, teams } = useClub()
  const [syncing, setSyncing] = useState(false)

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => {
      alert("Datos sincronizados correctamente con la app externa!")
      setSyncing(false)
    }, 1500)
  }

  const handleExport = () => {
    const exportData = {
      players: players.length,
      matches: matches.length,
      teams: teams.length,
      timestamp: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `handball-data-${Date.now()}.json`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20 border border-secondary/30">
          <Smartphone className="h-6 w-6 text-secondary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Simulación de App Externa</h1>
          <p className="text-muted-foreground">Conexión y sincronización con dispositivos móviles</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card de estado */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Estado de Sincronización
            </CardTitle>
            <CardDescription className="text-muted-foreground">Datos disponibles para compartir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{teams.length}</p>
                <p className="text-xs text-muted-foreground">Equipos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary">{players.length}</p>
                <p className="text-xs text-muted-foreground">Jugadores</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-card-foreground">{matches.length}</p>
                <p className="text-xs text-muted-foreground">Partidos</p>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <strong>Usuario conectado:</strong> {currentUser?.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Rol: {currentUser?.role === "coach" ? "Entrenador" : "Superadmin"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card de acciones */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-secondary" />
              Acciones de Sincronización
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Conecta con tu app móvil o exporta datos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleSync}
              disabled={syncing}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Database className="mr-2 h-4 w-4" />
              {syncing ? "Sincronizando..." : "Sincronizar con App Móvil"}
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              className="w-full border-secondary text-secondary hover:bg-secondary/10 bg-transparent"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar Datos
            </Button>
            <div className="mt-4 p-3 bg-secondary/10 border border-secondary/30 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong className="text-secondary">Simulación:</strong> En producción, aquí se conectaría con una API
                real que sincronizaría datos con apps móviles instaladas en tablets/smartphones para registro en vivo
                durante los partidos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info adicional */}
      <Card className="bg-card/50 border-border">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-card-foreground mb-3">Funcionalidad de App Externa</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-card-foreground mb-2">Características Principales:</h4>
              <ul className="space-y-1 list-disc pl-5">
                <li>Sincronización bidireccional de datos en tiempo real</li>
                <li>Registro de estadísticas durante el partido desde tablet</li>
                <li>Modo offline con sincronización posterior</li>
                <li>Interfaz táctil optimizada para uso en campo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-card-foreground mb-2">Casos de Uso:</h4>
              <ul className="space-y-1 list-disc pl-5">
                <li>Entrenador registra estadísticas en vivo desde banquillo</li>
                <li>Analista captura métricas avanzadas durante el juego</li>
                <li>Sincronización automática al finalizar el partido</li>
                <li>Exportación de datos para análisis externo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
