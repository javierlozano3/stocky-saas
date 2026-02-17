
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    gap: '4px',
                }}
            >
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', height: '28px', width: '10px' }}>
                    {/* Top Left: Tall */}
                    <div style={{ height: '16px', width: '100%', border: '3px solid #DC2626', borderRadius: '4px', background: 'transparent' }}></div>
                    {/* Bottom Left: Short */}
                    <div style={{ height: '8px', width: '100%', border: '3px solid #DC2626', borderRadius: '3px', background: 'transparent' }}></div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', height: '28px', width: '10px' }}>
                    {/* Top Right: Short */}
                    <div style={{ height: '8px', width: '100%', border: '3px solid #DC2626', borderRadius: '3px', background: 'transparent' }}></div>
                    {/* Bottom Right: Tall */}
                    <div style={{ height: '16px', width: '100%', border: '3px solid #DC2626', borderRadius: '4px', background: 'transparent' }}></div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
