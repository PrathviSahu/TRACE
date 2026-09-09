// ─────────────────────────────────────────────────────────────
//  TRACE — Safe Static File Path Resolver
//  Enforces strict boundary containment within dist directory
// ─────────────────────────────────────────────────────────────

import path from "node:path";

export function resolveSafeStaticPath(distDir, requestUrl) {
  let reqPath = "/";
  try {
    reqPath = decodeURIComponent(String(requestUrl || "/").split("?")[0]);
  } catch (_) {
    return { safeFilePath: null, isInsideDist: false, isMalformed: true };
  }

  const resolvedDist = path.resolve(distDir);
  const cleanRel = reqPath.replace(/^[\\/\\]+/, "");
  const safeFilePath = path.resolve(resolvedDist, cleanRel);

  const isInsideDist =
    safeFilePath.startsWith(resolvedDist + path.sep) || safeFilePath === resolvedDist;

  return {
    safeFilePath,
    isInsideDist,
    isMalformed: false
  };
}
