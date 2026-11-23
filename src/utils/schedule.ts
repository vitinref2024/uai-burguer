import { STORE_CONFIG, STORE_SCHEDULE } from '../data/menu';
import { StoreScheduleDay, StoreStatus } from '../types/menu';

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const DAY_NAMES_LOWER: Record<number, string> = {
  0: 'domingo',
  1: 'segunda-feira',
  2: 'terça-feira',
  3: 'quarta-feira',
  4: 'quinta-feira',
  5: 'sexta-feira',
  6: 'sábado',
};

function getScheduleByDayIndex(dayIndex: number): StoreScheduleDay {
  return (
    STORE_SCHEDULE.find((day) => day.dayIndex === dayIndex) || {
      dayIndex,
      label: DAY_NAMES_LOWER[dayIndex] || '',
      shortLabel: '',
      isOpenDay: false,
      displayHours: 'Fechado',
    }
  );
}

/**
 * Extrai dia da semana (0-6), hora e minuto no fuso horário America/Sao_Paulo.
 */
export function getSaoPauloClock(now: Date = new Date()): {
  dayIndex: number;
  hour: number;
  minute: number;
  timeFormatted: string;
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: STORE_CONFIG.timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(now);
  const weekdayStr = parts.find((p) => p.type === 'weekday')?.value || 'Thu';
  const hourStr = parts.find((p) => p.type === 'hour')?.value || '00';
  const minuteStr = parts.find((p) => p.type === 'minute')?.value || '00';

  const dayIndex = WEEKDAY_MAP[weekdayStr] ?? 0;
  const hour = parseInt(hourStr, 10) % 24;
  const minute = parseInt(minuteStr, 10);
  const timeFormatted = `${String(hour).padStart(2, '0')}h${String(minute).padStart(2, '0')}`;

  return { dayIndex, hour, minute, timeFormatted };
}

/**
 * Verifica automaticamente se a UAI BURGUER está aberta no horário de Brasília (America/Sao_Paulo).
 * Funcionamento oficial: Quinta a Domingo, das 19h às 22h30. Segunda, terça e quarta: fechado.
 */
export function getStoreStatus(now: Date = new Date()): StoreStatus {
  const { dayIndex, hour, minute, timeFormatted } = getSaoPauloClock(now);
  const todaySchedule = getScheduleByDayIndex(dayIndex);
  const currentTotalMinutes = hour * 60 + minute;

  if (
    todaySchedule.isOpenDay &&
    todaySchedule.openHour !== undefined &&
    todaySchedule.openMinute !== undefined &&
    todaySchedule.closeHour !== undefined &&
    todaySchedule.closeMinute !== undefined
  ) {
    const openMinutes = todaySchedule.openHour * 60 + todaySchedule.openMinute;
    const closeMinutes = todaySchedule.closeHour * 60 + todaySchedule.closeMinute;

    // Aberto das 19:00 até 22:30 (inclusive)
    if (currentTotalMinutes >= openMinutes && currentTotalMinutes <= closeMinutes) {
      return {
        isOpen: true,
        currentDayIndex: dayIndex,
        currentTimeFormatted: timeFormatted,
        statusHeadline: 'Aberto agora',
        statusDetail: `Atendimento hoje até às 22h30`,
        nextOpeningText: 'Pedidos abertos até 22h30.',
      };
    }

    // É dia de funcionamento, mas ainda antes das 19h
    if (currentTotalMinutes < openMinutes) {
      return {
        isOpen: false,
        currentDayIndex: dayIndex,
        currentTimeFormatted: timeFormatted,
        statusHeadline: 'Fechado no momento',
        statusDetail: 'Abriremos hoje às 19h (atendimento até 22h30).',
        nextOpeningText: 'Hoje, das 19h às 22h30',
        compactClosedLabel: 'Abrimos hoje às 19h',
      };
    }
  }

  // Já passou das 22h30 ou é segunda, terça ou quarta: localizar próximo dia aberto
  for (let offset = 1; offset <= 7; offset++) {
    const nextDayIndex = (dayIndex + offset) % 7;
    const nextSchedule = getScheduleByDayIndex(nextDayIndex);
    if (nextSchedule.isOpenDay) {
      const dayText =
        offset === 1
          ? `amanhã (${DAY_NAMES_LOWER[nextDayIndex]})`
          : DAY_NAMES_LOWER[nextDayIndex];
      const compactDayText =
        offset === 1 ? 'amanhã' : DAY_NAMES_LOWER[nextDayIndex];
      return {
        isOpen: false,
        currentDayIndex: dayIndex,
        currentTimeFormatted: timeFormatted,
        statusHeadline: 'Fechado no momento',
        statusDetail: `Abriremos ${dayText} às 19h.`,
        nextOpeningText: `${nextSchedule.label}, das ${nextSchedule.displayHours}`,
        compactClosedLabel: `Abrimos ${compactDayText} às 19h`,
      };
    }
  }

  return {
    isOpen: false,
    currentDayIndex: dayIndex,
    currentTimeFormatted: timeFormatted,
    statusHeadline: 'Fechado no momento',
    statusDetail: 'Atendimento de quinta a domingo, das 19h às 22h30.',
    nextOpeningText: 'Quinta a domingo, das 19h às 22h30',
    compactClosedLabel: 'Abrimos hoje às 19h',
  };
}
