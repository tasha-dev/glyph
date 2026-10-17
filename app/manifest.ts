import type { MetadataRoute } from "next";

const APP_NAME = "Glyph";
const APP_DESCRIPTION =
  "Glyph is a fast, local-first Markdown editor built for developers. Featuring optional Vim keybindings, offline support, and a distraction-free interface, it lets you capture ideas instantly without accounts, cloud lock-in, or unnecessary complexity.";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: APP_NAME,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "any",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    categories: ["productivity", "utilities"],
    lang: "en",
    dir: "ltr",
    icons: [
      {
        src: "/manifest/manifest-icon-192.maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/manifest/manifest-icon-512.maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
