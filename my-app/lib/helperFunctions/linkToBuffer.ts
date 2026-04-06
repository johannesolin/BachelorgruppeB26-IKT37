import { fileTypeFromBuffer } from "file-type";
import { BufferAndType } from "../types";


export async function linkToBuffer( link: string ): Promise<BufferAndType> {
    const response = await fetch(link);
    if(!response) throw new Error("Failed to fetch image form link");

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const linkFileType = await fileTypeFromBuffer(buffer);
    const fileType = String(linkFileType?.mime);

    return {buffer, fileType}
}