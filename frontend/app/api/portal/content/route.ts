import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { handleCorsPreflight } from "@/lib/cors";
import { jsonData, jsonError, requireUser } from "@/lib/api-utils";
import { schedulePushToAll } from "@/lib/push";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN", "AGENT"], request);
  if (denied) return denied;

  const where = session!.role === "AGENT" ? { authorId: session!.id } : {};

  const [news, announcements] = await Promise.all([
    prisma.newsArticle.findMany({ where, orderBy: { publishedAt: "desc" }, take: 30 }),
    prisma.announcement.findMany({ where, orderBy: { createdAt: "desc" }, take: 30 })
  ]);

  return jsonData({ news, announcements }, request);
}

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN", "AGENT"], request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const type = body?.type;

  if (type === "news") {
    const article = await prisma.newsArticle.create({
      data: {
        title: body.title,
        excerpt: body.excerpt,
        body: body.body,
        category: body.category || "Match Report",
        image: body.image || "",
        published: body.published !== false,
        authorId: session!.id
      }
    });
    if (article.published) {
      schedulePushToAll({
        title: "News",
        body: article.title,
        url: "/news",
        tag: `news-${article.id}`
      });
    }
    return jsonData(article, request, 201);
  }

  if (type === "announcement") {
    const announcement = await prisma.announcement.create({
      data: {
        title: body.title,
        body: body.body,
        level: body.level === "warning" ? "warning" : "info",
        authorId: session!.id
      }
    });
    schedulePushToAll({
      title: announcement.level === "warning" ? "Important announcement" : "Announcement",
      body: announcement.title,
      url: "/announcements",
      tag: `announcement-${announcement.id}`
    });
    return jsonData(announcement, request, 201);
  }

  return jsonError("Invalid content type.", 400, request);
}

export async function DELETE(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN", "AGENT"], request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const type = body?.type;
  const id = body?.id;

  if (!type || !id) return jsonError("Content type and id are required.", 400, request);

  if (type === "news") {
    const article = await prisma.newsArticle.findUnique({ where: { id } });
    if (!article) return jsonError("Article not found.", 404, request);
    if (session!.role === "AGENT" && article.authorId !== session!.id) {
      return jsonError("You can only delete your own articles.", 403, request);
    }
    await prisma.newsArticle.delete({ where: { id } });
    return jsonData({ ok: true }, request);
  }

  if (type === "announcement") {
    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) return jsonError("Announcement not found.", 404, request);
    if (session!.role === "AGENT" && announcement.authorId !== session!.id) {
      return jsonError("You can only delete your own announcements.", 403, request);
    }
    await prisma.announcement.delete({ where: { id } });
    return jsonData({ ok: true }, request);
  }

  return jsonError("Invalid content type.", 400, request);
}
