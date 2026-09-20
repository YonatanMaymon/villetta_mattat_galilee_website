import { useMemo } from 'react'
import { DayPicker } from 'react-day-picker'
import { enUS, he } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import {
  isDaySelectable,
  isoFromLocalDate,
  localDateFromIso,
  pickDay,
  type BusyNights,
  type Selection,
} from '../../shared/dates'
import { stayRules } from '../../shared/rules'
import { useLanguage } from '../i18n/LanguageContext'

interface DateRangePickerProps {
  /** Nights that are already taken (from the Smoobu calendar). */
  busy: BusyNights
  value: Selection
  onChange: (value: Selection) => void
}

/**
 * Month calendar for choosing arrival and departure. Booked nights and past days can't be picked, and a
 * stay can't run across a booked night; the departure day itself may be another guest's arrival day.
 */
export default function DateRangePicker({ busy, value, onChange }: DateRangePickerProps) {
  const { dir, lang, t } = useLanguage()
  const rules = useMemo(() => stayRules(), [])

  const selected = value.arrival
    ? { from: localDateFromIso(value.arrival), to: value.departure ? localDateFromIso(value.departure) : undefined }
    : undefined

  return (
    <DayPicker
      mode="range"
      dir={dir}
      locale={lang === 'he' ? he : enUS}
      selected={selected}
      // Selection is handled by pickDay so the departure rules (turnover day, no crossing bookings) apply.
      onDayClick={(day) => onChange(pickDay(busy, value, isoFromLocalDate(day), rules))}
      disabled={(day) => !isDaySelectable(busy, value, isoFromLocalDate(day), rules)}
      // The chosen departure day may be another guest's first night; it isn't struck through then.
      modifiers={{
        booked: (day) => {
          const iso = isoFromLocalDate(day)
          return busy.has(iso) && iso >= rules.today && iso !== value.departure
        },
      }}
      modifiersClassNames={{ booked: 'rdp-booked' }}
      startMonth={localDateFromIso(rules.today)}
      endMonth={localDateFromIso(rules.lastArrival)}
      showOutsideDays={false}
      aria-label={t.selectDates}
      className="villetta-calendar mx-auto"
    />
  )
}
