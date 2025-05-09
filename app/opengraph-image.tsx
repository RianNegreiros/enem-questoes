import { ImageResponse } from 'next/og'

// Tamanho da imagem: 1200x630
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(to bottom, #1e3a8a, #3b82f6)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: 32,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            padding: '32px 64px',
          }}
        >
          <div style={{ fontSize: 68, fontWeight: 'bold', marginBottom: 16 }}>Questões do ENEM</div>
          <div style={{ fontSize: 36, textAlign: 'center', maxWidth: '80%', opacity: 0.9 }}>
            Banco de questões 100% GRATUITO e ILIMITADO
          </div>
          <div
            style={{
              fontSize: 24,
              textAlign: 'center',
              maxWidth: '80%',
              opacity: 0.8,
              marginTop: 16,
              padding: '8px 16px',
              backgroundColor: 'rgba(0, 255, 0, 0.2)',
              borderRadius: 8,
            }}
          >
            Estude sem pagar nada e sem restrições
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
