export function textToBuffer(text: string) {
  const ascii_string = unescape(encodeURIComponent(text)); // 間にこれを噛まさないと文字化けする
  const buffer = new Uint8Array(ascii_string.length);
  for (let i = 0; i < ascii_string.length; i++) {
    buffer[i] = ascii_string.charCodeAt(i);
  }

  return buffer;
}
