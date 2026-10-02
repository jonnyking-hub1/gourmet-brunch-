import type { Metadata } from 'next'
import { PortalHeader } from '@/components/portal-header'
import { PitchForm } from '@/components/pitch-form'
import { selectionNote } from '@/lib/event'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pitch your business | Emerging Entrepreneurs Accelerator',
  description: 'Ideas and operating businesses across all sectors are welcome. Share your business, revenue model, and pitch deck for consideration.',
}

export default function PitchPage() {
  return (
    <>
      <PortalHeader label="Venture submissions" />
      <main className="page-width pitch-layout">
        <section className="pitch-intro" aria-labelledby="pitch-heading">
          <p className="eyebrow">All sectors. Real business potential.</p>
          <h1 id="pitch-heading">An idea worth<br /><em>building on.</em></h1>
          <p>Tell us what makes your business compelling and how it can generate sustainable cash flow. We welcome early-stage ideas and businesses already making sales.</p>
          <ul className="pitch-benefits">
            <li><Check aria-hidden size={17} /> Any industry, including businesses outside F&amp;B</li>
            <li><Check aria-hidden size={17} /> A clear path to revenue, or evidence of current turnover</li>
            <li><Check aria-hidden size={17} /> Programme registration is not required to pitch</li>
          </ul>
          <div className="pitch-guidance">
            <h2>What to put in your deck</h2>
            <p>Explain the problem, your product or service, customers, how you make money, your progress or launch plan, and the support you need.</p>
            <p>Use a PDF up to 4 MB. Your deck and contact details are available to the organising team for review.</p>
          </div>
          <p className="registration-disclosure">{selectionNote} Submitting a pitch does not guarantee selection.</p>
        </section>
        <PitchForm />
      </main>
    </>
  )
}
