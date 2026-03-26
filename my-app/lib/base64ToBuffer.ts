export function base64ToBuffer(base64String: string): Buffer{
    const parts = base64String.split(";");
    //const mimeType = parts[0].split(":")[1];
    const rawBase64 = parts[1].split(",")[1];  

    const buffer = Buffer.from(rawBase64, 'base64');

    return buffer;
}