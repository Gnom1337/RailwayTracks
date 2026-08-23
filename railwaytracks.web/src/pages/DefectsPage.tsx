import { useEffect, useMemo, useState } from 'react'
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import {
  defectsApi, defectActionsApi, defectTypesApi, inspectorsApi, locationsApi, repairTeamsApi,
} from '../api/services'
import {
  enumLabel, recommendationTypeLabels, severityLabels, sourceTypeLabels, statusLabels,
} from '../api/labels'
import type { Defect, DefectType, Inspector, Location, RepairTeam } from '../api/types'
import { useAuth } from '../auth/AuthContext'

export function DefectsPage() {
  const { hasRole } = useAuth()
  const [rows, setRows] = useState<Defect[]>([])
  const [types, setTypes] = useState<DefectType[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [inspectors, setInspectors] = useState<Inspector[]>([])
  const [teams, setTeams] = useState<RepairTeam[]>([])
  const [open, setOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState<Defect | null>(null)
  const [statusOpen, setStatusOpen] = useState<Defect | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    defectTypeId: '',
    locationId: '',
    detectedAt: new Date().toISOString().slice(0, 16),
    detectedById: '',
    saverity: 1,
    description: '',
    plannedRepairDate: '',
    recommendationType: 0,
    sourceType: 0,
  })

  async function load() {
    try {
      const [d, t, l, i, r] = await Promise.all([
        defectsApi.list(),
        defectTypesApi.list(),
        locationsApi.list(),
        inspectorsApi.list(),
        repairTeamsApi.list(),
      ])
      setRows(d)
      setTypes(t)
      setLocations(l)
      setInspectors(i)
      setTeams(r)
    } catch {
      setError('Не удалось загрузить дефекты.')
    }
  }

  useEffect(() => { load() }, [])

  const columns = useMemo<GridColDef<Defect>[]>(() => [
    { field: 'id', headerName: 'ID', flex: 1, minWidth: 180 },
    {
      field: 'defectTypeId',
      headerName: 'Тип',
      flex: 1,
      valueGetter: (_, row) => types.find((x) => x.id === row.defectTypeId)?.name ?? 'Не указан',
    },
    {
      field: 'locationId',
      headerName: 'Участок',
      flex: 1,
      valueGetter: (_, row) => {
        const location = locations.find((x) => x.id === row.locationId)
        return location ? `${location.railwaySection}, км ${location.kilometer}` : 'Не указан'
      },
    },
    {
      field: 'status',
      headerName: 'Статус',
      width: 150,
      renderCell: ({ value }) => <Chip size="small" label={enumLabel(statusLabels, value)} />,
    },
    {
      field: 'saverity',
      headerName: 'Серьёзность',
      width: 150,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          color={value >= 3 ? 'error' : value === 2 ? 'warning' : 'default'}
          label={enumLabel(severityLabels, value)}
        />
      ),
    },
    {
      field: 'repairTeamId',
      headerName: 'Бригада',
      flex: 1,
      valueGetter: (_, row) => teams.find((x) => x.id === row.repairTeamId)?.name ?? 'Не назначена',
    },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 250,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={.5}>
          {hasRole('Admin') && (
            <Button size="small" onClick={() => setAssignOpen(row)}>Бригада</Button>
          )}
          {hasRole('Admin', 'Inspector', 'RepairTeam') && (
            <Button size="small" onClick={() => setStatusOpen(row)}>Статус</Button>
          )}
        </Stack>
      ),
    },
  ], [types, locations, teams, hasRole])

  async function create() {
    try {
      await defectsApi.create({
        ...form,
        detectedAt: new Date(form.detectedAt).toISOString(),
        plannedRepairDate: form.plannedRepairDate ? new Date(form.plannedRepairDate).toISOString() : null,
        status: undefined,
      })
      setOpen(false)
      await load()
    } catch {
      setError('Не удалось создать дефект. Проверьте обязательные поля.')
    }
  }

  async function assign(teamId: string) {
    if (!assignOpen) return
    try {
      await defectActionsApi.assignRepairTeam(assignOpen.id, teamId || null)
      setAssignOpen(null)
      await load()
    } catch {
      setError('Не удалось назначить ремонтную бригаду.')
    }
  }

  async function changeStatus(status: number, comment: string) {
    if (!statusOpen) return
    try {
      await defectActionsApi.changeStatus(statusOpen.id, status, comment)
      setStatusOpen(null)
      await load()
    } catch {
      setError('Не удалось изменить статус дефекта.')
    }
  }

  return (
    <Stack spacing={2.5} sx={{ height: 'calc(100vh - 120px)' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
        <Box>
          <Typography variant="h4">Дефекты</Typography>
          <Typography color="text.secondary">Управление обнаруженными дефектами пути</Typography>
        </Box>
        {hasRole('Admin', 'Inspector') && (
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpen(true)}>
            Новый дефект
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Box sx={{ flex: 1, minHeight: 400 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ borderRadius: 2, bgcolor: 'background.paper' }}
        />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Новый дефект</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Тип дефекта</InputLabel>
              <Select
                value={form.defectTypeId}
                label="Тип дефекта"
                onChange={(e) => setForm({ ...form, defectTypeId: e.target.value })}
              >
                {types.map((x) => <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Участок</InputLabel>
              <Select
                value={form.locationId}
                label="Участок"
                onChange={(e) => setForm({ ...form, locationId: e.target.value })}
              >
                {locations.map((x) => (
                  <MenuItem key={x.id} value={x.id}>{x.railwaySection}, км {x.kilometer}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Инспектор</InputLabel>
              <Select
                value={form.detectedById}
                label="Инспектор"
                onChange={(e) => setForm({ ...form, detectedById: e.target.value })}
              >
                {inspectors.map((x) => <MenuItem key={x.id} value={x.id}>{x.fullName ?? x.sensorSerial ?? x.id}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Серьёзность</InputLabel>
              <Select
                value={form.saverity}
                label="Серьёзность"
                onChange={(e) => setForm({ ...form, saverity: Number(e.target.value) })}
              >
                {severityLabels.map((label, value) => <MenuItem key={label} value={value}>{label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Рекомендация</InputLabel>
              <Select
                value={form.recommendationType}
                label="Рекомендация"
                onChange={(e) => setForm({ ...form, recommendationType: Number(e.target.value) })}
              >
                {recommendationTypeLabels.map((label, value) => <MenuItem key={label} value={value}>{label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Источник</InputLabel>
              <Select
                value={form.sourceType}
                label="Источник"
                onChange={(e) => setForm({ ...form, sourceType: Number(e.target.value) })}
              >
                {sourceTypeLabels.map((label, value) => <MenuItem key={label} value={value}>{label}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label="Дата обнаружения"
              type="datetime-local"
              value={form.detectedAt}
              onChange={(e) => setForm({ ...form, detectedAt: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Плановая дата ремонта"
              type="datetime-local"
              value={form.plannedRepairDate}
              onChange={(e) => setForm({ ...form, plannedRepairDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Описание"
              multiline
              minRows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={create}>Создать</Button>
        </DialogActions>
      </Dialog>

      <AssignDialog
        open={!!assignOpen}
        teams={teams}
        current={assignOpen?.repairTeamId ?? null}
        onClose={() => setAssignOpen(null)}
        onSave={assign}
      />
      <StatusDialog
        open={!!statusOpen}
        current={statusOpen?.status ?? 0}
        onClose={() => setStatusOpen(null)}
        onSave={changeStatus}
      />
    </Stack>
  )
}

function AssignDialog({
  open,
  teams,
  current,
  onClose,
  onSave,
}: {
  open: boolean
  teams: RepairTeam[]
  current: string | null
  onClose: () => void
  onSave: (id: string) => void
}) {
  const [value, setValue] = useState(current ?? '')

  useEffect(() => setValue(current ?? ''), [current])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Назначить ремонтную бригаду</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel>Бригада</InputLabel>
          <Select value={value} label="Бригада" onChange={(e) => setValue(e.target.value)}>
            <MenuItem value="">Снять назначение</MenuItem>
            {teams.map((x) => <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>)}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={() => onSave(value)}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  )
}

function StatusDialog({
  open,
  current,
  onClose,
  onSave,
}: {
  open: boolean
  current: number
  onClose: () => void
  onSave: (status: number, comment: string) => void
}) {
  const [status, setStatus] = useState(current)
  const [comment, setComment] = useState('')

  useEffect(() => {
    setStatus(current)
    setComment('')
  }, [current])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Изменить статус</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Статус</InputLabel>
            <Select value={status} label="Статус" onChange={(e) => setStatus(Number(e.target.value))}>
              {statusLabels.map((label, value) => <MenuItem key={label} value={value}>{label}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            label="Комментарий"
            multiline
            minRows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={() => onSave(status, comment)}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  )
}
