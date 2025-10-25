import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MedicalCopilot AI - Advanced Multi-Agent Clinical Intelligence',
  description: '16 Specialized Medical AI Agents working in coordinated workflow for comprehensive clinical analysis',
  keywords: ['medical AI', 'clinical intelligence', 'multi-agent', 'healthcare', 'diagnosis'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
