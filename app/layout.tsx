import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SessionProvider } from "@/components/session-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "TaskFlow - Task Management System",
  description: "A collaborative task management system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SessionProvider>
            <SidebarProvider>
              <div className="flex h-screen">
                <AppSidebar />
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
              <Toaster />
            </SidebarProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
