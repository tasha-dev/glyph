import { RootLayoutProps } from "@/type/component";
import "@/app/globals.css";
import type { Metadata, Viewport } from "next";

const APP_NAME = "Glyph";
const APP_DESCRIPTION =
   "Glyph is a fast, local-first Markdown editor built for developers. Featuring optional Vim keybindings, offline support, and a distraction-free interface, it lets you capture ideas instantly without accounts, cloud lock-in, or unnecessary complexity.";

export const metadata: Metadata = {
   // metadataBase: new URL("https://glyph-app.vercel.app"),
   title: {
      default: APP_NAME,
      template: `%s • ${APP_NAME}`,
   },
   description: APP_DESCRIPTION,
   applicationName: APP_NAME,
   keywords: [
      "Glyph",
      "Markdown",
      "Markdown Editor",
      "Markdown Notes",
      "Note Taking",
      "Developer Tools",
      "Vim",
      "Vim Motions",
      "Vim Keybindings",
      "Local First",
      "Offline",
      "PWA",
      "Productivity",
      "Writing",
      "Notes",
      "GitHub Flavored Markdown",
   ],
   authors: [
      {
         name: "Mahdi Tasha",
         url: "https://github.com/tasha-dev",
      },
   ],
   creator: "Mahdi Tasha",
   publisher: "Mahdi Tasha",
   category: "productivity",
   alternates: {
      canonical: "/",
   },
   openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://glyph-app.vercel.app",
      siteName: APP_NAME,
      title: APP_NAME,
      description: APP_DESCRIPTION,
      images: [
         {
            url: "/og-image.png",
            width: 1200,
            height: 630,
            alt: "Glyph",
         },
      ],
   },
   twitter: {
      card: "summary_large_image",
      title: APP_NAME,
      description: APP_DESCRIPTION,
      images: ["/og-image.png"],
   },
   robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
         index: true,
         follow: true,
         "max-image-preview": "large",
         "max-snippet": -1,
         "max-video-preview": -1,
      },
   },
   appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: APP_NAME,
   },
   formatDetection: {
      telephone: false,
      email: false,
      address: false,
   },
};

export const viewport: Viewport = {
   themeColor: "#0a0a0a",
   colorScheme: "dark light",
   width: "device-width",
   initialScale: 1,
   maximumScale: 1,
};

export default function RootLayout({ children }: RootLayoutProps) {
   return (
      <html suppressHydrationWarning>
         <body>{children}</body>
      </html>
   );
}
