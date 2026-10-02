import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export function PortalHeader({ label, showLogo = false }: { label: string; showLogo?: boolean }) {
  return (
    <header className="portal-header page-width">
      <Link href="/" className={showLogo ? 'portal-logo' : 'portal-brand'} aria-label="Emerging Entrepreneurs Accelerator — home">
        {showLogo ? (
          <Image
            src="/images/brand/eea-logo-transparent-v1.png"
            alt="EEA — Emerging Entrepreneurs Accelerator"
            width={1536}
            height={1024}
            sizes="(max-width: 760px) 144px, 200px"
            loading="eager"
          />
        ) : <>EEA<span>Emerging Entrepreneurs Accelerator</span></>}
      </Link>
      <div><span className="portal-label">{label}</span><Link href="/" className="portal-back"><ArrowLeft size={14} aria-hidden /> Back to programme</Link></div>
    </header>
  )
}
