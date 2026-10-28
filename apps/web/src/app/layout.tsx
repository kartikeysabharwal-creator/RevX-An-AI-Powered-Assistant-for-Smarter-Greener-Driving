import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RevX — AI-Powered Smart-Driving Assistant for Smarter, Greener Driving',
  description:
    'RevX analyzes vehicle and smartphone driving telemetry to cut fuel consumption, lower CO2 emissions, and deliver personalized AI coaching with Green Computing.',
  keywords: [
    'Eco Driving',
    'AI Driving Assistant',
    'OBD-II Telemetry',
    'Fuel Efficiency',
    'CO2 Emissions',
    'Green Computing',
    'Smart Driving',
  ],
  authors: [{ name: 'RevX Engineering' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-revx-dark text-revx-platinum antialiased selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
