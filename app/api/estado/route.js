// Lê o estado das últimas execuções de processamento no GitHub, para a página
// /estado mostrar à utilizadora o que já ficou pronto, o que falhou e o que
// ainda está a processar — sem depender de ninguém.
export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const repo = process.env.GH_REPO || "vivnasc/syntia";
  if (!token) return Response.json({ error: "Falta GITHUB_DISPATCH_TOKEN." }, { status: 500 });

  const r = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows/processar.yml/runs?per_page=25`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }, cache: "no-store" }
  );
  if (!r.ok) return Response.json({ error: `GitHub respondeu ${r.status}.` }, { status: 502 });

  const d = await r.json();
  const runs = (d.workflow_runs || []).map((x) => ({
    titulo: x.display_title || x.name,
    status: x.status,            // queued | in_progress | completed
    conclusion: x.conclusion,    // success | failure | cancelled | null
    quando: x.run_started_at || x.created_at,
    url: x.html_url,
  }));
  return Response.json({ runs });
}
