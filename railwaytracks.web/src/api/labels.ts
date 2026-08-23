import type { Role } from './types'

export const statusLabels = ['Новый', 'В работе', 'Исправлен', 'Закрыт'] as const

export const severityLabels = ['Низкая', 'Средняя', 'Высокая', 'Критическая'] as const

export const recommendationTypeLabels = [
  'Наблюдать',
  'Запланировать ремонт',
  'Срочный ремонт',
  'Закрыть путь',
  'Ограничить скорость',
] as const

export const sourceTypeLabels = [
  'Вручную',
  'Датчик',
  'Путеизмерение',
  'Импорт файла',
  'Дрон',
  'Видеоаналитика',
] as const

export const inspectorTypeLabels = ['Работник', 'Датчик', 'Система'] as const

export const roleLabels: Record<Role, string> = {
  Admin: 'Администратор',
  Inspector: 'Инспектор',
  RepairTeam: 'Ремонтная бригада',
}

export function enumLabel(labels: readonly string[], value: number | undefined | null) {
  return typeof value === 'number' ? labels[value] ?? String(value) : 'Не указано'
}
