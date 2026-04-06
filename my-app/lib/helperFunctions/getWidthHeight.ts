export function getWidthHeight( size: string ): { width: string, height: string }{
    const widthHeight = size.split("x");
    const width = widthHeight[0];
    const height = widthHeight[1];

    return {width, height}
}