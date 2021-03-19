import {ServerRequest} from "https://deno.land/std/http/server.ts";
import {deflate} from "https://deno.land/x/denoflate@1.1/mod.ts";
import {encode64} from "./encoder.ts";
import {textToBuffer} from "./converter.ts";

export async function fetchText(url: string) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Text response is not OK");
    }
    const text = await response.text();
    if (!text.trim()) {
        throw new Error(`Text is empty`);
    }
    return text;
}

export async function fetchImage(text: string, imageType: 'png' | 'svg') {
    const response = await fetch(`http://www.plantuml.com/plantuml/${imageType}/${encode64(deflate(textToBuffer(text), 9))}`);
    if (!response.ok) {
        throw new Error("Failed to fetch a plantUML image from the PlantUML server");
    }
    return await response.blob();
}

export function respondImage(imageData: Uint8Array, mimeType: string, req: ServerRequest, options: {eTag: string}) {
    const headers = new Headers();
    headers.set("Content-Type", `${mimeType}; charaset=utf-8`);
    headers.set("Cache-Control", "private, max-age=0");
    headers.set("ETag", options.eTag);
    req.respond({
        headers,
        body: imageData,
    });
}
