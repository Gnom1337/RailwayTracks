import { useEffect, useState } from 'react'
import { Alert, Box, Card, CardContent, Chip, Grid, LinearProgress, Stack, Typography } from '@mui/material'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded'
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded'
import { defectsApi, inspectorsApi, repairTeamsApi } from '../api/services'
import type { Defect } from '../api/types'

const closedStatus = 3

export function DashboardPage() {
  const [defects, setDefects] = useState<Defect[]>([])
  const [inspectors, setInspectors] = useState(0)
  const [teams, setTeams] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([defectsApi.list(), inspectorsApi.list(), repairTeamsApi.list()])
      .then(([d, i, t]) => {
        setDefects(d)
        setInspectors(i.length)
        setTeams(t.length)
      })
      .catch(() => setError('Не удалось загрузить статистику.'))
  }, [])

  const open = defects.filter((x) => x.status !== closedStatus).length
  const closed = defects.filter((x) => x.status === closedStatus).length
  const assigned = defects.filter((x) => !!x.repairTeamId).length

  const cards = [
    {
      label: 'Всего дефектов',
      value: defects.length,
      icon: <WarningAmberRoundedIcon />,
      detail: `${open} требуют внимания`,
    },
    {
      label: 'Закрыто',
      value: closed,
      icon: <CheckCircleRoundedIcon />,
      detail: defects.length ? `${Math.round(closed / defects.length * 100)}% от общего числа` : '0%',
    },
    {
      label: 'Назначено бригадам',
      value: assigned,
      icon: <EngineeringRoundedIcon />,
      detail: `${defects.length ? Math.round(assigned / defects.length * 100) : 0}% дефектов`,
    },
    {
      label: 'Инспекторы',
      value: inspectors,
      icon: <SensorsRoundedIcon />,
      detail: `${teams} ремонтных бригад`,
    },
  ]

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Диспетчерский центр</Typography>
        <Typography color="text.secondary" sx={{ mt: .7 }}>
          Контроль дефектов, инспекций и ремонтных работ
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography color="text.secondary" variant="body2">{card.label}</Typography>
                    <Typography variant="h4" sx={{ mt: 1 }}>{card.value}</Typography>
                  </Box>
                  <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(91,141,239,.12)', color: 'primary.main' }}>
                    {card.icon}
                  </Box>
                </Stack>
                <Chip label={card.detail} size="small" sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6">Состояние дефектов</Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: .6 }}>
                <Typography variant="body2">Закрытые</Typography>
                <Typography variant="body2">{closed}</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={defects.length ? closed / defects.length * 100 : 0} />
            </Box>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: .6 }}>
                <Typography variant="body2">Назначенные</Typography>
                <Typography variant="body2">{assigned}</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={defects.length ? assigned / defects.length * 100 : 0}
                color="secondary"
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
