// Custom SVG icons for property stats — fills the gap where @ant-design/icons has no equivalent

export function BedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em">
      <path d="M2 9V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3" />
      <path d="M2 18v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5" />
      <line x1="2" y1="14" x2="22" y2="14" />
      <line x1="2" y1="18" x2="22" y2="18" />
      <rect x="5" y="11" width="4" height="3" rx="1" />
      <rect x="15" y="11" width="4" height="3" rx="1" />
    </svg>
  );
}

export function BathIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em">
      <path d="M9 6a3 3 0 0 1 6 0v3H9V6z" />
      <path d="M4 9h16v2a6 6 0 0 1-6 6H10A6 6 0 0 1 4 11V9z" />
      <line x1="8" y1="17" x2="7" y2="21" />
      <line x1="16" y1="17" x2="17" y2="21" />
    </svg>
  );
}

export function RulerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="6" y1="5" x2="6" y2="10" />
      <line x1="10" y1="5" x2="10" y2="8" />
      <line x1="14" y1="5" x2="14" y2="10" />
      <line x1="18" y1="5" x2="18" y2="8" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.121 1.528 5.852L0 24l6.336-1.502A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.679-.5-5.22-1.374L2.5 21.5l.894-4.167A9.955 9.955 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}
