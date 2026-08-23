import { useEffect, useState } from 'react'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { enumLabel, statusLabels } from '../api/labels'
import { historyApi } from '../api/services'
import type { DefectStatusHistory } from '../api/types'

export function HistoryPage() {
  const [rows, setRows] = useState<DefectStatusHistory[]>([])

  useEffect(() => {
    historyApi.list().then(setRows).catch(() => setRows([]))
  }, [])

  const columns: GridColDef<DefectStatusHistory>[] = [
    { field: 'defectId', headerName: 'Дефект', flex: 1, minWidth: 220 },
    {
      field: 'oldStatus',
      headerName: 'Было',
      width: 140,
      renderCell: ({ value }) => <Chip size="small" label={enumLabel(statusLabels, value)} />,
    },
    {
      field: 'newStatus',
      headerName: 'Стало',
      width: 140,
      renderCell: ({ value }) => <Chip size="small" color="primary" label={enumLabel(statusLabels, value)} />,
    },
    { field: 'comment', headerName: 'Комментарий', flex: 2 },
    {
      field: 'createdAt',
      headerName: 'Дата',
      flex: 1,
      valueFormatter: (value) => value ? new Date(value as string).toLocaleString('ru-RU') : '—',
    },
    { field: 'createdBy', headerName: 'Кто изменил', flex: 1 },
  ]

  return (
    <Stack spacing={2.5} sx={{ height: 'calc(100vh - 120px)' }}>
      <Box>
        <Typography variant="h4">История статусов</Typography>
        <Typography color="text.secondary">Журнал изменений состояния дефектов</Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        <DataGrid rows={rows} columns={columns} pageSizeOptions={[10, 25, 50]} />
      </Box>
    </Stack>
  )
}
