import {
    useEffect,
    useRef,
    useState,
} from 'react'

import {
    Box,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import CenterFocusStrongRoundedIcon from '@mui/icons-material/CenterFocusStrongRounded'

import type {
    TrackSegment,
    TrackSensor,
} from '../api/types'

export type TrackPointInput = {
    x: number
    y: number
}

export type DiagramMode =
    | 'view'
    | 'draw'
    | 'sensor'

interface TrackDiagramProps {
    segments: TrackSegment[]
    sensors: TrackSensor[]

    selectedId?: string

    mode: DiagramMode

    points: TrackPointInput[]

    onSegmentClick: (
        segment: TrackSegment
    ) => void

    onPointAdd: (
        point: TrackPointInput
    ) => void

    onSensorPosition: (
        point: TrackPointInput
    ) => void

    onSensorClick?: (
        sensor: TrackSensor
    ) => void
}

const WIDTH = 1400
const HEIGHT = 750

const GRID = 20

const MIN_ZOOM = 0.5
const MAX_ZOOM = 3

const SNAP_DISTANCE = 18

function snapToGrid(value: number) {
    return Math.round(value / GRID) * GRID
}

function distance(
    a: TrackPointInput,
    b: TrackPointInput
) {
    return Math.sqrt(
        Math.pow(a.x - b.x, 2) +
        Math.pow(a.y - b.y, 2)
    )
}

function getNearestExistingPoint(
    point: TrackPointInput,
    segments: TrackSegment[]
): TrackPointInput | null {
    let nearest: TrackPointInput | null = null
    let nearestDistance = SNAP_DISTANCE

    for (const segment of segments) {
        for (const p of segment.points) {
            const candidate = {
                x: p.x,
                y: p.y,
            }

            const d = distance(
                point,
                candidate
            )

            if (d < nearestDistance) {
                nearestDistance = d
                nearest = candidate
            }
        }
    }

    return nearest
}

function getPointOnLine(
    point: TrackPointInput,
    x1: number,
    y1: number,
    x2: number,
    y2: number
): TrackPointInput {
    const dx = x2 - x1
    const dy = y2 - y1

    if (dx === 0 && dy === 0) {
        return {
            x: x1,
            y: y1,
        }
    }

    let t =
        ((point.x - x1) * dx +
            (point.y - y1) * dy) /
        (dx * dx + dy * dy)

    t = Math.max(
        0,
        Math.min(1, t)
    )

    return {
        x: x1 + t * dx,
        y: y1 + t * dy,
    }
}

function getNearestPointOnTrack(
    point: TrackPointInput,
    segments: TrackSegment[]
): TrackPointInput | null {
    let nearest: TrackPointInput | null = null
    let nearestDistance = SNAP_DISTANCE

    for (const segment of segments) {
        const points = [...segment.points]
            .sort((a, b) => a.order - b.order)

        for (
            let i = 0;
            i < points.length - 1;
            i++
        ) {
            const p1 = points[i]
            const p2 = points[i + 1]

            const projected = getPointOnLine(
                point,
                p1.x,
                p1.y,
                p2.x,
                p2.y
            )

            const d = distance(
                point,
                projected
            )

            if (d < nearestDistance) {
                nearestDistance = d
                nearest = projected
            }
        }
    }

    return nearest
}

export function TrackDiagram({
    segments,
    sensors,
    selectedId,
    mode,
    points,
    onSegmentClick,
    onPointAdd,
    onSensorPosition,
    onSensorClick,
}: TrackDiagramProps) {
    const svgRef =
        useRef<SVGSVGElement | null>(null)

    const [zoom, setZoom] = useState(1)

    const [pan, setPan] = useState({
        x: 0,
        y: 0,
    })

    const [mousePosition, setMousePosition] =
        useState<TrackPointInput | null>(null)

    const [dragging, setDragging] =
        useState(false)

    const [dragStart, setDragStart] =
        useState({
            x: 0,
            y: 0,
        })

    const [panStart, setPanStart] =
        useState({
            x: 0,
            y: 0,
        })

    /*
     * ---------------------------------------------------------
     * SVG coordinates
     * ---------------------------------------------------------
     */

    function getSvgPoint(
        event: React.MouseEvent
    ): TrackPointInput | null {
        if (!svgRef.current) {
            return null
        }

        const rect =
            svgRef.current.getBoundingClientRect()

        const x =
            (event.clientX - rect.left) /
            rect.width *
            WIDTH

        const y =
            (event.clientY - rect.top) /
            rect.height *
            HEIGHT

        return {
            x,
            y,
        }
    }

    /*
     * ---------------------------------------------------------
     * MOUSE
     * ---------------------------------------------------------
     */

    function handleMouseMove(
        event: React.MouseEvent
    ) {
        const point =
            getSvgPoint(event)

        if (!point) {
            return
        }

        setMousePosition(point)

        if (!dragging) {
            return
        }

        const dx =
            event.clientX -
            dragStart.x

        const dy =
            event.clientY -
            dragStart.y

        setPan({
            x: panStart.x + dx,
            y: panStart.y + dy,
        })
    }

    function handleMouseDown(
        event: React.MouseEvent
    ) {
        /*
         * Space + drag = pan
         */
        if (
            event.button === 1 ||
            event.shiftKey
        ) {
            event.preventDefault()

            setDragging(true)

            setDragStart({
                x: event.clientX,
                y: event.clientY,
            })

            setPanStart(pan)

            return
        }
    }

    function handleMouseUp() {
        setDragging(false)
    }

    /*
     * ---------------------------------------------------------
     * CLICK
     * ---------------------------------------------------------
     */

    function handleDiagramClick(
        event: React.MouseEvent
    ) {
        if (
            dragging ||
            mode === 'view'
        ) {
            return
        }

        const raw =
            getSvgPoint(event)

        if (!raw) {
            return
        }

        /*
         * Сначала пробуем snap
         * к существующему пути.
         */
        const snappedToTrack =
            getNearestPointOnTrack(
                raw,
                segments
            )

        /*
         * Затем snap к существующей
         * вершине.
         */
        const snappedToPoint =
            getNearestExistingPoint(
                raw,
                segments
            )

        const point =
            snappedToPoint ??
            snappedToTrack ?? {
                x: snapToGrid(raw.x),
                y: snapToGrid(raw.y),
            }

        if (mode === 'draw') {
            onPointAdd(point)
            return
        }

        if (mode === 'sensor') {
            onSensorPosition(point)
        }
    }

    /*
     * ---------------------------------------------------------
     * ZOOM
     * ---------------------------------------------------------
     */

    function zoomIn() {
        setZoom(value =>
            Math.min(
                MAX_ZOOM,
                value + 0.1
            )
        )
    }

    function zoomOut() {
        setZoom(value =>
            Math.max(
                MIN_ZOOM,
                value - 0.1
            )
        )
    }

    function resetView() {
        setZoom(1)

        setPan({
            x: 0,
            y: 0,
        })
    }

    /*
     * ---------------------------------------------------------
     * WHEEL ZOOM
     * ---------------------------------------------------------
     */

    function handleWheel(
        event: React.WheelEvent
    ) {
        event.preventDefault()

        if (event.deltaY < 0) {
            zoomIn()
        } else {
            zoomOut()
        }
    }

    /*
     * ---------------------------------------------------------
     * DRAWING PATH
     * ---------------------------------------------------------
     */

    const drawingPath =
        points
            .map(
                point =>
                    `${point.x},${point.y}`
            )
            .join(' ')

    /*
     * Preview line.
     */

    const previewPath =
        mousePosition &&
            points.length > 0
            ? `${drawingPath} ${mousePosition.x},${mousePosition.y}`
            : drawingPath

    /*
     * ---------------------------------------------------------
     * GRID
     * ---------------------------------------------------------
     */

    const gridLines = []

    for (
        let x = 0;
        x <= WIDTH;
        x += GRID
    ) {
        gridLines.push(
            <line
                key={`x-${x}`}
                x1={x}
                y1={0}
                x2={x}
                y2={HEIGHT}
                stroke="rgba(148,163,184,.07)"
                strokeWidth={1}
            />
        )
    }

    for (
        let y = 0;
        y <= HEIGHT;
        y += GRID
    ) {
        gridLines.push(
            <line
                key={`y-${y}`}
                x1={0}
                y1={y}
                x2={WIDTH}
                y2={y}
                stroke="rgba(148,163,184,.07)"
                strokeWidth={1}
            />
        )
    }

    /*
     * ---------------------------------------------------------
     * RENDER
     * ---------------------------------------------------------
     */

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                height: 680,
                overflow: 'hidden',
                bgcolor: '#06101c',
                borderRadius: 2,
                userSelect: 'none',
            }}
        >
            {/* TOOLBAR */}

            <Stack
                direction="row"
                spacing={0.5}
                sx={{
                    position: 'absolute',
                    zIndex: 10,
                    top: 12,
                    right: 12,
                    bgcolor:
                        'rgba(10,20,35,.9)',
                    borderRadius: 2,
                    p: 0.5,
                }}
            >
                <Tooltip title="Увеличить">
                    <IconButton
                        size="small"
                        onClick={zoomIn}
                        sx={{
                            color: 'white',
                        }}
                    >
                        <AddRoundedIcon />
                    </IconButton>
                </Tooltip>

                <Box
                    sx={{
                        minWidth: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography
                        variant="caption"
                        color="white"
                    >
                        {Math.round(
                            zoom * 100
                        )}
                        %
                    </Typography>
                </Box>

                <Tooltip title="Уменьшить">
                    <IconButton
                        size="small"
                        onClick={zoomOut}
                        sx={{
                            color: 'white',
                        }}
                    >
                        <RemoveRoundedIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Сбросить масштаб">
                    <IconButton
                        size="small"
                        onClick={resetView}
                        sx={{
                            color: 'white',
                        }}
                    >
                        <CenterFocusStrongRoundedIcon />
                    </IconButton>
                </Tooltip>
            </Stack>

            {/* MODE */}

            <Box
                sx={{
                    position: 'absolute',
                    zIndex: 10,
                    top: 12,
                    left: 12,
                    px: 1.5,
                    py: 0.8,
                    borderRadius: 2,
                    bgcolor:
                        'rgba(10,20,35,.9)',
                }}
            >
                <Typography
                    variant="caption"
                    color="white"
                >
                    {mode === 'draw'
                        ? '✏️ Рисование пути'
                        : mode === 'sensor'
                            ? '📡 Установка датчика'
                            : '👆 Просмотр'}
                </Typography>
            </Box>

            {/* COORDINATES */}

            {mousePosition && (
                <Box
                    sx={{
                        position: 'absolute',
                        zIndex: 10,
                        bottom: 12,
                        left: 12,
                        px: 1.2,
                        py: 0.6,
                        borderRadius: 1.5,
                        bgcolor:
                            'rgba(10,20,35,.85)',
                    }}
                >
                    <Typography
                        variant="caption"
                        color="white"
                    >
                        X: {Math.round(mousePosition.x)}
                        {'  '}
                        Y: {Math.round(mousePosition.y)}
                    </Typography>
                </Box>
            )}

            <svg
                ref={svgRef}
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                width="100%"
                height="100%"
                onClick={handleDiagramClick}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{
                    cursor:
                        mode === 'draw' ||
                            mode === 'sensor'
                            ? 'crosshair'
                            : dragging
                                ? 'grabbing'
                                : 'grab',
                }}
            >
                <g
                    transform={`
            translate(${pan.x} ${pan.y})
            translate(
              ${(WIDTH * (1 - zoom)) / 2}
              ${(HEIGHT * (1 - zoom)) / 2}
            )
            scale(${zoom})
          `}
                >
                    {/* BACKGROUND */}

                    <rect
                        x={0}
                        y={0}
                        width={WIDTH}
                        height={HEIGHT}
                        fill="#06101c"
                    />

                    {/* GRID */}

                    {gridLines}

                    {/* TRACKS */}

                    {segments.map(segment => {
                        const points =
                            [...segment.points]
                                .sort(
                                    (a, b) =>
                                        a.order - b.order
                                )
                                .map(
                                    point =>
                                        `${point.x},${point.y}`
                                )
                                .join(' ')

                        const selected =
                            selectedId ===
                            segment.id

                        return (
                            <g
                                key={segment.id}
                                onClick={event => {
                                    event.stopPropagation()

                                    if (mode === 'view') {
                                        onSegmentClick(
                                            segment
                                        )
                                    }
                                }}
                            >
                                {/* TRACK BED */}

                                <polyline
                                    points={points}
                                    fill="none"
                                    stroke="rgba(0,0,0,.6)"
                                    strokeWidth={22}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {/* RAIL 1 */}

                                <polyline
                                    points={points}
                                    fill="none"
                                    stroke={
                                        selected
                                            ? '#60a5fa'
                                            : '#e2e8f0'
                                    }
                                    strokeWidth={5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {/* RAIL 2 */}

                                <polyline
                                    points={points}
                                    fill="none"
                                    stroke={
                                        selected
                                            ? '#2563eb'
                                            : '#64748b'
                                    }
                                    strokeWidth={2}
                                    strokeDasharray="8 8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    transform="translate(0 8)"
                                />

                                {/* START */}

                                {segment.points[0] && (
                                    <circle
                                        cx={
                                            segment.points[0].x
                                        }
                                        cy={
                                            segment.points[0].y
                                        }
                                        r={6}
                                        fill="#14b8a6"
                                    />
                                )}

                                {/* END */}

                                {segment.points[
                                    segment.points.length - 1
                                ] && (
                                        <circle
                                            cx={
                                                segment.points[
                                                    segment.points.length - 1
                                                ].x
                                            }
                                            cy={
                                                segment.points[
                                                    segment.points.length - 1
                                                ].y
                                            }
                                            r={6}
                                            fill="#14b8a6"
                                        />
                                    )}

                                {/* NAME */}

                                {segment.points[
                                    Math.floor(
                                        segment.points.length / 2
                                    )
                                ] && (
                                        <text
                                            x={
                                                segment.points[
                                                    Math.floor(
                                                        segment.points.length / 2
                                                    )
                                                ].x
                                            }
                                            y={
                                                segment.points[
                                                    Math.floor(
                                                        segment.points.length / 2
                                                    )
                                                ].y - 20
                                            }
                                            fill="#dbeafe"
                                            fontSize="15"
                                            fontWeight="700"
                                            textAnchor="middle"
                                            pointerEvents="none"
                                        >
                                            {segment.name}
                                        </text>
                                    )}
                            </g>
                        )
                    })}

                    {/* DRAWING */}

                    {mode === 'draw' &&
                        points.length > 0 && (
                            <>
                                <polyline
                                    points={previewPath}
                                    fill="none"
                                    stroke="#38bdf8"
                                    strokeWidth={5}
                                    strokeDasharray="10 7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    pointerEvents="none"
                                />

                                {points.map(
                                    (point, index) => (
                                        <circle
                                            key={index}
                                            cx={point.x}
                                            cy={point.y}
                                            r={7}
                                            fill="#38bdf8"
                                            stroke="#fff"
                                            strokeWidth={2}
                                            pointerEvents="none"
                                        />
                                    )
                                )}
                            </>
                        )}

                    {/* SENSORS */}

                    {sensors.map(sensor => (
                        <g
                            key={sensor.id}
                            onClick={event => {
                                event.stopPropagation()

                                if (
                                    onSensorClick
                                ) {
                                    onSensorClick(
                                        sensor
                                    )
                                }
                            }}
                            style={{
                                cursor: 'pointer',
                            }}
                        >
                            {/* halo */}

                            <circle
                                cx={sensor.x}
                                cy={sensor.y}
                                r={17}
                                fill="rgba(245,158,11,.18)"
                            />

                            {/* sensor */}

                            <circle
                                cx={sensor.x}
                                cy={sensor.y}
                                r={9}
                                fill="#f59e0b"
                                stroke="#fff"
                                strokeWidth={2}
                            />

                            {/* center */}

                            <circle
                                cx={sensor.x}
                                cy={sensor.y}
                                r={3}
                                fill="#172033"
                            />

                            <text
                                x={sensor.x + 15}
                                y={sensor.y + 4}
                                fill="#f8fafc"
                                fontSize="13"
                                fontWeight="600"
                                pointerEvents="none"
                            >
                                {sensor.name}
                            </text>
                        </g>
                    ))}
                </g>
            </svg>
        </Box>
    )
}