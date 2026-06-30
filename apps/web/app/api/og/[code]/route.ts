import { repo, renderOgSvg, renderDefaultOgSvg } from "@reelparty/api/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: raw } = await params;
  const code = raw.replace(/\.svg$/i, "");

  let svg: string;
  if (!code || code === "default") {
    svg = renderDefaultOgSvg();
  } else {
    const ctx = await repo.partyInviteContext(code).catch(() => null);
    svg = ctx ? renderOgSvg(ctx) : renderDefaultOgSvg();
  }

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=120, s-maxage=300",
    },
  });
}
