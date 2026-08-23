import { useEffect, useMemo, useState } from 'react'

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'

import AddRoadRoundedIcon from '@mui/icons-material/AddRoadRounded'
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DirectionsRailwayRoundedIcon from '@mui/icons-material/DirectionsRailwayRounded'
import PlaceRoundedIcon from '@mui/icons-material/Place'
import UndoRoundedIcon from '@mui/icons-material/UndoRounded'
import ClearRoundedIcon from '@mui/icons-material/ClearRounded'
import DoneRoundedIcon from '@mui/icons-material/DoneRounded'
import MouseIcon from '@mui/icons-material/Mouse'

import {
    defectsApi,
    locationsApi,
    trackSchemeApi,
} from '../api/services'

import type {
    Defect,
    Location,
    TrackSegment,
    TrackSensor,
} from '../api/types'

import { enumLabel, statusLabels } from '../api/labels'

import {
    TrackDiagram,
    type TrackPointInput,
    type DiagramMode,
} from '../Components/TrackDiagram'


export function TrackSchemePage() {
    /*
     * =========================================================
     * DATA
     * =========================================================
     */

    const [segments, setSegments] =
        useState<TrackSegment[]>([])

    const [sensors, setSensors] =
        useState<TrackSensor[]>([])

    const [defects, setDefects] =
        useState<Defect[]>([])

    const [locations, setLocations] =
        useState<Location[]>([])

    const [selected, setSelected] =
        useState<TrackSegment | null>(null)

    /*
     * =========================================================
     * UI
     * =========================================================
     */

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')

    /*
     * view
     * draw
     * sensor
     */
    const [diagramMode, setDiagramMode] =
        useState<DiagramMode>('view')

    /*
     * =========================================================
     * DRAWING
     * =========================================================
     */

    const [drawingPoints, setDrawingPoints] =
        useState<TrackPointInput[]>([])

    const [editingSegment, setEditingSegment] =
        useState<TrackSegment | null>(null)

    const [segmentDialogOpen, setSegmentDialogOpen] =
        useState(false)

    const [form, setForm] = useState({
        name: '',
        startKm: '',
        endKm: '',
    })

    /*
     * =========================================================
     * SENSOR
     * =========================================================
     */

    const [sensorDialogOpen, setSensorDialogOpen] =
        useState(false)

    const [sensorPoint, setSensorPoint] =
        useState<TrackPointInput | null>(null)

    const [sensorForm, setSensorForm] = useState({
        name: '',
        serial: '',
    })


    /*
     * =========================================================
     * LOAD
     * =========================================================
     */

    async function loadData() {
        try {
            setLoading(true)
            setError('')

            const [
                segmentsData,
                sensorsData,
                defectsData,
                locationsData,
            ] = await Promise.all([
                trackSchemeApi.getSegments(),
                trackSchemeApi.getSensors(),
                defectsApi.list(),
                locationsApi.list(),
            ])

            setSegments(segmentsData)
            setSensors(sensorsData)
            setDefects(defectsData)
            setLocations(locationsData)

            setSelected(current => {
                if (!current) {
                    return null
                }

                return (
                    segmentsData.find(
                        x => x.id === current.id,
                    ) ?? null
                )
            })
        } catch (err) {
            console.error(err)

            setError(
                'Не удалось загрузить схему путей.',
            )
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        void loadData()
    }, [])


    /*
     * =========================================================
     * SELECTED SEGMENT
     * =========================================================
     */

    const selectedLocations =
        useMemo(() => {
            if (!selected) {
                return []
            }

            return locations.filter(
                location =>
                    location.trackSegmentId ===
                    selected.id,
            )
        }, [
            locations,
            selected,
        ])


    const selectedLocationIds =
        useMemo(() => {
            return new Set(
                selectedLocations.map(
                    location => location.id,
                ),
            )
        }, [
            selectedLocations,
        ])


    const selectedDefects =
        useMemo(() => {
            return defects.filter(
                defect =>
                    selectedLocationIds.has(
                        defect.locationId,
                    ),
            )
        }, [
            defects,
            selectedLocationIds,
        ])


    const selectedSensors =
        useMemo(() => {
            if (!selected) {
                return []
            }

            return sensors.filter(
                sensor =>
                    sensor.trackSegmentId ===
                    selected.id,
            )
        }, [
            sensors,
            selected,
        ])


    /*
     * =========================================================
     * DRAWING
     * =========================================================
     */

    function startDrawing() {
        setSelected(null)

        setEditingSegment(null)

        setDrawingPoints([])

        setForm({
            name: '',
            startKm: '',
            endKm: '',
        })

        setDiagramMode('draw')

        setError('')
    }


    function addDrawingPoint(
        point: TrackPointInput,
    ) {
        setDrawingPoints(current => [
            ...current,
            point,
        ])
    }


    function undoPoint() {
        setDrawingPoints(current =>
            current.slice(0, -1),
        )
    }


    function cancelDrawing() {
        setDrawingPoints([])

        setEditingSegment(null)

        setDiagramMode('view')

        setError('')
    }


    function finishDrawing() {
        if (drawingPoints.length < 2) {
            setError(
                'Участок должен содержать минимум две точки.',
            )

            return
        }

        setError('')

        setSegmentDialogOpen(true)
    }


    /*
     * =========================================================
     * EDIT SEGMENT
     * =========================================================
     */

    function startEditSegment(
        segment: TrackSegment,
    ) {
        setEditingSegment(segment)

        const points: TrackPointInput[] =
            [...segment.points]
                .sort(
                    (a, b) =>
                        a.order - b.order,
                )
                .map(point => ({
                    x: point.x,
                    y: point.y,
                }))

        setDrawingPoints(points)

        setForm({
            name: segment.name,
            startKm:
                String(segment.startKm),
            endKm:
                String(segment.endKm),
        })

        setSelected(segment)

        setDiagramMode('draw')

        setError('')
    }


    /*
     * =========================================================
     * SAVE SEGMENT
     * =========================================================
     */

    async function saveSegment() {
        const name =
            form.name.trim()

        const startKm =
            Number(form.startKm)

        const endKm =
            Number(form.endKm)

        if (!name) {
            setError(
                'Введите название участка.',
            )

            return
        }

        if (
            !Number.isFinite(startKm) ||
            !Number.isFinite(endKm)
        ) {
            setError(
                'Введите корректный километраж.',
            )

            return
        }

        if (startKm > endKm) {
            setError(
                'Начальный километр не может быть больше конечного.',
            )

            return
        }

        if (drawingPoints.length < 2) {
            setError(
                'Участок должен содержать минимум две точки.',
            )

            return
        }

        const points =
            drawingPoints.map(
                (point, index) => ({
                    order: index,
                    x: point.x,
                    y: point.y,
                }),
            )

        try {
            setError('')

            /*
             * UPDATE
             */

            if (editingSegment) {
                const response =
                    await trackSchemeApi.updateSegment(
                        editingSegment.id,
                        {
                            name,
                            startKm,
                            endKm,
                            points,
                        },
                    )

                setSegments(current =>
                    current.map(segment =>
                        segment.id ===
                            editingSegment.id
                            ? response.data
                            : segment,
                    ),
                )

                setSelected(response.data)
            }

            /*
             * CREATE
             */

            else {
                const response =
                    await trackSchemeApi.createSegment({
                        name,
                        startKm,
                        endKm,
                        points,
                    })

                setSegments(current => [
                    ...current,
                    response.data,
                ])

                setSelected(response.data)
            }

            setDrawingPoints([])

            setEditingSegment(null)

            setSegmentDialogOpen(false)

            setDiagramMode('view')

            setForm({
                name: '',
                startKm: '',
                endKm: '',
            })
        } catch (err) {
            console.error(err)

            setError(
                editingSegment
                    ? 'Не удалось изменить участок.'
                    : 'Не удалось создать участок.',
            )
        }
    }


    /*
     * =========================================================
     * DELETE SEGMENT
     * =========================================================
     */

    async function deleteSegment(
        segment: TrackSegment,
    ) {
        const confirmed =
            window.confirm(
                `Удалить участок "${segment.name}"?`,
            )

        if (!confirmed) {
            return
        }

        try {
            setError('')

            await trackSchemeApi.removeSegment(
                segment.id,
            )

            setSegments(current =>
                current.filter(
                    x =>
                        x.id !== segment.id,
                ),
            )

            if (
                selected?.id ===
                segment.id
            ) {
                setSelected(null)
            }
        } catch (err) {
            console.error(err)

            setError(
                'Не удалось удалить участок. Возможно, к нему привязаны локации, датчики или дефекты.',
            )
        }
    }


    /*
     * =========================================================
     * SENSOR MODE
     * =========================================================
     */

    function startSensorMode() {
        setDiagramMode('sensor')

        setSensorPoint(null)

        setSensorForm({
            name: '',
            serial: '',
        })

        setError('')
    }


    function handleSensorPosition(
        point: TrackPointInput,
    ) {
        setSensorPoint(point)

        setSensorDialogOpen(true)

        setError('')
    }


    async function saveSensor() {
        if (!sensorPoint) {
            setError(
                'Не выбрана позиция датчика.',
            )

            return
        }

        const name =
            sensorForm.name.trim()

        const serial =
            sensorForm.serial.trim()

        if (!name) {
            setError(
                'Введите название датчика.',
            )

            return
        }

        if (!serial) {
            setError(
                'Введите серийный номер датчика.',
            )

            return
        }

        try {
            setError('')

            /*
             * ВАЖНО:
             *
             * trackSegmentId здесь специально
             * не передаём.
             *
             * Backend должен определить
             * участок по X/Y.
             */

            await trackSchemeApi.createSensor({
                name,
                serial,
                x: sensorPoint.x,
                y: sensorPoint.y,
            })

            setSensorDialogOpen(false)

            setSensorPoint(null)

            setSensorForm({
                name: '',
                serial: '',
            })

            setDiagramMode('view')

            await loadData()
        } catch (err) {
            console.error(err)

            setError(
                'Не удалось добавить датчик.',
            )
        }
    }


    function cancelSensor() {
        setSensorDialogOpen(false)

        setSensorPoint(null)

        setSensorForm({
            name: '',
            serial: '',
        })

        setDiagramMode('view')
    }


    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (
        <Stack spacing={2.5}>

            {/* HEADER */}

            <Stack
                direction={{
                    xs: 'column',
                    md: 'row',
                }}
                justifyContent="space-between"
                alignItems={{
                    xs: 'flex-start',
                    md: 'center',
                }}
                gap={2}
            >
                <Box>
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >
                        <DirectionsRailwayRoundedIcon
                            color="primary"
                            sx={{
                                fontSize: 36,
                            }}
                        />

                        <Typography variant="h4">
                            Диспетчерская схема
                        </Typography>
                    </Stack>

                    <Typography
                        color="text.secondary"
                        sx={{ mt: 0.7 }}
                    >
                        Схема железнодорожных
                        путей, датчиков,
                        локаций и дефектов
                    </Typography>
                </Box>
            </Stack>


            {/* ERROR */}

            {error && (
                <Alert
                    severity="error"
                    onClose={() =>
                        setError('')
                    }
                >
                    {error}
                </Alert>
            )}


            {/* TOOLBAR */}

            <Card>
                <CardContent>
                    <Stack
                        direction={{
                            xs: 'column',
                            md: 'row',
                        }}
                        spacing={1}
                        justifyContent="space-between"
                        alignItems={{
                            xs: 'stretch',
                            md: 'center',
                        }}
                    >

                        <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                        >
                            <Button
                                variant={
                                    diagramMode ===
                                        'view'
                                        ? 'contained'
                                        : 'outlined'
                                }
                                onClick={() =>
                                    setDiagramMode(
                                        'view',
                                    )
                                }
                            >
                                Просмотр
                            </Button>

                            <Button
                                variant={
                                    diagramMode ===
                                        'draw'
                                        ? 'contained'
                                        : 'outlined'
                                }
                                startIcon={
                                    <AddRoadRoundedIcon />
                                }
                                onClick={
                                    startDrawing
                                }
                            >
                                Нарисовать путь
                            </Button>

                            <Button
                                variant={
                                    diagramMode ===
                                        'sensor'
                                        ? 'contained'
                                        : 'outlined'
                                }
                                startIcon={
                                    <SensorsRoundedIcon />
                                }
                                onClick={
                                    startSensorMode
                                }
                            >
                                Добавить датчик
                            </Button>
                        </Stack>


                        {/* DRAW CONTROLS */}

                        {diagramMode ===
                            'draw' && (
                                <Stack
                                    direction="row"
                                    spacing={1}
                                >
                                    <Button
                                        size="small"
                                        startIcon={
                                            <UndoRoundedIcon />
                                        }
                                        disabled={
                                            drawingPoints.length ===
                                            0
                                        }
                                        onClick={
                                            undoPoint
                                        }
                                    >
                                        Назад
                                    </Button>

                                    <Button
                                        size="small"
                                        color="error"
                                        startIcon={
                                            <ClearRoundedIcon />
                                        }
                                        onClick={
                                            cancelDrawing
                                        }
                                    >
                                        Отмена
                                    </Button>

                                    <Button
                                        size="small"
                                        variant="contained"
                                        startIcon={
                                            <DoneRoundedIcon />
                                        }
                                        disabled={
                                            drawingPoints.length <
                                            2
                                        }
                                        onClick={
                                            finishDrawing
                                        }
                                    >
                                        Завершить
                                    </Button>
                                </Stack>
                            )}
                    </Stack>


                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 1.5,
                        }}
                    >
                        {diagramMode ===
                            'draw'
                            ? 'Кликайте по схеме, чтобы построить путь. Точки автоматически привязываются к сетке и существующему пути.'
                            : diagramMode ===
                                'sensor'
                                ? 'Кликните непосредственно по линии пути, чтобы установить датчик.'
                                : 'Выберите участок или датчик для просмотра информации.'}
                    </Typography>
                </CardContent>
            </Card>


            {/* STATISTICS */}

            <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
            >
                <Chip
                    icon={
                        <DirectionsRailwayRoundedIcon />
                    }
                    label={`Участков: ${segments.length}`}
                />

                <Chip
                    icon={
                        <SensorsRoundedIcon />
                    }
                    label={`Датчиков: ${sensors.length}`}
                />

                <Chip
                    icon={
                        <WarningAmberRoundedIcon />
                    }
                    label={`Дефектов: ${defects.length}`}
                />

                {selected && (
                    <Chip
                        color="primary"
                        label={`Выбран: ${selected.name}`}
                    />
                )}
            </Stack>


            {/* DIAGRAM */}

            <Card>
                <CardContent sx={{ p: 1 }}>
                    {loading ? (
                        <Box
                            sx={{
                                height: 680,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography color="text.secondary">
                                Загрузка схемы...
                            </Typography>
                        </Box>
                    ) : (
                        <TrackDiagram
                            segments={segments}
                            sensors={sensors}
                            selectedId={
                                selected?.id
                            }
                            mode={diagramMode}
                            points={drawingPoints}
                            onSegmentClick={
                                setSelected
                            }
                            onPointAdd={
                                addDrawingPoint
                            }
                            onSensorPosition={
                                handleSensorPosition
                            }
                            onSensorClick={
                                sensor => {
                                    const segment =
                                        segments.find(
                                            x =>
                                                x.id ===
                                                sensor.trackSegmentId,
                                        )

                                    if (segment) {
                                        setSelected(
                                            segment,
                                        )
                                    }
                                }
                            }
                        />
                    )}
                </CardContent>
            </Card>


            {/* CONTENT */}

            <Stack
                direction={{
                    xs: 'column',
                    lg: 'row',
                }}
                spacing={2}
            >

                {/* SEGMENTS */}

                <Card
                    sx={{
                        flex: 1,
                    }}
                >
                    <CardContent>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography variant="h6">
                                Участки пути
                            </Typography>

                            <Chip
                                size="small"
                                label={segments.length}
                            />
                        </Stack>

                        <Stack
                            divider={
                                <Divider />
                            }
                            sx={{ mt: 1 }}
                        >
                            {segments.map(
                                segment => {
                                    const segmentSensors =
                                        sensors.filter(
                                            sensor =>
                                                sensor.trackSegmentId ===
                                                segment.id,
                                        )

                                    return (
                                        <Box
                                            key={
                                                segment.id
                                            }
                                            sx={{
                                                py: 1.5,
                                                px: 1,
                                                cursor:
                                                    'pointer',
                                                borderRadius: 1,
                                                '&:hover':
                                                {
                                                    bgcolor:
                                                        'rgba(91,141,239,.08)',
                                                },
                                            }}
                                            onClick={() =>
                                                setSelected(
                                                    segment,
                                                )
                                            }
                                        >
                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="center"
                                                gap={2}
                                            >
                                                <Box>
                                                    <Typography
                                                        fontWeight={
                                                            700
                                                        }
                                                    >
                                                        {
                                                            segment.name
                                                        }
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        км{' '}
                                                        {
                                                            segment.startKm
                                                        }
                                                        {' — '}
                                                        {
                                                            segment.endKm
                                                        }
                                                    </Typography>

                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        sx={{
                                                            mt: 1,
                                                        }}
                                                    >
                                                        <Chip
                                                            size="small"
                                                            icon={
                                                                <SensorsRoundedIcon />
                                                            }
                                                            label={
                                                                segmentSensors.length
                                                            }
                                                        />

                                                        <Chip
                                                            size="small"
                                                            label={`${segment.points.length} точек`}
                                                        />
                                                    </Stack>
                                                </Box>

                                                <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                >
                                                    <Tooltip title="Изменить">
                                                        <IconButton
                                                            size="small"
                                                            onClick={event => {
                                                                event.stopPropagation()

                                                                startEditSegment(
                                                                    segment,
                                                                )
                                                            }}
                                                        >
                                                            <EditRoundedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Удалить">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={event => {
                                                                event.stopPropagation()

                                                                void deleteSegment(
                                                                    segment,
                                                                )
                                                            }}
                                                        >
                                                            <DeleteRoundedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </Stack>
                                        </Box>
                                    )
                                },
                            )}

                            {!segments.length && (
                                <Box
                                    sx={{
                                        py: 5,
                                        textAlign:
                                            'center',
                                    }}
                                >
                                    <DirectionsRailwayRoundedIcon
                                        sx={{
                                            fontSize: 42,
                                            color:
                                                'text.secondary',
                                        }}
                                    />

                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            mt: 1,
                                        }}
                                    >
                                        Участки ещё
                                        не добавлены.
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </CardContent>
                </Card>


                {/* SELECTED */}

                <Card
                    sx={{
                        flex: 1,
                    }}
                >
                    <CardContent>
                        <Typography variant="h6">
                            Информация об участке
                        </Typography>

                        {!selected ? (
                            <Box
                                sx={{
                                    mt: 5,
                                    textAlign:
                                        'center',
                                }}
                            >
                                <PlaceRoundedIcon
                                    sx={{
                                        fontSize: 48,
                                        color:
                                            'text.secondary',
                                    }}
                                />

                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        mt: 1,
                                    }}
                                >
                                    Выберите участок
                                    на схеме
                                </Typography>
                            </Box>
                        ) : (
                            <Stack
                                spacing={2}
                                sx={{
                                    mt: 2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="h5"
                                        fontWeight={800}
                                    >
                                        {
                                            selected.name
                                        }
                                    </Typography>

                                    <Typography color="text.secondary">
                                        км{' '}
                                        {
                                            selected.startKm
                                        }
                                        {' — '}
                                        {
                                            selected.endKm
                                        }
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mt: 0.5,
                                        }}
                                    >
                                        Точек схемы:{' '}
                                        {
                                            selected.points
                                                .length
                                        }
                                    </Typography>
                                </Box>


                                <Stack
                                    direction="row"
                                    spacing={1}
                                    flexWrap="wrap"
                                    useFlexGap
                                >
                                    <Chip
                                        icon={
                                            <SensorsRoundedIcon />
                                        }
                                        label={`Датчиков: ${selectedSensors.length}`}
                                    />

                                    <Chip
                                        icon={
                                            <WarningAmberRoundedIcon />
                                        }
                                        label={`Дефектов: ${selectedDefects.length}`}
                                    />

                                    <Chip
                                        label={`Локаций: ${selectedLocations.length}`}
                                    />
                                </Stack>


                                <Divider />


                                {/* SENSORS */}

                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight={700}
                                    >
                                        Датчики
                                    </Typography>

                                    <Stack
                                        spacing={1}
                                        sx={{
                                            mt: 1,
                                        }}
                                    >
                                        {selectedSensors.map(
                                            sensor => (
                                                <Card
                                                    key={
                                                        sensor.id
                                                    }
                                                    variant="outlined"
                                                >
                                                    <CardContent>
                                                        <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            alignItems="center"
                                                        >
                                                            <SensorsRoundedIcon
                                                                color="warning"
                                                            />

                                                            <Box>
                                                                <Typography fontWeight={700}>
                                                                    {
                                                                        sensor.name
                                                                    }
                                                                </Typography>

                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                >
                                                                    Серийный
                                                                    номер:{' '}
                                                                    {
                                                                        sensor.serial
                                                                    }
                                                                </Typography>

                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                >
                                                                    X:{' '}
                                                                    {Math.round(
                                                                        sensor.x,
                                                                    )}
                                                                    {' '}
                                                                    Y:{' '}
                                                                    {Math.round(
                                                                        sensor.y,
                                                                    )}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                            ),
                                        )}

                                        {!selectedSensors.length && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                На участке
                                                нет датчиков.
                                            </Typography>
                                        )}
                                    </Stack>
                                </Box>


                                <Divider />


                                {/* LOCATIONS */}

                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight={700}
                                    >
                                        Локации
                                    </Typography>

                                    <Stack
                                        spacing={1}
                                        sx={{
                                            mt: 1,
                                        }}
                                    >
                                        {selectedLocations.map(
                                            location => (
                                                <Card
                                                    key={
                                                        location.id
                                                    }
                                                    variant="outlined"
                                                >
                                                    <CardContent>
                                                        <Typography fontWeight={700}>
                                                            {
                                                                location.railwaySection
                                                            }
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            {
                                                                location.subDivision
                                                            }
                                                            {' · '}
                                                            км{' '}
                                                            {
                                                                location.kilometer
                                                            }
                                                            {' · '}
                                                            пикет{' '}
                                                            {
                                                                location.picket
                                                            }
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            ),
                                        )}

                                        {!selectedLocations.length && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Локаций на
                                                участке нет.
                                            </Typography>
                                        )}
                                    </Stack>
                                </Box>


                                <Divider />


                                {/* DEFECTS */}

                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight={700}
                                    >
                                        Дефекты
                                    </Typography>

                                    <Stack
                                        spacing={1}
                                        sx={{
                                            mt: 1,
                                        }}
                                    >
                                        {selectedDefects.map(
                                            defect => (
                                                <Card
                                                    key={
                                                        defect.id
                                                    }
                                                    variant="outlined"
                                                >
                                                    <CardContent>
                                                        <Stack
                                                            direction="row"
                                                            justifyContent="space-between"
                                                            alignItems="center"
                                                            gap={2}
                                                        >
                                                            <Box>
                                                                <Typography fontWeight={700}>
                                                                    DEF-
                                                                    {defect.id.slice(
                                                                        0,
                                                                        8,
                                                                    )}
                                                                </Typography>

                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                >
                                                                    {
                                                                        defect.description ||
                                                                        'Описание отсутствует'
                                                                    }
                                                                </Typography>
                                                            </Box>

                                                            <Chip
                                                                size="small"
                                                                label={enumLabel(
                                                                    statusLabels,
                                                                    defect.status,
                                                                )}
                                                            />
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                            ),
                                        )}

                                        {!selectedDefects.length && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Дефектов на
                                                участке нет.
                                            </Typography>
                                        )}
                                    </Stack>
                                </Box>
                            </Stack>
                        )}
                    </CardContent>
                </Card>
            </Stack>


            {/* =====================================================
          SEGMENT DIALOG
         ===================================================== */}

            <Dialog
                open={
                    segmentDialogOpen
                }
                onClose={() =>
                    setSegmentDialogOpen(
                        false,
                    )
                }
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {editingSegment
                        ? 'Редактирование участка'
                        : 'Новый участок пути'}
                </DialogTitle>

                <DialogContent>
                    <Stack
                        spacing={2}
                        sx={{
                            mt: 1,
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Название участка"
                            value={
                                form.name
                            }
                            onChange={event =>
                                setForm({
                                    ...form,
                                    name:
                                        event.target
                                            .value,
                                })
                            }
                        />

                        <Stack
                            direction={{
                                xs: 'column',
                                sm: 'row',
                            }}
                            spacing={2}
                        >
                            <TextField
                                fullWidth
                                label="Начало, км"
                                type="number"
                                value={
                                    form.startKm
                                }
                                onChange={event =>
                                    setForm({
                                        ...form,
                                        startKm:
                                            event.target
                                                .value,
                                    })
                                }
                            />

                            <TextField
                                fullWidth
                                label="Конец, км"
                                type="number"
                                value={
                                    form.endKm
                                }
                                onChange={event =>
                                    setForm({
                                        ...form,
                                        endKm:
                                            event.target
                                                .value,
                                    })
                                }
                            />
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={1}
                        >
                            <Chip
                                color="primary"
                                label={`Точек: ${drawingPoints.length}`}
                            />

                            <Chip
                                label={
                                    editingSegment
                                        ? 'Редактирование'
                                        : 'Новый участок'
                                }
                            />
                        </Stack>

                        <Alert severity="info">
                            Геометрия участка
                            определяется
                            точками, которые
                            вы поставили
                            мышкой на схеме.
                        </Alert>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setSegmentDialogOpen(
                                false,
                            )
                        }
                    >
                        Отмена
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() =>
                            void saveSegment()
                        }
                    >
                        {editingSegment
                            ? 'Сохранить'
                            : 'Создать'}
                    </Button>
                </DialogActions>
            </Dialog>


            {/* =====================================================
          SENSOR DIALOG
         ===================================================== */}

            <Dialog
                open={
                    sensorDialogOpen
                }
                onClose={
                    cancelSensor
                }
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Добавление датчика
                </DialogTitle>

                <DialogContent>
                    <Stack
                        spacing={2}
                        sx={{
                            mt: 1,
                        }}
                    >
                        <Alert severity="info">
                            Кликните по линии
                            железнодорожного
                            пути. Датчик будет
                            установлен именно
                            в этой точке.
                        </Alert>

                        <TextField
                            fullWidth
                            label="Название датчика"
                            placeholder="Датчик А-01"
                            value={
                                sensorForm.name
                            }
                            onChange={event =>
                                setSensorForm({
                                    ...sensorForm,
                                    name:
                                        event.target
                                            .value,
                                })
                            }
                        />

                        <TextField
                            fullWidth
                            label="Серийный номер"
                            placeholder="S-A01"
                            value={
                                sensorForm.serial
                            }
                            onChange={event =>
                                setSensorForm({
                                    ...sensorForm,
                                    serial:
                                        event.target
                                            .value,
                                })
                            }
                        />

                        {sensorPoint && (
                            <Stack
                                direction="row"
                                spacing={1}
                            >
                                <Chip
                                    label={`X: ${Math.round(
                                        sensorPoint.x,
                                    )}`}
                                />

                                <Chip
                                    label={`Y: ${Math.round(
                                        sensorPoint.y,
                                    )}`}
                                />
                            </Stack>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={
                            cancelSensor
                        }
                    >
                        Отмена
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={
                            <SensorsRoundedIcon />
                        }
                        onClick={() =>
                            void saveSensor()
                        }
                    >
                        Сохранить датчик
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    )
}