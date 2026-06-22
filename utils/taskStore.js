import { reactive, computed } from 'vue'
import { getStorage, setStorage, STORAGE_KEYS } from './storage'
import { formatDate, getDayOfWeek, addDays, compareTime, parseDate } from './date'
import { loadDarkMode, saveDarkMode, applyTheme, themeState } from './theme'

const COLORS = ['#8E8E93', '#636366', '#AEAEB2', '#48484A', '#C7C7CC', '#3A3A3C']

const state = reactive({
  tasks: [],
  settings: {
    darkMode: false,
    nickname: '日程达人'
  },
  loaded: false
})

/** 1=周一 … 7=周日 */
function getWeekdayIndex(dateStr) {
  const d = getDayOfWeek(dateStr)
  return d === 0 ? 7 : d
}

function generateId() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function normalizeTask(task) {
  let repeatType = task.repeatType
  if (!repeatType) {
    if (task.dailyRepeat || (Array.isArray(task.repeat) && task.repeat.length >= 7)) {
      repeatType = 'daily'
    } else if (
      task.weeklyRepeat ||
      (Array.isArray(task.repeat) && task.repeat.length > 0)
    ) {
      repeatType = 'weekly'
    } else {
      repeatType = 'none'
    }
  }

  let repeatWeekday = task.repeatWeekday
  if (repeatType === 'weekly') {
    if (repeatWeekday) {
      /* keep */
    } else if (Array.isArray(task.repeat) && task.repeat.length > 0) {
      repeatWeekday = task.repeat[0]
    } else if (task.dayOfWeek != null) {
      repeatWeekday = task.dayOfWeek === 0 ? 7 : task.dayOfWeek
    } else {
      repeatWeekday = getWeekdayIndex(task.date || formatDate(new Date()))
    }
  }

  let repeatWeekdays = Array.isArray(task.repeatWeekdays) ? [...task.repeatWeekdays] : []
  if (repeatType === 'weekly' && repeatWeekdays.length === 0) {
    repeatWeekdays = [repeatWeekday || getWeekdayIndex(task.date || formatDate(new Date()))]
  }

  const doneDates = Array.isArray(task.doneDates) ? [...task.doneDates] : []
  const dateStr = task.date || formatDate(new Date())

  return {
    id: task.id,
    title: task.title || '',
    time: task.time || '09:00',
    endTime: task.endTime || '',
    date: dateStr,
    startDate: task.startDate || dateStr,
    endDate: task.endDate || '',
    repeatType,
    repeatWeekday: repeatWeekday || 1,
    repeatWeekdays,
    done: repeatType === 'none' ? !!(task.done ?? task.completed) : false,
    doneDates,
    desc: task.desc || '',
    icon: task.icon || '🎯',
    dailyCount: task.dailyCount || 1,
    reminder: !!task.reminder,
    journal: !!task.journal,
    color: task.color || COLORS[0],
    createdAt: task.createdAt || new Date().toISOString()
  }
}

function persist() {
  setStorage(STORAGE_KEYS.TASKS, state.tasks)
  setStorage(STORAGE_KEYS.SETTINGS, state.settings)
}

function initStore() {
  const rawTasks = getStorage(STORAGE_KEYS.TASKS, [])
  const savedSettings = getStorage(STORAGE_KEYS.SETTINGS, {})
  const darkMode = loadDarkMode()

  state.tasks = (Array.isArray(rawTasks) ? rawTasks : []).map(normalizeTask)
  state.settings = {
    nickname: '日程达人',
    ...savedSettings,
    darkMode
  }
  applyTheme(darkMode, { silent: true, animate: false })
  state.loaded = true
}

function taskMatchesDate(task, dateStr) {
  const start = task.startDate || task.date
  if (start && dateStr < start) return false
  if (task.endDate && dateStr > task.endDate) return false
  if (task.repeatType === 'daily') return true
  if (task.repeatType === 'weekly') {
    const wd = getWeekdayIndex(dateStr)
    const days = task.repeatWeekdays?.length ? task.repeatWeekdays : [task.repeatWeekday]
    return days.includes(wd)
  }
  return task.date === dateStr
}

function isTaskDone(task, dateStr) {
  if (task.repeatType === 'none') return task.done
  return task.doneDates.includes(dateStr)
}

function getTasksForDate(dateStr) {
  return state.tasks
    .filter(t => taskMatchesDate(t, dateStr))
    .map(t => ({
      ...t,
      done: isTaskDone(t, dateStr)
    }))
    .sort((a, b) => compareTime(a.time, b.time))
}

function validateTime(time) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
}

function resolveRepeatType(payload) {
  if (payload.repeatType) return payload.repeatType
  if (payload.dailyRepeat) return 'daily'
  if (payload.weeklyRepeat) return 'weekly'
  return 'none'
}

