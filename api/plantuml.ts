import { createHash } from "../src/deps.ts";
import { ServerRequest } from "../src/deps_pinned.ts";
import { fetchText } from "../src/fetch.ts";
import { toPlantUMLURL } from "../src/toPlantUMLURL.ts";

export default async (req: ServerRequest) => {
  const base = `${req.headers.get("x-forwarded-proto")}://${
    req.headers.get(
      "x-forwarded-host",
    )
  }`;
  const url = new URL(req.url, base);

  // ETagを取得する
  const prevETag = req.headers.get("If-None-Match");

  // plantUMLのURLを取得する
  const params = url.searchParams;
  const plantumlURL = params.get("url");
  if (!plantumlURL) {
    req.respond({ status: 400, body: "No plantuml URL found." });
    return;
  }
  const imageType = params.get("type");
  if (!imageType) {
    req.respond({ status: 400, body: "No image type is specified." });
    return;
  }
  if (imageType !== "png" && imageType !== "svg") {
    req.respond({ status: 400, body: "Image type must be 'png' or 'svg'." });
    return;
  }

  try {
    const text = await fetchText(plantumlURL);
    // ETagを作る
    const hash = createHash("md5");
    hash.update(text);
    const eTag = `W/"${hash.toString()}"`;
    if (eTag === prevETag) {
      req.respond({ status: 304 });
      return;
    }

    const headers = new Headers();
    const path = toPlantUMLURL(text, imageType);
    console.log(`Go to "${path}"`);
    headers.set("location", path);
    req.respond({
      status: 301,
      headers,
    });
  } catch (e) {
    req.respond({ status: 400, body: e.message });
  }
};
