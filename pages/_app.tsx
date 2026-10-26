import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div style={{ margin: 0, padding: 0, backgroundColor: '#091428', minHeight: '100vh', color: '#f0e6d2', fontFamily: 'sans-serif' }}>
      <Component {...pageProps} />
    </div>
  );
}
