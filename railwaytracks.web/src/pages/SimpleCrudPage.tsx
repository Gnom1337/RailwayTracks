import { useEffect, useState } from 'react'
import {
  Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { defectTypesApi, dataSourcesApi, inspectorsApi, locationsApi, repairTeamsApi, trackSchemeApi } from '../api/services'
import { enumLabel, inspectorTypeLabels } from '../api/labels'
import type { DataSource, DefectType, Inspector, Location, RepairTeam, TrackSegment } from '../api/types'

type Resource = 'defect-types' | 'locations' | 'inspectors' | 'repair-teams' | 'data-sources'
type Row = DefectType | Location | Inspector | RepairTeam | DataSource

export function SimpleCrudPage({ title, resource }: { title: string; resource: Resource }) {
  const [rows, setRows] = useState<Row[]>([])
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      const api = getApi(resource)
      setRows(await api.list())
    } catch {
      setError('Не удалось загрузить данные.')
    }
  }

  useEffect(() => { load() }, [resource])

  const columns: GridColDef<Row>[] = [
    { field: 'id', headerName: 'ID', flex: 1, minWidth: 180 },
    ...columnsFor(resource),
    {
      field: 'actions',
      headerName: 'Действия',
      width: 130,
      sortable: false,
      renderCell: ({ row }) => (
        <Button
          color="error"
          size="small"
          startIcon={<DeleteOutlineRoundedIcon />}
          onClick={async () => {
            await getApi(resource).remove(row.id)
            await load()
          }}
        >
          Удалить
        </Button>
      ),
    },
  ]

  return (
    <Stack spacing={2.5} sx={{ height: 'calc(100vh - 120px)' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
        <Box>
          <Typography variant="h4">{title}</Typography>
          <Typography color="text.secondary">Администрирование справочника</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpen(true)}>
          Добавить
        </Button>
      </Stack>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Box sx={{ flex: 1 }}>
        <DataGrid rows={rows} columns={columns} pageSizeOptions={[10, 25, 50]} />
      </Box>

      <CrudDialog
        open={open}
        resource={resource}
        onClose={() => setOpen(false)}
        onSaved={async () => {
          setOpen(false)
          await load()
        }}
      />
    </Stack>
  )
}

function columnsFor(resource: Resource): GridColDef<Row>[] {
  switch (resource) {
    case 'defect-types':
      return [
        { field: 'name', headerName: 'Название', flex: 1 },
        { field: 'description', headerName: 'Описание', flex: 2 },
      ]
    case 'locations':
      return [
        { field: 'railwaySection', headerName: 'Участок пути', flex: 1 },
        { field: 'subDivision', headerName: 'Подразделение', flex: 1 },
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
          width: 130,
          valueGetter: (_, row) => enumLabel(inspectorTypeLabels, (row as Inspector).inspectorType),
        },
        { field: 'employeeId', headerName: 'ID сотрудника', flex: 1 },
        { field: 'fullName', headerName: 'ФИО', flex: 1 },
        { field: 'sensorSerial', headerName: 'Серийный номер датчика', flex: 1 },
      ]
    case 'repair-teams':
      return [
        { field: 'name', headerName: 'Название', flex: 1 },
        { field: 'contact', headerName: 'Контакт', flex: 1 },
        {
          field: 'contractor',
          headerName: 'Подрядчик',
          width: 130,
          valueGetter: (_, row) => (row as RepairTeam).contractor ? 'Да' : 'Нет',
        },
      ]
    default:
      return [{ field: 'name', headerName: 'Название', flex: 1 }]
  }
}

function getApi(resource: Resource) {
  if (resource === 'defect-types') return defectTypesApi
  if (resource === 'locations') return locationsApi
  if (resource === 'inspectors') return inspectorsApi
  if (resource === 'repair-teams') return repairTeamsApi
  return dataSourcesApi
}

