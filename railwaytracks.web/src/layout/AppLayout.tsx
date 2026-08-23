import {
  Alert, AppBar, Avatar, Box, Chip, Divider, Drawer, IconButton, List,
  ListItemButton, ListItemIcon, ListItemText, Toolbar, Tooltip, Typography,
} from '@mui/material'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import AltRouteRoundedIcon from '@mui/icons-material/AltRouteRounded'
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded'
import SourceRoundedIcon from '@mui/icons-material/SourceRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { roleLabels } from '../api/labels'
import { useAuth } from '../auth/AuthContext'

const drawerWidth = 260

const nav = [
  { to: '/dashboard', label: 'Панель управления', icon: <DashboardRoundedIcon /> },
  { to: '/defects', label: 'Дефекты', icon: <WarningAmberRoundedIcon /> },
  { to: '/scheme', label: 'Схема путей', icon: <AltRouteRoundedIcon /> },
  { to: '/history', label: 'История статусов', icon: <HistoryRoundedIcon /> },
]

const adminNav = [
  { to: '/locations', label: 'Участки', icon: <PlaceRoundedIcon /> },
  { to: '/inspectors', label: 'Инспекторы', icon: <SensorsRoundedIcon /> },
  { to: '/repair-teams', label: 'Ремонтные бригады', icon: <EngineeringRoundedIcon /> },
  { to: '/defect-types', label: 'Типы дефектов', icon: <WarningAmberRoundedIcon /> },
  { to: '/data-sources', label: 'Источники данных', icon: <SourceRoundedIcon /> },
]

export function AppLayout() {
  const { user, roles, hasRole, logout } = useAuth()
  const location = useLocation()
  const roleLabel = roles.map((role) => roleLabels[role]).filter(Boolean).join(', ') || 'Пользователь'

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'rgba(7,17,31,.82)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(148,163,184,.1)',
        }}
      >
        <Toolbar sx={{ minHeight: 68 }}>
          <Box sx={{ width: drawerWidth, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34 }}>ЖД</Avatar>
            <Box>
              <Typography fontWeight={800} lineHeight={1}>Контроль путей</Typography>
              <Typography variant="caption" color="text.secondary">Управление дефектами</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Chip size="small" label={roleLabel} sx={{ mr: 2 }} />
          <Tooltip title="Выйти">
            <IconButton color="inherit" onClick={logout}><LogoutRoundedIcon /></IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#091625',
            borderRight: '1px solid rgba(148,163,184,.1)',
          },
        }}
      >
        <Toolbar sx={{ minHeight: 68 }} />
        <Box sx={{ px: 1.5, py: 2 }}>
          <Typography variant="overline" color="text.secondary" sx={{ px: 1.5 }}>Рабочая область</Typography>
          <List>
            {nav.map((item) => (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                selected={location.pathname === item.to}
                sx={{ borderRadius: 2, mb: .5 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>

          {hasRole('Admin') && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="overline" color="text.secondary" sx={{ px: 1.5 }}>Администрирование</Typography>
              <List>
                {adminNav.map((item) => (
                  <ListItemButton
                    key={item.to}
                    component={NavLink}
                    to={item.to}
                    selected={location.pathname === item.to}
                    sx={{ borderRadius: 2, mb: .5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Toolbar sx={{ minHeight: 68 }} />
        <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: 1800, mx: 'auto' }}>
          {!user && <Alert severity="warning">Пользователь не авторизован.</Alert>}
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
