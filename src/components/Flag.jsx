// Inline SVG flags (emoji flags do not render on Windows)
export default function Flag({ code, size = 24 }) {
  const body = {
    en: (<><rect width="60" height="30" fill="#012169" /><path d="M0 0L60 30M60 0L0 30" stroke="#fff" strokeWidth="6" /><path d="M0 0L60 30M60 0L0 30" stroke="#C8102E" strokeWidth="2" /><path d="M30 0V30M0 15H60" stroke="#fff" strokeWidth="10" /><path d="M30 0V30M0 15H60" stroke="#C8102E" strokeWidth="6" /></>),
    fr: (<><rect width="20" height="30" fill="#0055A4" /><rect x="20" width="20" height="30" fill="#fff" /><rect x="40" width="20" height="30" fill="#EF4135" /></>),
    de: (<><rect width="60" height="10" fill="#000" /><rect y="10" width="60" height="10" fill="#DD0000" /><rect y="20" width="60" height="10" fill="#FFCE00" /></>),
  }[code];
  return <svg className="flag" width={size} height={size} viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" aria-hidden="true">{body}</svg>;
}