function addTask(payload) {
  const dateStr = payload.date || formatDate(new Date())
  const time = payload.time || '09:00'
  if (!validateTime(time)) {
    uni.showToast({ title: '时间格式不正确', icon: 'none' })
    return null
  }
  if (payload.endTime && !validateTime(payload.endTime)) {
    uni.showToast({ title: '结束时间格式不正确', icon: 'none' })
    return null
  }

  const repeatType = resolveRepeatType(payload)
  const repeatWeekdays =
    Array.isArray(payload.repeatWeekdays) && payload.repeatWeekdays.length
      ? payload.repeatWeekdays
      : repeatType === 'weekly'
        ? [getWeekdayIndex(dateStr)]
        : []

  const task = normalizeTask({
    id: generateId(),
    title: payload.title.trim(),
    time,
    endTime: payload.endTime || '',
    date: dateStr,
    startDate: payload.startDate || dateStr,
    endDate: payload.endDate || '',
    repeatType,
    repeatWeekday: repeatWeekdays[0] || getWeekdayIndex(dateStr),
    repeatWeekdays,
    done: false,
    doneDates: [],
    desc: payload.desc || '',
    icon: payload.icon || '🎯',
    dailyCount: payload.dailyCount || 1,
    reminder: !!payload.reminder,
    journal: !!payload.journal,
    color: payload.color || COLORS[Math.floor(Math.random() * COLORS.length)],
    createdAt: new Date().toISOString()
  })
  state.tasks.push(task)
  persist()
  return task
}

function updateTask(id, updates) {
  const index = state.tasks.findIndex(t => t.id === id)
  if (index === -1) return null
  state.tasks[index] = normalizeTask({ ...state.tasks[index], ...updates })
  persist()
  return state.tasks[index]
}

function toggleComplete(id, dateStr) {
  const task = state.tasks.find(t => t.id === id)
  if (!task || !dateStr) return null

  if (task.repeatType === 'none') {
    task.done = !task.done
  } else {
    const idx = task.doneDates.indexOf(dateStr)
    if (idx >= 0) {
      task.doneDates.splice(idx, 1)
    } else {
      task.doneDates.push(dateStr)
    }
  }
  persist()
  return task
}

function deleteTask(id) {
  const index = state.tasks.findIndex(t => t.id === id)
  if (index === -1) return false
  state.tasks.splice(index, 1)
  persist()
  return true
}

function clearAllTasks() {
  state.tasks = []
  persist()
}

function restoreTasks(tasks) {
  state.tasks = (Array.isArray(tasks) ? tasks : []).map(normalizeTask)
  persist()
}

function getTaskById(id) {
  return state.tasks.find(t => t.id === id) || null
}

function getTotalTaskCount() {
  return state.tasks.length
}

function getRepeatLabel(task) {
  if (task.repeatType === 'daily') return '每天'
  if (task.repeatType === 'weekly') return '每周'
  return ''
}

function formatTaskTime(task) {
  if (task.endTime) return `${task.time} - ${task.endTime}`
  return task.time
}

function getAllTasksList() {
  return [...state.tasks].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date)
    if (dateCompare !== 0) return dateCompare
    return compareTime(a.time, b.time)
  })
}

function getCompletedRecords() {
  const records = []
  state.tasks.forEach((task) => {
    if (task.repeatType === 'none') {
      if (task.done) {
        records.push({ completedDate: task.date, task })
      }
    } else {
      task.doneDates.forEach((date) => {
        records.push({ completedDate: date, task })
      })
    }
  })
  return records.sort((a, b) => {
    const dc = b.completedDate.localeCompare(a.completedDate)
    if (dc !== 0) return dc
    return compareTime(a.task.time, b.task.time)
  })
}

function getCompletedGroupedByDate() {
  const map = new Map()
  getCompletedRecords().forEach((record) => {
    const key = record.completedDate
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(record)
  })
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, items]) => ({ date, items }))
}

function getDoneCount() {
  return getCompletedRecords().length
}

function getWeeklyCompletedCount() {
  const today = new Date()
  let count = 0
  for (let i = 0; i < 7; i++) {
    const d = formatDate(addDays(today, -i))
    count += state.tasks.filter(t => taskMatchesDate(t, d) && isTaskDone(t, d)).length
  }
  return count
}

function getStreakDays() {
  let streak = 0
  let day = new Date()
  while (true) {
    const d = formatDate(day)
    const dayTasks = state.tasks.filter(t => taskMatchesDate(t, d))
    if (dayTasks.length === 0) break
    if (!dayTasks.every(t => isTaskDone(t, d))) break
    streak++
    day = addDays(day, -1)
  }
  return streak
}

/** 从指定日期往前数连续完成天数（仅计任务出现的日期） */
function getTaskPersistDays(task, fromDateStr) {
  let streak = 0
  let day = parseDate(fromDateStr)
  for (let i = 0; i < 365; i++) {
    const d = formatDate(day)
    if (taskMatchesDate(task, d)) {
      if (!isTaskDone(task, d)) break
      streak++
    }
    day = addDays(day, -1)
  }
  return streak
}

function setDarkMode(enabled) {
  const value = !!enabled
  state.settings.darkMode = value
  saveDarkMode(value)
  applyTheme(value, { animate: true })
  persist()
}

function setNickname(name) {
  state.settings.nickname = name
  persist()
}

function useTaskStore() {
  return {
    tasks: computed(() => state.tasks),
    settings: computed(() => state.settings),
    loaded: computed(() => state.loaded),
    isDark: computed(() => themeState.darkMode),
    getTasksForDate,
    getTaskById,
    isTaskDone,
    addTask,
    updateTask,
    toggleComplete,
    deleteTask,
    clearAllTasks,
    restoreTasks,
    getTotalTaskCount,
    getDoneCount,
    getAllTasksList,
    getCompletedRecords,
    getCompletedGroupedByDate,
    getRepeatLabel,
    formatTaskTime,
    getWeeklyCompletedCount,
    getStreakDays,
    getTaskPersistDays,
    setDarkMode,
    setNickname
  }
}

export { initStore, useTaskStore, COLORS, getWeekdayIndex, isTaskDone, taskMatchesDate }
