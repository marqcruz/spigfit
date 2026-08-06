import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SPIGFIT",
    short_name: "SPIGFIT",
    description: "Gestão de alunos e treinos.",
    start_url: "/",
    display: "standalone",
    background_color: "#090d0b",
    theme_color: "#090d0b",
    icons: [
      { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }
    ]
  };
}
