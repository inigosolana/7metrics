"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { metricsApi } from "@/lib/api/client"
import { getMatchesAction } from "@/app/actions/sevenmetrics"

export type UserRole = "superadmin" | "club_admin" | "coach" | "player"

export interface User {
  id: string
  name: string
  email?: string
  role: UserRole
  clubId?: string
  teamId?: string
  assignedTeamIds?: string[] // IDs de equipos que el entrenador puede editar
}

export interface Club {
  id: string
  name: string
  coachId: string
}

export interface Team {
  id: string
  name: string
  category: string
  clubId: string
  coachId?: string // Entrenador asignado a este equipo
}

// <CHANGE> Añadido photoUrl y stats detalladas para heatmaps
export interface Player {
  id: string
  name: string
  number: number
  position:
  | "Portero"
  | "Extremo Izquierdo"
  | "Extremo Derecho"
  | "Lateral Izquierdo"
  | "Lateral Derecho"
  | "Central"
  | "Pivote"
  teamId: string
  photoUrl?: string
  height?: number // cm
  weight?: number // kg
  birthDate?: Date
}

export interface ShotZone {
  x: number // Posición X en % del campo (0-100)
  y: number // Posición Y en % del campo (0-100)
  result: "goal" | "miss" // Resultado del tiro
}

export interface MatchStats {
  playerId: string
  playerName: string
  goals: number
  misses: number
  turnovers: number
  assists?: number
  steals?: number
  shotZones?: ShotZone[] // Zonas de tiro para heatmap
}

export interface Match {
  id: string
  date: Date
  teamId: string
  teamName: string
  rival: string
  teamScore: number
  rivalScore: number
  stats: MatchStats[]
}

interface ClubContextType {
  currentUser: User | null
  login: (user: User) => void
  logout: () => void

  teams: Team[]
  clubs: Club[]
  addClub: (club: Club) => void
  deleteClub: (id: string) => void
  getTeamsByClub: (clubId: string) => Team[]
  addTeam: (team: Team) => void
  updateTeam: (id: string, team: Partial<Team>) => void
  assignCoachToTeam: (teamId: string, coachId: string | undefined) => void

  players: Player[]
  addPlayer: (player: Player) => void
  updatePlayer: (id: string, player: Partial<Player>) => void
  deletePlayer: (id: string) => void
  getPlayersByTeam: (teamId: string) => Player[]

  matches: Match[]
  addMatch: (match: Match) => void
  getMatchesByTeam: (teamId: string) => Match[]

  // <CHANGE> Sistema RBAC mejorado
  canEditTeam: (teamId: string) => boolean
  canDeleteFromTeam: (teamId: string) => boolean
  getAccessibleTeams: () => Team[]
  getPlayerStats: (playerId: string) => {
    totalGoals: number
    totalMisses: number
    totalTurnovers: number
    totalAssists: number
    totalSteals: number
    totalMatches: number
    accuracy: number
    avgGoalsPerMatch: number
    shotZones: ShotZone[]
  }

  // <CHANGE> Gestión de accesos para Superadmin
  coaches: User[]
  addCoach: (coach: User) => void
  updateCoachTeams: (coachId: string, teamIds: string[]) => void
}

const ClubContext = createContext<ClubContextType | undefined>(undefined)

import { initialClubs, initialTeams, initialPlayers, initialMatches, initialCoaches } from "@/lib/data/mock-db"

