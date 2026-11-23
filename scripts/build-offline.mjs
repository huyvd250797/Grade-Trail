import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const output = fileURLToPath(new URL("../out/", import.meta.url));
const paths = (await readdir(output, { recursive: true, withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => relative(output, join(entry.parentPath, entry.name)).split(sep).join("/"))
  .filter((path) => !["sw.js", "404.html"].includes(path) && !path.startsWith("404/") && !path.startsWith("_not-found/"))
  .sort();

const hash = createHash("sha256");
const template = await readFile(new URL("./sw-template.js", import.meta.url), "utf8");
hash.update(template);
for (const path of paths) {
  hash.update(path);
  hash.update(await readFile(join(output, path)));
}

const urls = paths.map((path) => path === "index.html" ? "/" : "/" + path);
await writeFile(join(output, "sw.js"), template
  .replace("__CACHE_NAME__", "gradetrail-" + hash.digest("hex").slice(0, 16))
  .replace("__PRECACHE__", JSON.stringify(urls)));
