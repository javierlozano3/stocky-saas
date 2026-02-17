
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
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    gap: '2px', // gap between squares
                    padding: '2px', // slight padding
                }}
            >
                <div style={{ width: '13px', height: '13px', borderRadius: '3px', background: '#DC2626' }}></div>
                <div style={{ width: '13px', height: '13px', borderRadius: '3px', background: '#DC2626' }}></div>
                <div style={{ width: '13px', height: '13px', borderRadius: '3px', background: '#DC2626' }}></div>
                <div style={{ width: '13px', height: '13px', borderRadius: '3px', background: '#DC2626' }}></div>
            </div>
        ),
        {
            ...size,
        }
    )
}
