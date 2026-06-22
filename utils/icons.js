/** iconfont 填充风格 Tab 图标 (1024 viewBox) */
const FILL_ICON_PATHS = {
  calendar:
    'M880 184H720v-80c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v80H384v-80c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v80H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32zM880 840H144V406h736v434zM880 344H144V256h736v88z',
  clock:
    'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z M686.7 638.6L544.1 535.5V288c0-4.4-3.6-8-8-8H488c-4.4 0-8 3.6-8 8v275.4c0 2.6 1.2 5 3.3 6.5l165.4 120.6c3.9 2.8 9.4 2 12.2-1.9l44.8-61.7c2.8-3.9 2-9.4-1.9-12.2z',
  user:
    'M858.5 763.6a374 374 0 0 0-80.6-119.5 375.63 375.63 0 0 0-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 0 0-80.6 119.5A371.7 371.7 0 0 0 136 901.8a8 8 0 0 0 8 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 0 0 8-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z'
}

/** iconfont 线性风格 SVG 路径 (24x24, stroke 2px) */
const ICON_PATHS = {
  calendar: FILL_ICON_PATHS.calendar,
  clock: FILL_ICON_PATHS.clock,
  user: FILL_ICON_PATHS.user,
  add:
    '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  circle: '<circle cx="12" cy="12" r="9"/>',
  check: '<polyline points="6 12 10 16 18 8"/>',
  done: '<polyline points="6 12 10 16 18 8"/>',
  time:
    '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
  trash:
    '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>',
  alarm:
    '<circle cx="12" cy="13" r="7"/><polyline points="12 10 12 13 14 15"/><path d="M5 3L3 5"/><path d="M21 3l2 2"/>',
  empty:
    '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="15" r="1.5"/><path d="M12 17v1"/>',
  list:
    '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  info:
    '<circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12.01" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/>',
  chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
  chevronRight: '<polyline points="9 18 15 12 9 6"/>'
}

function getIconDataUri(name, color = '#FFB6C1', size = 24) {
  const fillPath = FILL_ICON_PATHS[name]
  if (fillPath) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024"><path fill="${color}" d="${fillPath}"/></svg>`
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
  }
  const paths = ICON_PATHS[name]
  if (!paths) return ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export { ICON_PATHS, getIconDataUri }
