import { Team, Player, Match, Club, User } from "@/contexts/club-context"

// Shared Mock Data

export const initialClubs: Club[] = [
    { id: "club1", name: "Club Balonmano Ejemplo", coachId: "coach3" }
]

export const initialTeams: Team[] = [
    { id: "1", name: "Senior A Masculino", category: "Senior", clubId: "club1", coachId: "coach1" },
    { id: "2", name: "Juvenil B Femenino", category: "Juvenil", clubId: "club1", coachId: "coach1" },
    { id: "3", name: "Cadete A Masculino", category: "Cadete", clubId: "club1", coachId: "coach2" },
    { id: "4", name: "Infantil Mixto", category: "Infantil", clubId: "club1", coachId: undefined },
]

export const initialPlayers: Player[] = [
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

export const initialMatches: Match[] = [
    // Keeping just one sample history match to avoid clutter, real matches come from API
    {
        id: "history-1",
        date: new Date("2024-01-15"),
        teamId: "1",
        teamName: "Senior A Masculino",
        rival: "BM Ciudad Real",
        teamScore: 28,
        rivalScore: 24,
        stats: []
    }
]

export const initialCoaches: User[] = [
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
