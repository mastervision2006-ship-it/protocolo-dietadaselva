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
      </head>
      <body>{children}</body>
    </html>
  );
}
