export async function linkToBase64( link: string ): Promise<string> {
    const response = await fetch(link);
    if(!response) throw new Error("Failed to fetch image form link");

    const arrayBuffer = await response.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString('base64');

    return base64String;
}