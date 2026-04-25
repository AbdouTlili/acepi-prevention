'use client'

interface IconProps {
  name: string
  size?: number
  className?: string
}

const paths: Record<string, React.ReactNode> = {
  dashboard:   <><rect x="2" y="2" width="5" height="7" rx="1"/><rect x="9" y="2" width="5" height="4" rx="1"/><rect x="2" y="11" width="5" height="3" rx="1"/><rect x="9" y="8" width="5" height="6" rx="1"/></>,
  users:       <><circle cx="6" cy="6" r="2.5"/><path d="M2 13c.5-2 2-3 4-3s3.5 1 4 3"/><circle cx="12" cy="5" r="2" strokeWidth="1.3"/><path d="M10.5 13c.3-1.4 1.2-2.2 2.5-2.2s2.2.8 2.5 2.2"/></>,
  calendar:    <><rect x="2" y="3" width="12" height="11" rx="1"/><path d="M2 6h12M5 2v2M11 2v2"/></>,
  file:        <><path d="M4 2h5l3 3v9H4z"/><path d="M9 2v3h3"/><path d="M6 9h4M6 11h4"/></>,
  chart:       <><path d="M2 14V2"/><path d="M2 14h12"/><path d="M5 11v-4M8 11v-7M11 11v-5"/></>,
  settings:    <><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3"/></>,
  search:      <><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></>,
  bell:        <><path d="M4 10V7a4 4 0 118 0v3l1 2H3z"/><path d="M6.5 12.5a1.5 1.5 0 003 0"/></>,
  plus:        <><path d="M8 3v10M3 8h10"/></>,
  chevron:     <><path d="M6 3l4 5-4 5"/></>,
  chevronDown: <><path d="M3 6l5 4 5-4"/></>,
  arrowLeft:   <><path d="M7 3L3 8l4 5"/><path d="M3 8h11"/></>,
  flame:       <><path d="M8 2c0 3-3 3-3 6 0 2 1.5 4 3 4s3-2 3-4c0-3-3-3-3-6z"/></>,
  shield:      <><path d="M8 2l5 2v5c0 3-2 5-5 6-3-1-5-3-5-6V4z"/></>,
  alarm:       <><circle cx="8" cy="9" r="5"/><path d="M3 3l2 2M13 3l-2 2M8 6v3l2 1"/></>,
  mapPin:      <><path d="M8 14s4-4 4-7a4 4 0 10-8 0c0 3 4 7 4 7z"/><circle cx="8" cy="7" r="1.5"/></>,
  phone:       <><path d="M4 2h2l1 3-1.5 1a6 6 0 003.5 3.5L10 8l3 1v2a2 2 0 01-2 2A9 9 0 013 4a2 2 0 011-2z"/></>,
  mail:        <><rect x="2" y="3" width="12" height="10" rx="1"/><path d="M2 5l6 4 6-4"/></>,
  download:    <><path d="M8 2v8M5 7l3 3 3-3"/><path d="M3 13h10"/></>,
  upload:      <><path d="M8 14V6M5 9l3-3 3 3"/><path d="M3 14h10"/></>,
  filter:      <><path d="M2 3h12l-4 5v5l-4-2V8z"/></>,
  check:       <><path d="M3 8l3 3 7-7"/></>,
  x:           <><path d="M4 4l8 8M12 4l-8 8"/></>,
  more:        <><circle cx="4" cy="8" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="12" cy="8" r="1"/></>,
  printer:     <><path d="M4 6V2h8v4"/><rect x="2" y="6" width="12" height="6" rx="1"/><path d="M4 10h8v4H4z"/></>,
  send:        <><path d="M14 2L7 9M14 2l-4 12-3-5-5-3z"/></>,
  clock:       <><circle cx="8" cy="8" r="6"/><path d="M8 4v4l2.5 2"/></>,
  trendUp:     <><path d="M2 12l4-4 3 2 5-6"/><path d="M11 4h3v3"/></>,
  home:        <><path d="M2 8l6-5 6 5v6H2z"/><path d="M6 14V9h4v5"/></>,
  list:        <><path d="M5 4h9M5 8h9M5 12h9"/><circle cx="2.5" cy="4" r=".8"/><circle cx="2.5" cy="8" r=".8"/><circle cx="2.5" cy="12" r=".8"/></>,
  grid:        <><rect x="2" y="2" width="5" height="5" rx=".5"/><rect x="9" y="2" width="5" height="5" rx=".5"/><rect x="2" y="9" width="5" height="5" rx=".5"/><rect x="9" y="9" width="5" height="5" rx=".5"/></>,
  extincteur:  <><path d="M6 3h4v2H6z"/><rect x="5.5" y="5" width="5" height="9" rx="1"/><path d="M10 7h2"/></>,
  building:    <><rect x="3" y="3" width="10" height="11" rx=".5"/><path d="M6 6h1M9 6h1M6 9h1M9 9h1M6 12h4"/></>,
  edit:        <><path d="M11 2l3 3-9 9H2v-3z"/><path d="M9 4l3 3"/></>,
  trash:       <><path d="M3 5h10M5 5V3h6v2"/><rect x="4" y="5" width="8" height="9" rx="1"/><path d="M7 8v4M9 8v4"/></>,
  menu:        <><path d="M2 4h12M2 8h12M2 12h12"/></>,
}

export default function Icon({ name, size = 16, className = '' }: IconProps) {
  const p = paths[name]
  if (!p) return null
  return (
    <svg
      width={size} height={size} viewBox="0 0 16 16"
      fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true"
    >
      {p}
    </svg>
  )
}
