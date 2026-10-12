import { useMemo, useState } from 'react'
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material'
import { GlobalStyles } from '@mui/material'
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'

import type {
    Defect,
    Location,
    TrackSegment,
    TrackSensor,
} from '../api/types'

import { reportService } from './reportService'
import { enumLabel, statusLabels } from '../api/labels'

interface Props {
    open: boolean
    onClose: () => void
    segments: TrackSegment[]
    defects: Defect[]
    sensors: TrackSensor[]
    locations: Location[]
}

function today() {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function formatDate(value: string) {
    if (!value) return '—'

    return new Date(value).toLocaleDateString('ru-RU')
}

function formatDateTime(value: string) {
    return new Date(value).toLocaleString('ru-RU')
}

export function TrackSegmentReportDialog({
    open,
    onClose,
    segments,
    defects,
    sensors,
    locations,
}: Props) {
    const [segmentId, setSegmentId] = useState('')
    const [periodStart, setPeriodStart] = useState(today)
    const [periodEnd, setPeriodEnd] = useState(today)
    const [generated, setGenerated] = useState(false)
    const [error, setError] = useState('')

    const report = useMemo(() => {
        if (!generated || !segmentId || !periodStart || !periodEnd) {
            return null
        }

        const segment = segments.find(item => item.id === segmentId)

        if (!segment) return null

        return reportService.buildTrackSegmentReport({
            segment,
            periodStart,
            periodEnd,
            defects,
            sensors,
            locations,
        })
    }, [
        generated,
        segmentId,
        periodStart,
        periodEnd,
        segments,
        defects,
        sensors,
        locations,
    ])

    function generateReport() {
        setError('')

        if (!segmentId) {
            setError('Выберите участок пути.')
            return
        }

        if (!periodStart || !periodEnd) {
            setError('Укажите начало и конец периода.')
            return
        }

        if (periodStart > periodEnd) {
            setError('Начало периода не может быть позже его окончания.')
            return
        }

        setGenerated(true)
    }

    function resetAndClose() {
        setGenerated(false)
        setError('')
        onClose()
    }

    function printReport() {
        window.print()
    }

    return (
        <Dialog
            open={open}
            onClose={resetAndClose}
            fullWidth
            maxWidth="lg"
            scroll="paper"
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                    },
                },
            }}
        >
            <GlobalStyles
                styles={{
                    '@media print': {
                        '@page': {
                            size: 'A4',
                            margin: '12mm',
                        },
                        'body *': {
                            visibility: 'hidden !important',
                        },
                        '#track-segment-report, #track-segment-report *': {
                            visibility: 'visible !important',
                        },
                        '#track-segment-report': {
                            position: 'absolute !important',
                            left: '0 !important',
                            top: '0 !important',
                            width: '100% !important',
                            padding: '0 !important',
                            margin: '0 !important',
                        },
                        '.report-no-print': {
                            display: 'none !important',
                        },
                        '.MuiDialog-container': {
                            display: 'block !important',
                            height: 'auto !important',
                        },
                        '.MuiDialog-paper': {
                            overflow: 'visible !important',
                            maxHeight: 'none !important',
                            boxShadow: 'none !important',
                            margin: '0 !important',
                            width: '100% !important',
                            maxWidth: 'none !important',
                        },
                        '.MuiTableCell-root': {
                            padding: '5px !important',
                            fontSize: '9pt !important',
                        },
                        '.MuiPaper-root': {
                            breakInside: 'avoid',
                        },
                    },
                }}
            />
            <DialogTitle className="report-no-print">
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 46,
                            height: 46,
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            display: 'grid',
                            placeItems: 'center',
                        }}
                    >
                        <AssessmentRoundedIcon />
                    </Box>

                    <Box>
                        <Typography variant="h5" fontWeight={800}>
                            Отчет по участку пути
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Дефекты, датчики и состояние инфраструктуры за выбранный период
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                {!generated ? (
                    <Stack spacing={3} sx={{ py: 1 }}>
                        <Alert severity="info">
                            Выберите участок и период. В отчет попадут дефекты,
                            обнаруженные в этот период на выбранном участке.
                        </Alert>

                        <TextField
                            select
                            fullWidth
                            label="Участок пути"
                            value={segmentId}
                            onChange={event => setSegmentId(event.target.value)}
                        >
                            {segments.map(segment => (
                                <MenuItem key={segment.id} value={segment.id}>
                                    {segment.name} ({segment.startKm}–{segment.endKm} км)
                                </MenuItem>
                            ))}
                        </TextField>

                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                        >
                            <TextField
                                fullWidth
                                type="date"
                                label="Начало периода"
                                value={periodStart}
                                onChange={event => setPeriodStart(event.target.value)}
                                slotProps={{
                                    inputLabel: { shrink: true },
                                }}
                            />

                            <TextField
                                fullWidth
                                type="date"
                                label="Конец периода"
                                value={periodEnd}
                                onChange={event => setPeriodEnd(event.target.value)}
                                slotProps={{
                                    inputLabel: { shrink: true },
                                }}
                            />
                        </Stack>

                        {error && <Alert severity="error">{error}</Alert>}

                        {!segments.length && (
                            <Alert severity="warning">
                                Сначала создайте хотя бы один участок пути.
                            </Alert>
                        )}
                    </Stack>
                ) : report ? (
                    <Stack id="track-segment-report" spacing={3} sx={{ py: 1 }}>
                        {/* Заголовок отчета */}

                        <Paper
                            variant="outlined"
                            sx={{
                                p: { xs: 2, md: 3 },
                                borderRadius: 3,
                                background: theme =>
                                    theme.palette.mode === 'dark'
                                        ? 'linear-gradient(120deg, #172554, #1e293b)'
                                        : 'linear-gradient(120deg, #eff6ff, #f8fafc)',
                            }}
                        >
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                justifyContent="space-between"
                                spacing={2}
                            >
                                <Box>
                                    <Typography
                                        variant="overline"
                                        color="primary.main"
                                        fontWeight={800}
                                    >
                                        ОТЧЕТ ПО ЖЕЛЕЗНОДОРОЖНОЙ ИНФРАСТРУКТУРЕ
                                    </Typography>

                                    <Typography
                                        variant="h4"
                                        fontWeight={900}
                                        sx={{ mt: 0.5, overflowWrap: 'anywhere' }}
                                    >
                                        {report.segment.name}
                                    </Typography>

                                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                                        Километры: {report.segment.startKm} — {report.segment.endKm}
                                    </Typography>

                                    <Typography color="text.secondary">
                                        Период: {formatDate(report.periodStart)} — {formatDate(report.periodEnd)}
                                    </Typography>
                                </Box>

                                <Chip
                                    icon={<AssessmentRoundedIcon />}
                                    label="Сформирован"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ alignSelf: 'flex-start' }}
                                />
                            </Stack>
                        </Paper>

                        {/* Ключевые показатели */}

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: 'repeat(2, minmax(0, 1fr))',
                                    md: 'repeat(4, minmax(0, 1fr))',
                                },
                                gap: 1.5,
                            }}
                        >
                            {[
                                {
                                    title: 'Всего дефектов',
                                    value: report.totalDefects,
                                    icon: <WarningAmberRoundedIcon />,
                                },
                                {
                                    title: 'Не завершено',
                                    value: report.openDefects,
                                    icon: <AssessmentRoundedIcon />,
                                },
                                {
                                    title: 'Критические',
                                    value: report.criticalDefects,
                                    icon: <WarningAmberRoundedIcon />,
                                },
                                {
                                    title: 'Датчики',
                                    value: report.sensors.length,
                                    icon: <SensorsRoundedIcon />,
                                },
                            ].map(item => (
                                <Paper
                                    key={item.title}
                                    variant="outlined"
                                    sx={{ p: 2, borderRadius: 2.5, minWidth: 0 }}
                                >
                                    <Box color="primary.main">{item.icon}</Box>
                                    <Typography
                                        variant="h4"
                                        fontWeight={900}
                                        sx={{ mt: 1 }}
                                    >
                                        {item.value}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.title}
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>

                        {/* Общая информация */}

                        <Box>
                            <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
                                Общая информация
                            </Typography>

                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                                <Stack spacing={1.5}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <PlaceRoundedIcon color="action" />
                                        <Typography>
                                            Локаций на участке: <b>{report.locations.length}</b>
                                        </Typography>
                                    </Stack>

                                    <Divider />

                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <SensorsRoundedIcon color="action" />
                                        <Typography>
                                            Датчиков на участке: <b>{report.sensors.length}</b>
                                        </Typography>
                                    </Stack>

                                    <Divider />

                                    <Typography variant="body2" color="text.secondary">
                                        Время формирования: {formatDateTime(report.generatedAt)}
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Box>

                        {/* Дефекты */}

                        <Box>
                            <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
                                Реестр дефектов
                            </Typography>

                            {report.defects.length ? (
                                <Box sx={{ overflowX: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ID</TableCell>
                                                <TableCell>Дата обнаружения</TableCell>
                                                <TableCell>Локация</TableCell>
                                                <TableCell>Описание</TableCell>
                                                <TableCell>Статус</TableCell>
                                                <TableCell align="right">Серьезность</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {report.defects.map(defect => {
                                                const location = report.locations.find(
                                                    item => item.id === defect.locationId,
                                                )

                                                return (
                                                    <TableRow key={defect.id}>
                                                        <TableCell>
                                                            {defect.id.slice(0, 8)}
                                                        </TableCell>

                                                        <TableCell>
                                                            {formatDate(defect.detectedAt)}
                                                        </TableCell>

                                                        <TableCell>
                                                            {location?.railwaySection ?? report.segment.name}
                                                            <Typography
                                                                display="block"
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                км {location?.kilometer ?? '—'},
                                                                {' '}пикет {location?.picket ?? '—'}
                                                            </Typography>
                                                        </TableCell>

                                                        <TableCell sx={{ minWidth: 160 }}>
                                                            {defect.description || 'Нет описания'}
                                                        </TableCell>

                                                        <TableCell>
                                                            <Chip
                                                                size="small"
                                                                label={enumLabel(
                                                                    statusLabels,
                                                                    defect.status,
                                                                )}
                                                            />
                                                        </TableCell>

                                                        <TableCell align="right">
                                                            {defect.saverity}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ) : (
                                <Alert severity="success">
                                    За выбранный период дефекты не зарегистрированы.
                                </Alert>
                            )}
                        </Box>

                        {/* Датчики */}

                        <Box>
                            <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
                                Датчики участка
                            </Typography>

                            {report.sensors.length ? (
                                <Box sx={{ overflowX: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Название</TableCell>
                                                <TableCell>Серийный номер</TableCell>
                                                <TableCell>X</TableCell>
                                                <TableCell>Y</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {report.sensors.map(sensor => (
                                                <TableRow key={sensor.id}>
                                                    <TableCell>{sensor.name}</TableCell>
                                                    <TableCell>{sensor.serial}</TableCell>
                                                    <TableCell>{sensor.x}</TableCell>
                                                    <TableCell>{sensor.y}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ) : (
                                <Typography color="text.secondary">
                                    На участке нет зарегистрированных датчиков.
                                </Typography>
                            )}
                        </Box>

                        {/* Локации */}

                        <Box>
                            <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
                                Локации участка
                            </Typography>

                            {report.locations.length ? (
                                <Box sx={{ overflowX: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Участок / секция</TableCell>
                                                <TableCell>Подразделение</TableCell>
                                                <TableCell>Километр</TableCell>
                                                <TableCell>Пикет</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {report.locations.map(location => (
                                                <TableRow key={location.id}>
                                                    <TableCell>{location.railwaySection}</TableCell>
                                                    <TableCell>{location.subDivision || '—'}</TableCell>
                                                    <TableCell>{location.kilometer}</TableCell>
                                                    <TableCell>{location.picket}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ) : (
                                <Typography color="text.secondary">
                                    Для этого участка локации не зарегистрированы.
                                </Typography>
                            )}
                        </Box>

                        <Divider />

                        <Typography variant="caption" color="text.secondary">
                            Отчет сформирован автоматически на основе данных диспетчерской схемы.
                            Данные отражают состояние системы на момент формирования.
                        </Typography>
                    </Stack>
                ) : null}
            </DialogContent>

            <DialogActions
                className="report-no-print"
                sx={{ p: 2, justifyContent: 'space-between' }}
            >
                {generated ? (
                    <>
                        <Button
                            onClick={() => setGenerated(false)}
                        >
                            Изменить параметры
                        </Button>

                        <Stack direction="row" spacing={1}>
                            <Button onClick={resetAndClose}>
                                Закрыть
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={<PrintRoundedIcon />}
                                onClick={printReport}
                            >
                                Печать / PDF
                            </Button>
                        </Stack>
                    </>
                ) : (
                    <>
                        <Button onClick={resetAndClose}>
                            Отмена
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<AssessmentRoundedIcon />}
                            disabled={!segments.length}
                            onClick={generateReport}
                        >
                            Сформировать отчет
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    )
}