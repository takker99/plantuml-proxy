import {ServerRequest} from "https://deno.land/std/http/server.ts";
import {fetchText, fetchImage, respondImage} from "../src/fetch.ts";

export default async (req: ServerRequest) => {
    const base = `${req.headers.get("x-forwarded-proto")}://${req.headers.get(
        "x-forwarded-host"
    )}`;
    const url = new URL(req.url, base);

    // plantUMLのURLを取得する
    const params = url.searchParams;
    const plantumlURL = params.get("url");
    if (!plantumlURL) {
        req.respond({status: 400, body: "No plantuml URL found."});
        return;
    }
    const imageType = params.get("type");
    if (!imageType) {
        req.respond({status: 400, body: "No image type is specified."});
        return;
    }
    if (imageType !== 'png' && imageType !== 'svg') {
        req.respond({status: 400, body: "Image type must be 'png' or 'svg'."});
        return;
    }

    try {
        const plantumlBody = await fetchText(plantumlURL);
        const imageData = await fetchImage(plantumlBody, imageType);
        const buffer = new Uint8Array(await imageData.arrayBuffer())
        respondImage(buffer, imageData.type, req);
    } catch (e) {
        req.respond({status: 400, body: e.message});
    }
};