export function ClubProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [players, setPlayers] = useState<Player[]>(initialPlayers)
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [coaches, setCoaches] = useState<User[]>(initialCoaches)

  // <UPDATE> Fetch matches from External API
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await getMatchesAction()
        const externalMatches = response.success && response.data ? response.data : []

        const mappedMatches: Match[] = externalMatches.map(m => ({
          id: m.id || 'unknown',
          date: m.created_at ? new Date(m.created_at) : new Date(),
          teamId: '1',
          teamName: m.team_a_name,
          rival: m.team_b_name,
          teamScore: m.local_score || 0,
          rivalScore: m.visitor_score || 0,
          stats: []
        }))

        if (mappedMatches.length > 0) {
          setMatches(mappedMatches)
        }
      } catch (error) {
        console.error("Failed to fetch matches from external API (via Server Action):", error)
      }
    }

    fetchMatches()
  }, [])


  const login = (user: User) => {
    setCurrentUser(user)
  }

  const [clubs, setClubs] = useState<Club[]>(initialClubs)

  const addClub = (club: Club) => {
    setClubs([...clubs, club])
  }

  const deleteClub = (id: string) => {
    setClubs(clubs.filter(c => c.id !== id))
    // Also delete associated teams
    setTeams(teams.filter(t => t.clubId !== id))
  }

  const getTeamsByClub = (clubId: string) => {
    return teams.filter(t => t.clubId === clubId)
  }

  const logout = () => {
    setCurrentUser(null)
  }

  const addTeam = (team: Team) => {
    setTeams([...teams, team])
  }

  const updateTeam = (id: string, updatedTeam: Partial<Team>) => {
    setTeams(teams.map((t) => (t.id === id ? { ...t, ...updatedTeam } : t)))
  }

  // <CHANGE> Nueva función para asignar entrenador a equipo
  const assignCoachToTeam = (teamId: string, coachId: string | undefined) => {
    setTeams(teams.map((t) => (t.id === teamId ? { ...t, coachId } : t)))
  }

  const addPlayer = (player: Player) => {
    setPlayers([...players, player])
  }

  const updatePlayer = (id: string, updatedPlayer: Partial<Player>) => {
    setPlayers(players.map((p) => (p.id === id ? { ...p, ...updatedPlayer } : p)))
  }

  const deletePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id))
  }

  const addMatch = (match: Match) => {
    setMatches([...matches, match])
  }

  const getPlayersByTeam = (teamId: string) => {
    return players.filter((p) => p.teamId === teamId)
  }

  const getMatchesByTeam = (teamId: string) => {
    return matches.filter((m) => m.teamId === teamId)
  }

  // <CHANGE> Sistema RBAC mejorado con verificación de asignación
  const canEditTeam = (teamId: string) => {
    if (!currentUser) return false

    if (currentUser.role === "superadmin" || currentUser.role === "club_admin") return true

    if (currentUser.role === "coach") {
      return currentUser.assignedTeamIds?.includes(teamId) || false
    }

    return false
  }

  const canDeleteFromTeam = (teamId: string) => {
    if (!currentUser) return false

    if (currentUser.role === "superadmin" || currentUser.role === "club_admin") return true

    if (currentUser.role === "coach") {
      return currentUser.assignedTeamIds?.includes(teamId) || false
    }

    return false
  }

  const getAccessibleTeams = () => {
    if (!currentUser) return []

    if (currentUser.role === "superadmin" || currentUser.role === "club_admin") {
      return teams
    }

    if (currentUser.role === "coach") {
      // Entrenador ve todos los equipos pero solo puede editar los asignados
      return teams
    }

    if (currentUser.role === "player") {
      // El jugador solo ve su equipo
      const player = players.find(p => p.id === currentUser.id)
      return teams.filter((t) => t.id === player?.teamId)
    }

    return []
  }

  // <CHANGE> Estadísticas mejoradas con zonas de tiro
  const getPlayerStats = (playerId: string) => {
    const playerMatches = matches.flatMap((match) => match.stats.filter((stat) => stat.playerId === playerId))

    const totalGoals = playerMatches.reduce((sum, stat) => sum + stat.goals, 0)
    const totalMisses = playerMatches.reduce((sum, stat) => sum + stat.misses, 0)
    const totalTurnovers = playerMatches.reduce((sum, stat) => sum + stat.turnovers, 0)
    const totalAssists = playerMatches.reduce((sum, stat) => sum + (stat.assists || 0), 0)
    const totalSteals = playerMatches.reduce((sum, stat) => sum + (stat.steals || 0), 0)
    const totalShots = totalGoals + totalMisses
    const totalMatches = playerMatches.length

    // Agregar todas las zonas de tiro de todos los partidos
    const shotZones = playerMatches.flatMap((stat) => stat.shotZones || [])

    return {
      totalGoals,
      totalMisses,
      totalTurnovers,
      totalAssists,
      totalSteals,
      totalMatches,
      accuracy: totalShots > 0 ? (totalGoals / totalShots) * 100 : 0,
      avgGoalsPerMatch: totalMatches > 0 ? totalGoals / totalMatches : 0,
      shotZones,
    }
  }

  // <CHANGE> Funciones de gestión de entrenadores
  const addCoach = (coach: User) => {
    setCoaches([...coaches, coach])
  }

  const updateCoachTeams = (coachId: string, teamIds: string[]) => {
    setCoaches(coaches.map((c) => (c.id === coachId ? { ...c, assignedTeamIds: teamIds } : c)))
  }

  return (
    <ClubContext.Provider
      value={{
        currentUser,
        login,
        logout,
        clubs,
        addClub,
        deleteClub,
        getTeamsByClub,
        teams,
        addTeam,
        updateTeam,
        assignCoachToTeam,
        players,
        addPlayer,
        updatePlayer,
        deletePlayer,
        matches,
        addMatch,
        getPlayersByTeam,
        getMatchesByTeam,
        canEditTeam,
        canDeleteFromTeam,
        getAccessibleTeams,
        getPlayerStats,
        coaches,
        addCoach,
        updateCoachTeams,
      }}
    >
      {children}
    </ClubContext.Provider>
  )
}

export function useClub() {
  const context = useContext(ClubContext)
  if (context === undefined) {
    throw new Error("useClub must be used within a ClubProvider")
  }
  return context
}
