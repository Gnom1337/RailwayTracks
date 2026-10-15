import { useEffect, useState } from 'react'
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import {
    defectTypesApi,
    dataSourcesApi,
    inspectorsApi,
    locationsApi,
    repairTeamsApi,
    trackSchemeApi,
} from '../api/services'
import { enumLabel, inspectorTypeLabels } from '../api/labels'
import type {
    DataSource,
    DefectType,
    Inspector,
    Location,
    RepairTeam,
    TrackSegment,
} from '../api/types'

type Resource =
    | 'defect-types'
    | 'locations'
    | 'inspectors'
    | 'repair-teams'
    | 'data-sources'

type Row = DefectType | Location | Inspector | RepairTeam | DataSource
type FormValues = Record<string, string | boolean>

export function SimpleCrudPage({
    title,
    resource,
}: {
    title: string
    resource: Resource
}) {
    const [rows, setRows] = useState<Row[]>([])
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<Row | null>(null)
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    async function load() {
        try {
            setError('')
            const api = getApi(resource)
            setRows((await api.list()) as Row[])
        } catch {
            setError('Не удалось загрузить данные.')
        }
    }

    useEffect(() => {
        void load()
        // load depends on resource; reload when the selected resource changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resource])

    function openCreateDialog() {
        setEditing(null)
        setError('')
        setOpen(true)
    }

    function openEditDialog(row: Row) {
        setEditing(row)
        setError('')
        setOpen(true)
    }

    function closeDialog() {
        if (busy) return
        setOpen(false)
        setEditing(null)
    }

    async function removeRow(row: Row) {
        const confirmed = window.confirm('Удалить выбранную запись?')
        if (!confirmed) return

        try {
            setError('')
            await getApi(resource).remove(row.id)
            await load()
        } catch {
            setError('Не удалось удалить запись.')
        }
    }

    const columns: GridColDef<Row>[] = [
        { field: 'id', headerName: 'ID', flex: 1, minWidth: 180 },
        ...columnsFor(resource),
        {
            field: 'actions',
            headerName: 'Действия',
            width: 220,
            sortable: false,
            filterable: false,
            renderCell: ({ row }) => (
                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        startIcon={<EditRoundedIcon />}
                        onClick={() => openEditDialog(row)}
                    >
                        Изменить
                    </Button>
                    <Button
                        color="error"
                        size="small"
                        startIcon={<DeleteOutlineRoundedIcon />}
                        onClick={() => void removeRow(row)}
                    >
                        Удалить
                    </Button>
                </Stack>
            ),
        },
    ]

    return (
        <Stack spacing={2.5} sx={{ height: 'calc(100vh - 120px)' }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                gap={2}
            >
                <Box>
                    <Typography variant="h4">{title}</Typography>
                    <Typography color="text.secondary">
                        Администрирование справочника
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={openCreateDialog}
                >
                    Добавить
                </Button>
            </Stack>

            {error && (
                <Alert severity="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Box sx={{ flex: 1, minHeight: 0 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                />
            </Box>

            <CrudDialog
                open={open}
                resource={resource}
                editing={editing}
                busy={busy}
                setBusy={setBusy}
                onClose={closeDialog}
                onSaved={async () => {
                    setOpen(false)
                    setEditing(null)
                    await load()
                }}
                onError={setError}
            />
        </Stack>
    )
}

function columnsFor(resource: Resource): GridColDef<Row>[] {
    switch (resource) {
        case 'defect-types':
            return [
                { field: 'name', headerName: 'Название', flex: 1, minWidth: 160 },
                { field: 'description', headerName: 'Описание', flex: 2, minWidth: 200 },
            ]

        case 'locations':
            return [
                { field: 'railwaySection', headerName: 'Участок пути', flex: 1, minWidth: 150 },
                { field: 'subDivision', headerName: 'Подразделение', flex: 1, minWidth: 150 },
                { field: 'kilometer', headerName: 'Километр', width: 110 },
                { field: 'picket', headerName: 'Пикет', width: 100 },
                { field: 'latitude', headerName: 'Широта', width: 120 },
                { field: 'longitude', headerName: 'Долгота', width: 120 },
            ]

        case 'inspectors':
            return [
                {
                    field: 'inspectorType',
                    headerName: 'Тип',
                    width: 150,
                    valueGetter: (_, row) =>
                        enumLabel(inspectorTypeLabels, (row as Inspector).inspectorType),
                },
                { field: 'employeeId', headerName: 'ID сотрудника', flex: 1, minWidth: 180 },
                { field: 'fullName', headerName: 'ФИО', flex: 1, minWidth: 160 },
                { field: 'sensorSerial', headerName: 'Серийный номер датчика', flex: 1, minWidth: 180 },
            ]

        case 'repair-teams':
            return [
                { field: 'name', headerName: 'Старший бригады', flex: 1, minWidth: 160 },
                { field: 'contact', headerName: 'Контакт', flex: 1, minWidth: 160 },
            ]

        case 'data-sources':
            return [
                { field: 'name', headerName: 'Название источника', flex: 1, minWidth: 180 },
            ]

        default:
            return []
    }
}

function getApi(resource: Resource) {
    switch (resource) {
        case 'defect-types':
            return defectTypesApi
        case 'locations':
            return locationsApi
        case 'inspectors':
            return inspectorsApi
        case 'repair-teams':
            return repairTeamsApi
        case 'data-sources':
            return dataSourcesApi
    }
}

function CrudDialog({
    open,
    resource,
    editing,
    busy,
    setBusy,
    onClose,
    onSaved,
    onError,
}: {
    open: boolean
    resource: Resource
    editing: Row | null
    busy: boolean
    setBusy: (value: boolean) => void
    onClose: () => void
    onSaved: () => void | Promise<void>
    onError: (message: string) => void
}) {
    const [values, setValues] = useState<FormValues>({})
    const [segments, setSegments] = useState<TrackSegment[]>([])

    useEffect(() => {
        if (!open) return

        if (!editing) {
            setValues(
                resource === 'inspectors'
                    ? { inspectorType: '0', employeeId: '', fullName: '', sensorSerial: '' }
                    : resource === 'repair-teams'
                        ? { name: '', contact: '', contractor: false }
                        : {},
            )
            return
        }

        const row = editing as unknown as Record<string, unknown>
        const keysByResource: Record<Resource, string[]> = {
            'defect-types': ['name', 'description'],
            locations: [
                'trackSegmentId',
                'railwaySection',
                'subDivision',
                'kilometer',
                'picket',
                'latitude',
                'longitude',
            ],
            inspectors: ['inspectorType', 'employeeId', 'fullName', 'sensorSerial'],
            'repair-teams': ['name', 'contact', 'contractor'],
            'data-sources': ['name'],
        }

        const nextValues: FormValues = {}

        for (const key of keysByResource[resource]) {
            const value = row[key]
            nextValues[key] =
                typeof value === 'boolean'
                    ? value
                    : value == null
                        ? ''
                        : String(value)
        }

        // A location API may return railwaySection but not trackSegmentId.
        // In that case the segment must be selected again before saving.
        setValues(nextValues)
    }, [open, resource, editing])

    useEffect(() => {
        if (!open || resource !== 'locations') return

        trackSchemeApi
            .getSegments()
            .then(setSegments)
            .catch(() => {
                setSegments([])
                onError('Не удалось загрузить участки пути для выбора.')
            })
    }, [open, resource, onError])

    function changeValue(key: string, value: string | boolean) {
        setValues((current) => ({ ...current, [key]: value }))
    }

    async function save() {
        try {
            onError('')
            const validationError = validate(resource, values)
            if (validationError) {
                onError(validationError)
                return
            }

            const payload = normalize(resource, values)
            setBusy(true)

            const api = getApi(resource)
            if (editing) {
                await api.update(editing.id, payload as never)
            } else {
                await api.create(payload as never)
            }

            await onSaved()
        } catch {
            onError(
                editing
                    ? 'Не удалось сохранить изменения. Проверьте данные и доступность API.'
                    : 'Не удалось создать запись. Проверьте данные и доступность API.',
            )
        } finally {
            setBusy(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {editing ? 'Редактировать запись' : 'Добавить запись'}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {resource === 'defect-types' && (
                        <>
                            <TextField
                                label="Название"
                                required
                                value={values.name ?? ''}
                                onChange={(e) => changeValue('name', e.target.value)}
                            />
                            <TextField
                                label="Описание"
                                multiline
                                minRows={3}
                                value={values.description ?? ''}
                                onChange={(e) => changeValue('description', e.target.value)}
                            />
                        </>
                    )}

                    {resource === 'locations' && (
                        <>
                            <FormControl fullWidth required>
                                <InputLabel id="track-segment-label">Участок пути</InputLabel>
                                <Select
                                    labelId="track-segment-label"
                                    value={String(values.trackSegmentId ?? '')}
                                    label="Участок пути"
                                    onChange={(e) => {
                                        const trackSegmentId = e.target.value
                                        const segment = segments.find((x) => x.id === trackSegmentId)
                                        setValues((current) => ({
                                            ...current,
                                            trackSegmentId,
                                            railwaySection: segment?.name ?? '',
                                        }))
                                    }}
                                >
                                    {segments.map((segment) => (
                                        <MenuItem key={segment.id} value={segment.id}>
                                            {segment.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                label="Подразделение"
                                value={values.subDivision ?? ''}
                                onChange={(e) => changeValue('subDivision', e.target.value)}
                            />
                            <TextField
                                label="Километр"
                                type="number"
                                required
                                inputProps={{ step: 'any' }}
                                value={values.kilometer ?? ''}
                                onChange={(e) => changeValue('kilometer', e.target.value)}
                            />
                            <TextField
                                label="Пикет"
                                type="number"
                                required
                                inputProps={{ step: 'any' }}
                                value={values.picket ?? ''}
                                onChange={(e) => changeValue('picket', e.target.value)}
                            />
                            <TextField
                                label="Широта"
                                type="number"
                                inputProps={{ step: 'any' }}
                                value={values.latitude ?? ''}
                                onChange={(e) => changeValue('latitude', e.target.value)}
                            />
                            <TextField
                                label="Долгота"
                                type="number"
                                inputProps={{ step: 'any' }}
                                value={values.longitude ?? ''}
                                onChange={(e) => changeValue('longitude', e.target.value)}
                            />
                        </>
                    )}

                    {resource === 'inspectors' && (
                        <>
                            <FormControl fullWidth>
                                <InputLabel id="inspector-type-label">Тип инспектора</InputLabel>
                                <Select
                                    labelId="inspector-type-label"
                                    value={String(values.inspectorType ?? '0')}
                                    label="Тип инспектора"
                                    onChange={(e) => changeValue('inspectorType', e.target.value)}
                                >
                                    {inspectorTypeLabels.map((label, value) => (
                                        <MenuItem key={label} value={String(value)}>
                                            {label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="ID сотрудника (GUID, можно оставить пустым)"
                                value={values.employeeId ?? ''}
                                onChange={(e) => changeValue('employeeId', e.target.value)}
                            />
                            <TextField
                                label="ФИО"
                                value={values.fullName ?? ''}
                                onChange={(e) => changeValue('fullName', e.target.value)}
                            />
                            <TextField
                                label="Серийный номер датчика"
                                value={values.sensorSerial ?? ''}
                                onChange={(e) => changeValue('sensorSerial', e.target.value)}
                            />
                        </>
                    )}

                    {resource === 'repair-teams' && (
                        <>
                            <TextField
                                label="Старший бригады"
                                required
                                value={values.name ?? ''}
                                onChange={(e) => changeValue('name', e.target.value)}
                            />
                            <TextField
                                label="Контакт"
                                value={values.contact ?? ''}
                                onChange={(e) => changeValue('contact', e.target.value)}
                            />
                           
                        </>
                    )}

                    {resource === 'data-sources' && (
                        <TextField
                            label="Название источника"
                            required
                            value={values.name ?? ''}
                            onChange={(e) => changeValue('name', e.target.value)}
                        />
                    )}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={busy}>
                    Отмена
                </Button>
                <Button variant="contained" onClick={() => void save()} disabled={busy}>
                    {busy ? 'Сохранение…' : 'Сохранить'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

function validate(resource: Resource, values: FormValues): string {
    const text = (key: string) => String(values[key] ?? '').trim()

    if (resource === 'defect-types' && !text('name')) {
        return 'Введите название типа дефекта.'
    }

    if (resource === 'locations') {
        if (!text('trackSegmentId')) return 'Выберите участок пути.'

        for (const [key, label] of [
            ['kilometer', 'километр'],
            ['picket', 'пикет'],
        ]) {
            const raw = text(key)
            if (!raw || !Number.isFinite(Number(raw))) {
                return `Введите корректное значение поля «${label}».`
            }
        }

        for (const [key, label] of [
            ['latitude', 'широта'],
            ['longitude', 'долгота'],
        ]) {
            const raw = text(key)
            if (raw && !Number.isFinite(Number(raw))) {
                return `Введите корректное значение поля «${label}».`
            }
        }
    }

    if (resource === 'repair-teams' && !text('name')) {
        return 'Введите имя старшего бригады.'
    }

    if (resource === 'data-sources' && !text('name')) {
        return 'Введите название источника данных.'
    }

    return ''
}

function normalize(resource: Resource, values: FormValues) {
    const text = (key: string) => String(values[key] ?? '').trim()
    const number = (key: string) => Number(text(key))

    if (resource === 'locations') {
        return {
            trackSegmentId: text('trackSegmentId'),
            railwaySection: text('railwaySection'),
            subDivision: text('subDivision') || null,
            kilometer: Number(text('kilometer')),
            picket: Number(text('picket')),
            latitude: number('latitude'),
            longitude: number('longitude'),
        }
    }

    if (resource === 'inspectors') {
        return {
            inspectorType: Number(text('inspectorType') || 0),
            employeeId: text('employeeId') || crypto.randomUUID(),
            fullName: text('fullName') || null,
            sensorSerial: text('sensorSerial') || null,
        }
    }

    if (resource === 'repair-teams') {
        return {
            name: text('name'),
            contact: text('contact') || null,
            contractor: values.contractor === true,
        }
    }

    if (resource === 'defect-types') {
        return {
            name: text('name'),
            description: text('description') || null,
        }
    }

    return { name: text('name') }
}