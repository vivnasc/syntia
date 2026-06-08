/** @type {import('next').NextConfig} */
const nextConfig = {
  // App com servidor na Vercel (deixou de ser export estático) para suportar
  // o upload de áudio (rotas /api). As páginas de conteúdo continuam a ser
  // pré-geradas em build a partir do repositório.
  images: { unoptimized: true },
};

export default nextConfig;
