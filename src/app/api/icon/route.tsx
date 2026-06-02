import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sizeParam = searchParams.get('size') || '512'
  const size = parseInt(sizeParam, 10)
  
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050505',
        }}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '60%', height: '60%' }}>
          <path 
            d="M 15 30 L 45 15 L 95 50 L 45 85 L 15 70 L 40 50 Z" 
            fill="#FFB800" 
            stroke="#FFB800" 
            strokeWidth="8" 
            strokeLinejoin="round" 
          />
        </svg>
      </div>
    ),
    { width: size, height: size }
  )
}
