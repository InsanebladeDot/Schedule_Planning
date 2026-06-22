const STORAGE_KEYS = {
  TASKS: 'schedule_tasks',
  SETTINGS: 'schedule_settings',
  BACKUP: 'schedule_backup'
}

function getStorage(key, defaultValue = null) {
  try {
    const value = uni.getStorageSync(key)
    if (value === '' || value === undefined || value === null) {
      return defaultValue
    }
    return value
  } catch (e) {
    console.error('getStorage error:', key, e)
    return defaultValue
  }
}

function setStorage(key, value) {
  try {
    uni.setStorageSync(key, value)
    return true
  } catch (e) {
    console.error('setStorage error:', key, e)
    return false
  }
}

function removeStorage(key) {
  try {
    uni.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('removeStorage error:', key, e)
    return false
  }
}

function clearAllData() {
  removeStorage(STORAGE_KEYS.TASKS)
  removeStorage(STORAGE_KEYS.BACKUP)
}

function backupData(tasks) {
  setStorage(STORAGE_KEYS.BACKUP, {
    tasks,
    backupAt: new Date().toISOString()
  })
}

function restoreBackup() {
  return getStorage(STORAGE_KEYS.BACKUP, null)
}

export {
  STORAGE_KEYS,
  getStorage,
  setStorage,
  removeStorage,
  clearAllData,
  backupData,
  restoreBackup
}
