import { deflate } from "./deps.ts";
import { encode64 } from "./encoder.ts";
import { textToBuffer } from "./converter.ts";

export const toPlantUMLURL = (uml: string, imageType: "png" | "svg") =>
  `http://www.plantuml.com/plantuml/${imageType}/${
    encode64(deflate(textToBuffer(uml), 9))
  }`;
