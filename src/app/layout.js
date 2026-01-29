import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar, MobileNav, Header } from "@/components/layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sampadha - Personal Finance Tracker",
  description: "Track your assets, loans, gold, and private finance investments in one place",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="lg:pl-64 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
            {children}
          </main>
        </div>

        {/* Mobile Navigation */}
        <MobileNav />
      </body>
    </html>
  );
}
