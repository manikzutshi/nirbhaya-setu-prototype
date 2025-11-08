import { Gabarito } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
