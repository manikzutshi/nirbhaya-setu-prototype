import { Gabarito } from "next/font/google";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import "./globals.css";
import AppNavbar from "./components/AppNavbar";
import MobileDock from "./components/MobileDock";
import { LocationProvider } from "./components/LocationProvider";
import ChatWidget from "./components/ChatWidget";
import GlobalVoiceSOS from "./components/GlobalVoiceSOS";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

const gabarito = Gabarito({
  variable: "--font-gabarito",
  subsets: ["latin"],
});

export const metadata = {
  title: "Nirbhaya Setu",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={gabarito.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e16441" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${gabarito.className} antialiased`}>
        <Auth0Provider>
          <LocationProvider>
            <AppNavbar />
            <main className="w-full pb-28 md:pb-0">{children}</main>
            <MobileDock />
            <ChatWidget />
            <GlobalVoiceSOS />
            <PWAInstallPrompt />
          </LocationProvider>
        </Auth0Provider>
        <script dangerouslySetInnerHTML={{__html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            });
          }
        `}} />
      </body>
    </html>
  );
}
