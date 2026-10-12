import type {
    Defect,
    Location,
    TrackSegment,
    TrackSensor,
} from '../api/types'
export interface TrackSegmentReport {
    segment: TrackSegment
    periodStart: string
    periodEnd: string
    generatedAt: string
    defects: Defect[]
    sensors: TrackSensor[]
    locations: Location[]
    totalDefects: number
    openDefects: number
    criticalDefects: number
    repairedDefects: number
}
interface BuildReportParams {
    segment: TrackSegment
    periodStart: string
    periodEnd: string
    defects: Defect[]
    sensors: TrackSensor[]
    locations: Location[]
}
export const reportService = {
    buildTrackSegmentReport({
        segment,
        periodStart,
        periodEnd,
        defects,
        sensors,
        locations,
    }: BuildReportParams): TrackSegmentReport {
        const start = new Date(`${periodStart}T00:00:00`)
        const end = new Date(`${periodEnd}T23:59:59.999`)
        const segmentLocations = locations.filter(
            location => location.trackSegmentId === segment.id,
        )

        const locationIds = new Set(
            segmentLocations.map(location => location.id),
        )

        const segmentDefects = defects.filter(defect => {
            if (!locationIds.has(defect.locationId)) {
                return false
            }

            const detectedAt = new Date(defect.detectedAt)

            return (
                !Number.isNaN(detectedAt.getTime()) &&
                detectedAt >= start &&
                detectedAt <= end
            )
        })

        const segmentSensors = sensors.filter(
            sensor => sensor.trackSegmentId === segment.id,
        )

        // Значения status зависят от enum проекта.
        // Здесь 2 считается завершенным статусом ремонта.
        const repairedDefects = segmentDefects.filter(
            defect => defect.status === 2,
        ).length

        return {
            segment,
            periodStart,
            periodEnd,
            generatedAt: new Date().toISOString(),
            defects: segmentDefects,
            sensors: segmentSensors,
            locations: segmentLocations,
            totalDefects: segmentDefects.length,
            openDefects: segmentDefects.length - repairedDefects,
            criticalDefects: segmentDefects.filter(
                defect => defect.saverity >= 4,
            ).length,
            repairedDefects,
        }
    },
}