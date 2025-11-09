import { Gabarito } from "next/font/google";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import "./globals.css";
import AppNavbar from "./components/AppNavbar";
import MobileDock from "./components/MobileDock";
import { LocationProvider } from "./components/LocationProvider";
import ChatWidget from "./components/ChatWidget";

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
      <body className={`${gabarito.className} antialiased`}>
        <Auth0Provider>
          <LocationProvider>
            <AppNavbar />
            <main className="w-full pb-28 md:pb-0">{children}</main>
            <MobileDock />
            <ChatWidget />
          </LocationProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
