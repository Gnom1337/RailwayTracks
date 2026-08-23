import { http } from './http'
import type {
  DataSource, Defect, DefectStatusHistory, DefectType, Inspector, Location,
  RepairTeam, TrackSegment, TrackSensor,
} from './types'

const crud = <T, Create, Update>(path: string) => ({
  list: async () => (await http.get<T[]>(path)).data,
  get: async (id: string) => (await http.get<T>(`${path}/${id}`)).data,
  create: async (payload: Create) => (await http.post<T>(path, payload)).data,
  update: async (id: string, payload: Update) => http.put(`${path}/${id}`, payload),
  remove: async (id: string) => http.delete(`${path}/${id}`),
})

export const defectsApi = crud<
  Defect,
  Omit<Defect, 'id' | 'status'> & { status?: number },
  Omit<Defect, 'id' | 'status'>
>('/Defects')

export const defectTypesApi = crud<
  DefectType,
  Omit<DefectType, 'id'>,
  Omit<DefectType, 'id'>
>('/DefectTypes')

export const locationsApi = crud<
  Location,
  Omit<Location, 'id'>,
  Omit<Location, 'id'>
>('/Locations')

export const inspectorsApi = crud<
  Inspector,
  Omit<Inspector, 'id'>,
  Omit<Inspector, 'id'>
>('/Inspectors')

export const repairTeamsApi = crud<
  RepairTeam,
  Omit<RepairTeam, 'id'>,
  Omit<RepairTeam, 'id'>
    >('/RepairTeams')

export const dataSourcesApi = crud<
  DataSource,
  Omit<DataSource, 'id'>,
  Omit<DataSource, 'id'>
>('/DataSources')

export const historyApi = {
  list: async (defectId?: string) =>
    (await http.get<DefectStatusHistory[]>(
      defectId ? `/DefectStatusHistory?defectId=${defectId}` : '/DefectStatusHistory',
    )).data,
}

export const defectActionsApi = {
  changeStatus: (id: string, newStatus: number, comment?: string) =>
    http.patch(`/Defects/${id}/status`, { newStatus, comment }),
  assignRepairTeam: (id: string, repairTeamId: string | null) =>
    http.patch(`/Defects/${id}/repair-team`, { repairTeamId }),
}

export const trackSchemeApi = {
    getSegments: async () =>
        (
            await http.get<TrackSegment[]>(
                '/trackscheme/segments',
            )
        ).data,

    getSensors: async () =>
        (
            await http.get<TrackSensor[]>(
                '/trackscheme/sensors',
            )
        ).data,

    createSegment(data: {
        name: string
        startKm: number
        endKm: number
        points: {
            order: number
            x: number
            y: number
        }[]
    }) {
        return http.post<TrackSegment>(
            '/TrackScheme/segments',
            data,
        )
    },

updateSegment(
        id: string,
        data: {
            name: string
            startKm: number
            endKm: number
            points: {
                order: number
                x: number
                y: number
            }[]
        },
    ) {
        return http.put<TrackSegment>(
            `/TrackScheme/segments/${id}`,
            data,
        )
    },

removeSegment(id: string) {
        return http.delete(
            `/TrackScheme/segments/${id}`,
        )
    },

    createSensor(data: {
        name: string
        serial: string
        x: number
        y: number
    }) {
        return http.post<TrackSensor>(
            '/TrackScheme/sensors',
            data,
        )
    },

    updateSensor: (
        id: string,
        data: {
            name: string
            serial: string
            trackSegmentId: string
            x: number
            y: number
        },
    ) =>
        http.put<TrackSensor>(
            `/trackscheme/sensors/${id}`,
            data,
        ),

    removeSensor: (id: string) =>
        http.delete(
            `/trackscheme/sensors/${id}`,
        ),
}