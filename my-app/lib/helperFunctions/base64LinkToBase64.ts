export function base64LinkToBase64(base64String: string): string{
    const parts = base64String.split(";");
    const rawBase64 = parts[1].split(",")[1]; 

    return rawBase64;
}