function CrudDialog({
  open,
  resource,
  onClose,
  onSaved,
}: {
  open: boolean
  resource: Resource
  onClose: () => void
  onSaved: () => void
}) {
  const [values, setValues] = useState<Record<string, string | boolean>>({})
  const [segments, setSegments] = useState<TrackSegment[]>([])

  useEffect(() => {
    if (open) setValues({})
  }, [open, resource])

  useEffect(() => {
    if (!open || resource !== 'locations') return

    trackSchemeApi.getSegments()
      .then(setSegments)
      .catch(() => setSegments([]))
  }, [open, resource])

  async function save() {
    const api = getApi(resource)
    const payload = normalize(resource, values)
    await api.create(payload as never)
    onSaved()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Добавить запись</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {resource === 'defect-types' && (
            <>
              <TextField label="Название" onChange={(e) => setValues({ ...values, name: e.target.value })} />
              <TextField
                label="Описание"
                multiline
                minRows={3}
                onChange={(e) => setValues({ ...values, description: e.target.value })}
              />
            </>
          )}

                  {resource === 'locations' && (
                      <>
                          <FormControl fullWidth required>
                              <InputLabel>Участок пути</InputLabel>

                              <Select
                                  value={
                                      values.trackSegmentId?.toString() ?? ''
                                  }
                                  label="Участок пути"
                                  onChange={(e) => {
                                      const trackSegmentId = e.target.value

                                      const segment = segments.find(
                                          x => x.id === trackSegmentId
                                      )

                                      setValues({
                                          ...values,
                                          trackSegmentId,
                                          railwaySection:
                                              segment?.name ?? '',
                                      })
                                  }}
                              >
                                  {segments.map((segment) => (
                                      <MenuItem
                                          key={segment.id}
                                          value={segment.id}
                                      >
                                          {segment.name}
                                      </MenuItem>
                                  ))}
                              </Select>
                          </FormControl>

                          <TextField
                              label="Подразделение"
                              value={values.subDivision ?? ''}
                              onChange={(e) =>
                                  setValues({
                                      ...values,
                                      subDivision: e.target.value,
                                  })
                              }
                          />

                          <TextField
                              label="Километр"
                              type="number"
                              value={values.kilometer ?? ''}
                              onChange={(e) =>
                                  setValues({
                                      ...values,
                                      kilometer: e.target.value,
                                  })
                              }
                          />

                          <TextField
                              label="Пикет"
                              type="number"
                              value={values.picket ?? ''}
                              onChange={(e) =>
                                  setValues({
                                      ...values,
                                      picket: e.target.value,
                                  })
                              }
                          />

                          <TextField
                              label="Широта"
                              type="number"
                              value={values.latitude ?? ''}
                              onChange={(e) =>
                                  setValues({
                                      ...values,
                                      latitude: e.target.value,
                                  })
                              }
                          />

                          <TextField
                              label="Долгота"
                              type="number"
                              value={values.longitude ?? ''}
                              onChange={(e) =>
                                  setValues({
                                      ...values,
                                      longitude: e.target.value,
                                  })
                              }
                          />
                      </>
                  )}

          {resource === 'inspectors' && (
            <>
              <FormControl fullWidth>
                <InputLabel>Тип инспектора</InputLabel>
                <Select
                  value={values.inspectorType?.toString() ?? '0'}
                  label="Тип инспектора"
                  onChange={(e) => setValues({ ...values, inspectorType: e.target.value })}
                >
                  {inspectorTypeLabels.map((label, value) => (
                    <MenuItem key={label} value={value.toString()}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="ID сотрудника (GUID, можно оставить пустым)"
                onChange={(e) => setValues({ ...values, employeeId: e.target.value })}
              />
              <TextField label="ФИО" onChange={(e) => setValues({ ...values, fullName: e.target.value })} />
              <TextField
                label="Серийный номер датчика"
                onChange={(e) => setValues({ ...values, sensorSerial: e.target.value })}
              />
            </>
          )}

          {resource === 'repair-teams' && (
            <>
              <TextField label="Название" onChange={(e) => setValues({ ...values, name: e.target.value })} />
              <TextField label="Контакт" onChange={(e) => setValues({ ...values, contact: e.target.value })} />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.contractor === true}
                    onChange={(e) => setValues({ ...values, contractor: e.target.checked })}
                  />
                }
                label="Подрядная организация"
              />
            </>
          )}

          {resource === 'data-sources' && (
            <TextField label="Название" onChange={(e) => setValues({ ...values, name: e.target.value })} />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={save}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  )
}

function normalize(resource: Resource, values: Record<string, string | boolean>) {
  const text = (key: string) => values[key]?.toString().trim() ?? ''

    if (resource === 'locations') {
        return {
            trackSegmentId: text('trackSegmentId'),

            railwaySection: text('railwaySection'),

            subDivision: text('subDivision'),

            kilometer: Number(
                text('kilometer')
            ),

            picket: Number(
                text('picket')
            ),

            latitude: Number(
                text('latitude')
            ),

            longitude: Number(
                text('longitude')
            ),
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
      contact: text('contact'),
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
