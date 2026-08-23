export type Role = 'Admin' | 'Inspector' | 'RepairTeam'

export interface Defect {
  id: string
  defectTypeId: string
  locationId: string
  detectedAt: string
  detectedById: string
  saverity: number
  description?: string | null
  status: number
  plannedRepairDate?: string | null
  repairTeamId?: string | null
  recommendationType: number
  sourceType: number
}

export interface DefectType {
  id: string
  name: string
  description?: string | null
}

export interface Location {
    id: string
    trackSegmentId: string

    railwaySection: string
    subDivision: string
    kilometer: number
    picket: number
    latitude: number
    longitude: number
}

export interface Inspector {
  id: string
  inspectorType: number
  employeeId?: string | null
  fullName?: string | null
  sensorSerial?: string | null
}

export interface RepairTeam {
  id: string
  name: string
  contact: string
  contractor: boolean
}

export interface DataSource {
  id: string
  name: string
}

export interface DefectStatusHistory {
  id: string
  defectId: string
  oldStatus: number
  newStatus: number
  comment?: string | null
  createdAt?: string
  createdBy?: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresAt?: string
  user?: {
    id: string
    userName?: string
    email?: string
    firstName?: string
    lastName?: string
    roles: Role[]
  }
}

export interface TrackPoint {
  id: string
  order: number
  x: number
  y: number
}

export interface TrackSegment {
  id: string
  name: string
  startKm: number
  endKm: number
  points: TrackPoint[]
}

export interface TrackSensor {
  id: string
  name: string
  serial: string
  trackSegmentId: string
  x: number
  y: number
}
