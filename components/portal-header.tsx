import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function PortalHeader({ label }: { label: string }) {
  return (
    <header className="portal-header page-width">
      <Link href="/" className="portal-brand">EEA<span>Emerging Entrepreneurs Accelerator</span></Link>
      <div><span className="portal-label">{label}</span><Link href="/" className="portal-back"><ArrowLeft size={14} aria-hidden /> Back to programme</Link></div>
    </header>
  )
}
