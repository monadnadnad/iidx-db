import { createError, defineEventHandler, getRequestURL } from "h3";

export default defineEventHandler((event) => {
  const isLocked = !import.meta.dev;

  if (!isLocked) {
    return;
  }

  const url = getRequestURL(event);

  if (!url.pathname.startsWith("/api")) {
    return;
  }

  const method = event.node.req.method ?? "GET";

  if (url.pathname === "/api/recommendations" && (method === "GET" || method === "POST")) {
    return;
  }

  throw createError({
    statusCode: 404,
    statusMessage: "Not Found",
    message: "Endpoint is disabled in production.",
  });
});
