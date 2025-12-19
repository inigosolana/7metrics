"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type UserRole = "superadmin" | "coach" | "player"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  assignedTeamIds?: string[] // IDs de equipos que el entrenador puede editar
}

export interface Team {
  id: string
  name: string
  category: string
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

// <CHANGE> Datos mock más completos y realistas
const initialTeams: Team[] = [
  { id: "1", name: "Senior A Masculino", category: "Senior", coachId: "coach1" },
  { id: "2", name: "Juvenil B Femenino", category: "Juvenil", coachId: "coach1" },
  { id: "3", name: "Cadete A Masculino", category: "Cadete", coachId: "coach2" },
  { id: "4", name: "Infantil Mixto", category: "Infantil", coachId: undefined },
]

const initialPlayers: Player[] = [
  { 
    id: "1", 
    name: "Carlos Martínez", 
    number: 1, 
    position: "Portero", 
    teamId: "1", 
    height: 188, 
    weight: 85,
    photoUrl: "/placeholder.svg?key=u4n5u",
    birthDate: new Date("1995-03-15")
  },
  { 
    id: "2", 
    name: "Pablo García", 
    number: 10, 
    position: "Central", 
    teamId: "1", 
    height: 192, 
    weight: 95,
    photoUrl: "/placeholder.svg?key=yur0p",
    birthDate: new Date("1997-07-22")
  },
  { 
    id: "3", 
    name: "David López", 
    number: 7, 
    position: "Extremo Derecho", 
    teamId: "1", 
    height: 182, 
    weight: 78,
    photoUrl: "/placeholder.svg?key=l63j5",
    birthDate: new Date("1996-11-08")
  },
  { 
    id: "4", 
    name: "Miguel Sánchez", 
    number: 9, 
    position: "Lateral Izquierdo", 
    teamId: "1", 
    height: 185, 
    weight: 82,
    photoUrl: "/placeholder.svg?key=zkbkp",
    birthDate: new Date("1998-01-30")
  },
  { 
    id: "5", 
    name: "Javier Fernández", 
    number: 14, 
    position: "Pivote", 
    teamId: "1", 
    height: 190, 
    weight: 90,
    photoUrl: "/placeholder.svg?key=c8n2n",
    birthDate: new Date("1994-09-12")
  },
  { 
    id: "6", 
    name: "Ana Rodríguez", 
    number: 12, 
    position: "Portero", 
    teamId: "2", 
    height: 175, 
    weight: 65,
    photoUrl: "/placeholder.svg?key=3etx5",
    birthDate: new Date("2005-05-20")
  },
  { 
    id: "7", 
    name: "Laura Martín", 
    number: 8, 
    position: "Central", 
    teamId: "2", 
    height: 178, 
    weight: 70,
    photoUrl: "/placeholder.svg?key=gtbif",
    birthDate: new Date("2006-02-14")
  },
]

// <CHANGE> Datos de partidos con zonas de tiro para heatmap
const initialMatches: Match[] = [
  {
    id: "1",
    date: new Date("2024-01-15"),
    teamId: "1",
    teamName: "Senior A Masculino",
    rival: "BM Ciudad Real",
    teamScore: 28,
    rivalScore: 24,
    stats: [
      { 
        playerId: "2", 
        playerName: "Pablo García", 
        goals: 8, 
        misses: 3, 
        turnovers: 1,
        assists: 4,
        steals: 2,
        shotZones: [
          { x: 50, y: 20, result: "goal" },
          { x: 45, y: 25, result: "goal" },
          { x: 55, y: 30, result: "miss" },
          { x: 48, y: 22, result: "goal" },
          { x: 52, y: 28, result: "goal" },
          { x: 50, y: 35, result: "miss" },
          { x: 46, y: 24, result: "goal" },
          { x: 54, y: 26, result: "goal" },
          { x: 51, y: 31, result: "miss" },
          { x: 49, y: 23, result: "goal" },
          { x: 47, y: 27, result: "goal" },
        ]
      },
      { 
        playerId: "3", 
        playerName: "David López", 
        goals: 6, 
        misses: 2, 
        turnovers: 0,
        assists: 2,
        steals: 3,
        shotZones: [
          { x: 85, y: 15, result: "goal" },
          { x: 82, y: 18, result: "goal" },
          { x: 88, y: 20, result: "miss" },
          { x: 84, y: 16, result: "goal" },
          { x: 86, y: 22, result: "goal" },
          { x: 83, y: 19, result: "goal" },
          { x: 87, y: 17, result: "miss" },
          { x: 85, y: 21, result: "goal" },
        ]
      },
      { 
        playerId: "4", 
        playerName: "Miguel Sánchez", 
        goals: 7, 
        misses: 4, 
        turnovers: 2,
        assists: 3,
        steals: 1,
        shotZones: [
          { x: 25, y: 30, result: "goal" },
          { x: 22, y: 35, result: "miss" },
          { x: 28, y: 32, result: "goal" },
          { x: 24, y: 38, result: "goal" },
          { x: 26, y: 34, result: "miss" },
          { x: 23, y: 31, result: "goal" },
          { x: 27, y: 36, result: "goal" },
          { x: 25, y: 33, result: "miss" },
          { x: 29, y: 29, result: "goal" },
          { x: 21, y: 37, result: "miss" },
          { x: 26, y: 30, result: "goal" },
        ]
      },
      { 
        playerId: "5", 
        playerName: "Javier Fernández", 
        goals: 7, 
        misses: 1, 
        turnovers: 1,
        assists: 1,
        steals: 4,
        shotZones: [
          { x: 50, y: 10, result: "goal" },
          { x: 48, y: 12, result: "goal" },
          { x: 52, y: 8, result: "goal" },
          { x: 49, y: 11, result: "goal" },
          { x: 51, y: 9, result: "miss" },
          { x: 50, y: 13, result: "goal" },
          { x: 47, y: 10, result: "goal" },
          { x: 53, y: 11, result: "goal" },
        ]
      },
    ],
  },
  {
    id: "2",
    date: new Date("2024-01-20"),
    teamId: "1",
    teamName: "Senior A Masculino",
    rival: "Atlético Madrid",
    teamScore: 26,
    rivalScore: 26,
    stats: [
      { 
        playerId: "2", 
        playerName: "Pablo García", 
        goals: 9, 
        misses: 4, 
        turnovers: 0,
        assists: 3,
        steals: 1,
        shotZones: [
          { x: 50, y: 22, result: "goal" },
          { x: 46, y: 26, result: "miss" },
          { x: 54, y: 24, result: "goal" },
          { x: 49, y: 28, result: "goal" },
          { x: 51, y: 23, result: "miss" },
          { x: 48, y: 25, result: "goal" },
          { x: 52, y: 27, result: "goal" },
          { x: 47, y: 21, result: "miss" },
          { x: 53, y: 29, result: "goal" },
          { x: 50, y: 24, result: "goal" },
          { x: 49, y: 26, result: "miss" },
          { x: 51, y: 22, result: "goal" },
          { x: 48, y: 28, result: "goal" },
        ]
      },
      { 
        playerId: "3", 
        playerName: "David López", 
        goals: 5, 
        misses: 3, 
        turnovers: 1,
        assists: 1,
        steals: 2,
        shotZones: [
          { x: 86, y: 17, result: "goal" },
          { x: 83, y: 20, result: "miss" },
          { x: 88, y: 15, result: "goal" },
          { x: 85, y: 19, result: "goal" },
          { x: 84, y: 21, result: "miss" },
          { x: 87, y: 16, result: "goal" },
          { x: 82, y: 18, result: "miss" },
          { x: 86, y: 20, result: "goal" },
        ]
      },
      { 
        playerId: "4", 
        playerName: "Miguel Sánchez", 
        goals: 6, 
        misses: 2, 
        turnovers: 1,
        assists: 5,
        steals: 2,
        shotZones: [
          { x: 24, y: 33, result: "goal" },
          { x: 27, y: 31, result: "goal" },
          { x: 23, y: 36, result: "miss" },
          { x: 26, y: 32, result: "goal" },
          { x: 25, y: 35, result: "goal" },
          { x: 28, y: 34, result: "miss" },
          { x: 24, y: 30, result: "goal" },
          { x: 22, y: 33, result: "goal" },
        ]
      },
      { 
        playerId: "5", 
        playerName: "Javier Fernández", 
        goals: 6, 
        misses: 3, 
        turnovers: 2,
        assists: 2,
        steals: 3,
        shotZones: [
          { x: 51, y: 11, result: "goal" },
          { x: 49, y: 9, result: "miss" },
          { x: 52, y: 12, result: "goal" },
          { x: 48, y: 10, result: "goal" },
          { x: 50, y: 8, result: "miss" },
          { x: 53, y: 11, result: "goal" },
          { x: 47, y: 13, result: "miss" },
          { x: 51, y: 10, result: "goal" },
          { x: 49, y: 12, result: "goal" },
        ]
      },
    ],
  },
]

// <CHANGE> Lista inicial de entrenadores para gestión
const initialCoaches: User[] = [
  { 
    id: "coach1", 
    name: "Juan Pérez", 
    email: "juan.perez@club.com",
    role: "coach", 
    assignedTeamIds: ["1", "2"] 
  },
  { 
    id: "coach2", 
    name: "María González", 
    email: "maria.gonzalez@club.com",
    role: "coach", 
    assignedTeamIds: ["3"] 
  },
  { 
    id: "coach3", 
    name: "Pedro Martínez", 
    email: "pedro.martinez@club.com",
    role: "coach", 
    assignedTeamIds: [] 
  },
]

export function ClubProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [players, setPlayers] = useState<Player[]>(initialPlayers)
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [coaches, setCoaches] = useState<User[]>(initialCoaches)

  const login = (user: User) => {
    setCurrentUser(user)
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

    if (currentUser.role === "superadmin") return true

    if (currentUser.role === "coach") {
      return currentUser.assignedTeamIds?.includes(teamId) || false
    }

    return false
  }

  const canDeleteFromTeam = (teamId: string) => {
    if (!currentUser) return false

    if (currentUser.role === "superadmin") return true

    if (currentUser.role === "coach") {
      return currentUser.assignedTeamIds?.includes(teamId) || false
    }

    return false
  }

  const getAccessibleTeams = () => {
    if (!currentUser) return []

    if (currentUser.role === "superadmin") {
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
        teams,
        addTeam,
        updateTeam,
        assignCoachToTeam,
        players,
        addPlayer,
        updatePlayer,
        deletePlayer,
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
