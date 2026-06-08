/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exporta um site estático (HTML/JS/CSS) → simples de servir na Vercel,
  // lê o conteúdo do repositório em tempo de build.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
