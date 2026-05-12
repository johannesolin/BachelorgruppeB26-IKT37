export function formatDate(raw: string): string {
    try {
        return new Date(raw).toLocaleString("nb-NO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return raw;
    }
}
