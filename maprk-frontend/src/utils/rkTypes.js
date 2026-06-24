export const RK_TYPES = {
  'Билборд':            { color: '#e74c3c', label: 'Билборд' },
  'Сити-формат':        { color: '#2980b9', label: 'Сити-формат' },
  'Билборд динамика':   { color: '#e67e22', label: 'Билборд динамика' },
  'Цифровой билборд':   { color: '#16a085', label: 'Цифровой билборд' },
  'Афиша':              { color: '#8e44ad', label: 'Афиша' },
  'Панель-кронштейн':   { color: '#27ae60', label: 'Панель-кронштейн' },
  'Остановочный пункт': { color: '#f39c12', label: 'Остановочный пункт' },
  'Настенный щит':      { color: '#7f8c8d', label: 'Настенный щит' },
  'Прочее':             { color: '#e74c3c', label: 'Прочее' },
}

export const TYPE_OPTIONS = Object.entries(RK_TYPES).map(([value, { label }]) => ({
  value, label
}))

export function getColor(typeRk) {
  return RK_TYPES[typeRk]?.color ?? '#95a5a6'
}

// Генерация SVG маркера для MapLibre
export function makeMarkerSVG(typeRk, active = false, zoom = 12) {
  const c = getColor(typeRk)
  const sz = zoom <= 11 ? 9 : zoom <= 12 ? 12 : zoom <= 13 ? 15
           : zoom <= 14 ? 18 : zoom <= 15 ? 22 : zoom <= 16 ? 26 : 30
  const s = active ? sz + 5 : sz
  const border = active ? `stroke="#143d6b" stroke-width="1.5"` : `stroke="rgba(255,255,255,0.85)" stroke-width="1"`
  const shadow = active
    ? 'filter:drop-shadow(0 2px 4px rgba(0,0,0,.5))'
    : 'filter:drop-shadow(0 1px 3px rgba(0,0,0,.35))'

  const svgs = {
    'Билборд': `<svg width="${s}" height="${s+4}" viewBox="0 0 14 18" fill="none" style="${shadow}" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="12" height="8" rx="1.5" fill="${c}" ${border}/>
      <line x1="7" y1="9" x2="7" y2="17" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="17" x2="10" y2="17" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    'Сити-формат': `<svg width="${Math.round(s*0.7)}" height="${s+4}" viewBox="0 0 10 18" fill="none" style="${shadow}" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="8" height="11" rx="1.5" fill="${c}" ${border}/>
      <line x1="5" y1="12" x2="5" y2="17" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    'Билборд динамика': `<svg width="${s}" height="${s+4}" viewBox="0 0 14 18" fill="none" style="${shadow}" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="12" height="8" rx="1.5" fill="${c}" ${border}/>
      <polygon points="5,3 5,7 10,5" fill="rgba(255,255,255,.85)"/>
      <line x1="7" y1="9" x2="7" y2="17" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="17" x2="10" y2="17" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    'Цифровой билборд': `<svg width="${s}" height="${s+4}" viewBox="0 0 14 18" fill="none" style="${shadow}" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="12" height="8" rx="1.5" fill="${c}" ${border}/>
      <circle cx="4.5" cy="5" r="1" fill="rgba(255,255,255,.9)"/>
      <circle cx="7" cy="5" r="1" fill="rgba(255,255,255,.9)"/>
      <circle cx="9.5" cy="5" r="1" fill="rgba(255,255,255,.9)"/>
      <line x1="7" y1="9" x2="7" y2="17" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="17" x2="10" y2="17" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    'Афиша': `<svg width="${Math.round(s*0.8)}" height="${s+4}" viewBox="0 0 12 18" fill="none" style="${shadow}" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="10" height="12" rx="1.5" fill="${c}" ${border}/>
      <line x1="3" y1="4" x2="9" y2="4" stroke="rgba(255,255,255,.8)" stroke-width="1" stroke-linecap="round"/>
      <line x1="3" y1="6.5" x2="9" y2="6.5" stroke="rgba(255,255,255,.8)" stroke-width="1" stroke-linecap="round"/>
      <line x1="3" y1="9" x2="6.5" y2="9" stroke="rgba(255,255,255,.8)" stroke-width="1" stroke-linecap="round"/>
      <line x1="6" y1="13" x2="6" y2="17" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    'Панель-кронштейн': `<svg width="${s}" height="${Math.round(s*0.8)}" viewBox="0 0 16 13" fill="none" style="${shadow}" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="3.5" height="11" rx="0.8" fill="${c}" ${border}/>
      <rect x="4.5" y="3" width="10.5" height="7" rx="1.5" fill="${c}" ${border}/>
    </svg>`,
    'Остановочный пункт': `<svg width="${s}" height="${s+2}" viewBox="0 0 14 16" fill="none" style="${shadow}" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="12" height="2.5" rx="0.8" fill="${c}" ${border}/>
      <rect x="1.5" y="3.5" width="2" height="10" rx="0.5" fill="${c}" ${border}/>
      <rect x="10.5" y="3.5" width="2" height="10" rx="0.5" fill="${c}" ${border}/>
      <rect x="1.5" y="10" width="11" height="2" rx="0.5" fill="${c}" ${border}/>
    </svg>`,
    'Настенный щит': `<svg width="${s}" height="${Math.round(s*0.8)}" viewBox="0 0 14 11" fill="none" style="${shadow}" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="12" height="2" rx="0.5" fill="${c}" opacity="0.75" ${border}/>
      <rect x="1" y="3" width="12" height="7" rx="1.2" fill="${c}" ${border}/>
    </svg>`,
  }

  return svgs[typeRk] ?? svgs['Билборд']
}
