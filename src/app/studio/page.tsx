'use client'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import { WA_HREF } from '@/lib/constants'

const RoomViewer = dynamic(
  () => import('@/components/studio/RoomViewer'),
  { ssr: false }
)

const navItems = [
  { label: 'The Room', href: '#room' },
  { label: 'Setup', href: '#setup' },
  { label: 'Equipment', href: '#kit' },
  { label: 'Photo & Video', href: '/photography' },
]

export default function StudioPage() {
  return (
    <>
      <Header navItems={navItems} ctaLabel="Book the room" ctaHref="#contact" />

      <div className="page-solid">

        {/* Opening Soon / Podcast hero */}
        <section className="pod" id="podcast" style={{ paddingTop: '210px' }}>
          <div className="pod-bg">
            <Image
              src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1600&q=80"
              alt="Podcast studio"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="pod-in">
            <div className="pod-tag">
              <i style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ember)', animation: 'podPulse 2s ease-in-out infinite', display: 'inline-block' }} />
              Opening soon
            </div>
            <h2>The Imora podcast studio.<span className="soon">Coming soon</span></h2>
            <p>We&rsquo;re building a fully treated room for recording and filming long-form conversation —
               multi-camera, broadcast audio, and lighting that makes people look like themselves.
               Register your interest and we&rsquo;ll hold you a slot for opening week.</p>
            <div className="pod-list">
              <div><b>Multi-camera</b><span>4K video capture</span></div>
              <div><b>Broadcast audio</b><span>Treated, low-noise room</span></div>
              <div><b>Up to 4 guests</b><span>Round-table setup</span></div>
              <div><b>Same-week edit</b><span>Video &amp; audio delivered</span></div>
            </div>
            <Link className="btn wa-link" href={WA_HREF} target="_blank" rel="noopener noreferrer">Register interest ↗</Link>
          </div>
        </section>

        {/* 360 Room */}
        <section className="room" id="room">
          <div className="container">
            <div className="room-head">
              <div>
                <h2>Stand in the middle and look around.</h2>
              </div>
              <p>Drag to turn, scroll to zoom. This is a scale model of the room we&rsquo;re building —
                 desk, treatment, cameras and lighting in their real positions.</p>
            </div>
            <RoomViewer />
            <div className="room-legend">
              <button data-view="0">Host seat</button>
              <button data-view="1">Guest side</button>
              <button data-view="2">Camera wall</button>
              <button data-view="3">Full room</button>
            </div>
          </div>
        </section>

        {/* Camera Setup */}
        <section className="setup" id="setup">
          <div className="container">
            <div className="room-head">
              <div>
                <h2>Three angles, cut live or in post.</h2>
              </div>
              <p>Every session records all three feeds separately, so the edit is never locked
                 to one decision made on the day.</p>
            </div>
            <div className="setup-grid">
              <div className="cam-card">
                <div className="lens"></div>
                <h3>Wide master</h3>
                <p>Locked-off two-shot covering the whole table. The safety angle — always rolling,
                   always usable, and the frame the edit falls back to.</p>
              </div>
              <div className="cam-card">
                <div className="lens"></div>
                <h3>Host close-up</h3>
                <p>Tighter portrait framing on the host chair, shallow depth of field, set slightly
                   off-axis so eyelines stay natural rather than straight down the barrel.</p>
              </div>
              <div className="cam-card">
                <div className="lens"></div>
                <h3>Guest close-up</h3>
                <p>Mirrored framing on the guest side. Matched lens and colour profile, so cuts
                   between hosts and guests never jump.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Specs */}
        <section className="pspecs">
          <div className="container">
            <div className="pspecs-in">
              <div><h4>3</h4><span>Camera angles</span></div>
              <div><h4>4K</h4><span>Recording resolution</span></div>
              <div><h4>4</h4><span>Guests seated</span></div>
              <div><h4>7&nbsp;days</h4><span>Edit turnaround</span></div>
            </div>
          </div>
        </section>

        {/* Equipment */}
        <section className="kit" id="kit">
          <div className="container">
            <div className="room-head">
              <div>
                <h2>What&rsquo;s in the room.</h2>
              </div>
              <p>Everything is included in the hire — you bring the conversation.</p>
            </div>
            <div className="kit-group">
              {[
                { cat: 'Cameras',   item: 'Canon EOS 5D Mark IV',            desc: 'Full-frame bodies on the wide master and both close-ups, matched for colour.', qty: '×3' },
                { cat: 'Lenses',    item: '24–70mm f/2.8 & 85mm f/1.8',      desc: 'Zoom on the master for framing flexibility, primes on the close-ups for separation.', qty: '×3' },
                { cat: 'Audio',     item: 'Broadcast dynamic microphones on boom arms', desc: 'One per seat, each recorded to its own track so voices can be balanced separately.', qty: '×4' },
                { cat: 'Audio',     item: 'Multi-channel audio interface',    desc: 'Isolated inputs with backup recording, so a single failure never costs the session.', qty: '×1' },
                { cat: 'Lighting',  item: 'Bi-colour LED key and fill panels',desc: 'Softboxed key per seat plus a hair light, dialled to suit skin tone rather than a preset.', qty: '×5' },
                { cat: 'Lighting',  item: 'RGB accent tubes',                 desc: 'Background colour on the treated wall — subtle by default, tunable to brand.', qty: '×4' },
                { cat: 'Treatment', item: 'Broadband acoustic panels and bass traps', desc: 'Wall and corner treatment to kill flutter echo, so the room sounds controlled, not dead.', qty: 'Full wall' },
                { cat: 'Monitoring',item: 'Closed-back headphones and a confidence monitor', desc: 'Everyone hears the mix as it\'s recorded; the host can see framing at all times.', qty: '×4' },
                { cat: 'Delivery',  item: 'Edited video and audio masters',   desc: 'Cut episode, audio-only master, and vertical clips for social — delivered within the week.', qty: 'Per session' },
              ].map((row, i) => (
                <div className="kit-row" key={i}>
                  <div className="cat">{row.cat}</div>
                  <div className="item">{row.item}<span>{row.desc}</span></div>
                  <div className="qty">{row.qty}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="cta">
          <div className="container">
            <h2>Hold a slot for<br />opening week.</h2>
            <Link href={WA_HREF} className="btn wa-link" target="_blank" rel="noopener noreferrer">Register interest ↗</Link>
          </div>
        </section>

        <Footer
          tagline="Studio services — a treated room for podcasts, interviews and long-form conversation. Based in India."
          colTwoTitle="Studio"
          colTwoLinks={[
            { label: 'The Room', href: '#room' },
            { label: 'Camera Setup', href: '#setup' },
            { label: 'Equipment', href: '#kit' },
          ]}
          copyright="© 2026 Imora. All rights reserved."
          subtitle="Studio services"
        />
      </div>
    </>
  )
}
