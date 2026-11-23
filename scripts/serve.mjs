import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import serve from "serve-handler";

const port = Number(process.env.PORT ?? 3000);
const output = fileURLToPath(new URL("../out/", import.meta.url));

createServer((request, response) => serve(request, response, {
  public: output,
  cleanUrls: false,
  headers: [{ source: "sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] }],
})).listen(port, "0.0.0.0", () => console.log("Học Trình: http://localhost:" + port));
