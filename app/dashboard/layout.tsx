"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Activity, LayoutDashboard, Shield, LogOut, Smartphone, Menu, X, Users, Settings, PlayCircle } from "lucide-react"
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
    { name: "Sala de Análisis", href: "/dashboard/analysis", icon: Activity, roles: ["superadmin", "coach"] },
    { name: "Video Studio (AI)", href: "/dashboard/coach/video", icon: PlayCircle, roles: ["superadmin", "coach"] },
    { name: "Gestión de Clubes", href: "/dashboard/clubs", icon: Shield, roles: ["superadmin"] },
    { name: "Gestión de Accesos", href: "/dashboard/access", icon: Shield, roles: ["superadmin"] },
  ].filter((item) => item.roles.includes(currentUser.role))

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-sidebar-border bg-sidebar transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center px-6 border-b border-sidebar-border/50">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Activity className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground">
              7metrics
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info Section */}
        <div className="px-6 py-6 border-b border-sidebar-border/50">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            USUARIO ACTUAL
          </p>
          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-white">{currentUser.name}</h3>
            <span className="text-xs font-bold text-primary mt-0.5 capitalize">
              {currentUser.role === "superadmin"
                ? "Administrador Global"
                : currentUser.role === "coach"
                  ? "Entrenador"
                  : "Jugador"}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-white border-l-2 border-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-white",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.name}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border/50 space-y-1">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white hover:bg-sidebar-accent/50 h-10">
              Volver al Inicio
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10 h-10"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content Areas */}
      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-sidebar px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="text-white">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-bold text-white">
            Handball<span className="text-primary">.AI</span>
          </span>
          <div className="w-10" />
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  )
}
