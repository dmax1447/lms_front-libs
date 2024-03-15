import {
  CHECK_FORMAT,
  CHECK_FULL_FORMAT,
  CONTINUE_STATE,
  COUNT_DAYS_IN_WEEK,
  DAY_TYPE,
  END_STATE,
  FULL_STATE,
  START_STATE,
} from '../consts/calendar-consts'
import { cloneObject } from '../helpers/common-helper'
import { iconSelector } from '../helpers/courses-helper'

/**
 * Возвращает состояние события в переданном дне
 *
 * @param {object} event dayjs object data
 * @param {object} day dayjs object data
 * @return {string|null} start, end, full, continue
 */
export function getDayEventState(event, day) {
  const eventStartsAt = event.startsAt.format(CHECK_FORMAT)
  const eventEndsAt = event.endsAt.format(CHECK_FORMAT)
  const dayDate = day.format(CHECK_FORMAT)

  if (eventStartsAt === dayDate && eventEndsAt === dayDate) return FULL_STATE
  if (eventStartsAt === dayDate && eventEndsAt !== dayDate) return START_STATE
  if (eventStartsAt !== dayDate && eventEndsAt === dayDate) return END_STATE
  if (event.startsAt < day && event.endsAt > day) return CONTINUE_STATE

  return null
}

/**
 * Имеет один и тот же день, но разное время
 *
 * @param {object} startsAt - dayjs instance
 * @param {object} endsAt - dayjs instance
 * @return {boolean}
 */
export function eventWithTime(startsAt, endsAt) {
  return (
    startsAt.format(CHECK_FORMAT) === endsAt.format(CHECK_FORMAT) &&
    startsAt.format(CHECK_FULL_FORMAT) !== endsAt.format(CHECK_FULL_FORMAT)
  )
}

export function eventIsContinued(event, withTime) {
  return event.state === CONTINUE_STATE || !withTime
}

/**
 * @param {object} event event object
 * @param {function} dayjs dayjs function
 * @return {{startsAt, endsAt}}
 */
export function wrapStartEndWithDayjs(event, dayjs) {
  return {
    endsAt: dayjs(event.ends_at),
  }
}

/**
 * Возвращает отмапенное событие для дня
 *
 * @param {object} event dayjs object
 * @param {object} dayDate dayjs object
 * @param {function} dayjs dayjs function
 *
 * @param activeType
 * @return {*&{showName: boolean, state: string, position: number} || null}
 */
export function getEventForDay({ event, dayDate, dayjs, activeType }) {
  const startsAt = dayjs(getTime(event.start_date, dayjs))
  const endsAt = dayjs(getTime(event.end_date, dayjs))
  const state = getDayEventState({ startsAt, endsAt }, dayDate)
  const withTime = eventWithTime(startsAt, endsAt)
  const link = dayjs() >= startsAt ? getCourseItemLink(event.course?.id, event.id) : ''

  if (!state) return null

  return {
    id: event.id,
    description: event.course?.name || '',
    endsAt,
    isContinued: eventIsContinued(event, withTime),
    link,
    icon: iconSelector(event.object_type || ''),
    name: event.name,
    position: event.position,
    payload: event,
    showName: getEventNameVisibility({ state, dayDate, activeType }),
    state,
    startsAt,
    withTime,
  }
}

export function getWeekDays(date) {
  const startOfWeek = date.startOf('week')
  return Array(COUNT_DAYS_IN_WEEK)
    .fill('')
    .map((_, i) => startOfWeek.add(i, 'day'))
}

export function eventsForRender(days) {
  return days.reduce((renderEvents, day, index) => {
    if (!day.events) return renderEvents

    // todo optimize and refactor
    for (const event of day.events) {
      const eventKey = getEventKey(event)
      const renderEvent = renderEvents[eventKey]
      if (!renderEvent) renderEvents[eventKey] = {}

      if (renderEvent) {
        const isEnd = event.state === END_STATE
        const isStart = renderEvent.isStart

        let state = FULL_STATE

        if (isStart && !isEnd) state = START_STATE
        if (!isStart && isEnd) state = END_STATE
        if (!isStart && !isEnd) state = CONTINUE_STATE

        if (state === END_STATE) delete renderEvent.isStart

        renderEvents[eventKey] = {
          ...renderEvent,
          length: ++renderEvent.length,
          payload: {
            ...renderEvent.payload,
            state,
          },
        }
      } else {
        renderEvents[eventKey] = {
          offset: index,
          length: 1,
          isStart: event.state === START_STATE,
          payload: event,
        }
      }
    }

    return renderEvents
  }, {})
}

export function getEventKey(event) {
  return `${event.name}${event.starts_at}${event.ends_at}${event.id}`
}

/**
 * @param stringDate
 * @param {function} dayjs
 * @return {*}
 */
function getTime(stringDate, dayjs) {
  return stringDate.slice(-14) === 'T00:00:00.000Z' ? dayjs.tz(stringDate).format() : stringDate
}

function getCourseItemLink(courseId, itemId) {
  if (!courseId) return ''

  return `/courses/${courseId}/${itemId}`
}

/**
 * @param visiblePeriod
 * @param events
 * @param activeDate
 * @param dayjs
 * @return {*[]}
 */
export function createDaysByPeriod({ visiblePeriod, activeDate, dayjs }) {
  const days = []

  if (!visiblePeriod) return days

  const { startsAt, endsAt } = visiblePeriod
  const countDays = endsAt.diff(startsAt, 'day') + 1

  for (const index in getArrFromCount(countDays)) {
    const dayDate = startsAt.add(Number(index), 'day')

    days.push({
      dayDate,
      inVisibleMonth: dayDate.isSame(activeDate, 'month'),
      isActive: dayDate.isSame(dayjs(), 'day'),
      key: +dayDate,
      events: [],
    })
  }

  return days
}

/**
 * @param state
 * @param dayDate
 * @param activeType
 * @return {*|boolean|boolean}
 */
function getEventNameVisibility({ state, dayDate, activeType }) {
  if (activeType === DAY_TYPE) return true

  const isEndOrStart = [END_STATE, START_STATE].includes(state)
  const isStartOfWeek = dayDate.isSame(dayDate.startOf('week'), 'day')

  return isStartOfWeek || isEndOrStart
}

/**
 * @param events
 * @param days
 * @param dayjs
 * @param activeType
 */
export function addEventsToDays({ events, days, dayjs, activeType }) {
  const newDays = cloneObject(days)
  for (const day of newDays) {
    day.dayDate = dayjs(day.dayDate)
    for (const srcEvent of events) {
      const event = getEventForDay({
        event: srcEvent,
        dayDate: day.dayDate,
        dayjs,
        activeType,
      })
      event && day.events.push(event)
    }
  }
  return newDays
}

export function getArrFromCount(length) {
  return Array.from({ length })
}
