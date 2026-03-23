import './globals.css';

export const metadata = {
  title: 'Protocolo Dieta da Selva — Descubra seu plano personalizado',
  description: 'Faça o quiz gratuito e descubra como mulheres acima de 30 estão perdendo até 17kg comendo carnes, queijos e ovos.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `window.pixelId = "69c18da5e1c0b72c10ee7dd6"; var a = document.createElement("script"); a.setAttribute("async", ""); a.setAttribute("defer", ""); a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js"); document.head.appendChild(a);` }} />
        <script src="https://cdn.utmify.com.br/scripts/utms/latest.js" data-utmify-prevent-xcod-sck data-utmify-prevent-subids async defer />
      </head>
      <body>{children}</body>
    </html>
  );
}
