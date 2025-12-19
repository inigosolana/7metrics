"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Activity, LayoutDashboard, Shield, LogOut, Smartphone, Menu, X } from "lucide-react"
import { useState } from "react"
import { useClub } from "@/contexts/club-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, logout } = useClub()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      router.push("/login")
    }
  }, [currentUser, router])

  if (!currentUser) {
    return null
  }

  const navigation = [
    { name: "Mis Equipos", href: "/dashboard", icon: LayoutDashboard, roles: ["superadmin", "coach", "player"] },
    { name: "Gestión de Clubes", href: "/dashboard/clubs", icon: Shield, roles: ["superadmin"] },
    { name: "Gestión de Accesos", href: "/dashboard/access", icon: Shield, roles: ["superadmin"] },
  ].filter((item) => item.roles.includes(currentUser.role))

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-sidebar transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <Activity className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-sidebar-foreground">
                Handball<span className="text-sidebar-primary">.AI</span>
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User info */}
          <div className="border-b border-sidebar-border px-4 py-3 bg-sidebar-accent/30">
            <p className="text-xs text-sidebar-foreground/60 uppercase font-semibold mb-1">Usuario actual</p>
            <p className="text-sm font-medium text-sidebar-foreground">{currentUser.name}</p>
            <p className="text-xs text-sidebar-primary capitalize">
              {currentUser.role === "superadmin"
                ? "Superadmin"
                : currentUser.role === "coach"
                  ? "Entrenador"
                  : "Jugador"}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </div>
                </Link>
              )
            })}

            {(currentUser.role === "superadmin" || currentUser.role === "coach") && (
              <Link href="/dashboard/external-app">
                <div className="mt-4 flex items-center gap-3 rounded-lg bg-secondary/20 border border-secondary/30 px-3 py-3 text-sm font-bold text-secondary transition-all hover:bg-secondary/30">
                  <Smartphone className="h-5 w-5" />
                  SIMULAR APP EXTERNA
                </div>
              </Link>
            )}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4 space-y-2">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
                Volver al Inicio
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header móvil */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="text-card-foreground">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-bold text-card-foreground">
            Handball<span className="text-primary">.AI</span>
          </span>
          <div className="w-10" />
        </header>

        {/* Área de contenido */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
