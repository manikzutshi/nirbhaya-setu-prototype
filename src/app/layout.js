import { Gabarito } from "next/font/google";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import "./globals.css";
import AppNavbar from "./components/AppNavbar";
import MobileDock from "./components/MobileDock";

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
          <AppNavbar />
          <main className="w-full">{children}</main>
          <MobileDock />
        </Auth0Provider>
      </body>
    </html>
  );
}
