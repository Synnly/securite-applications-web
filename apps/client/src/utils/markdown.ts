/**
 * Delete markdown syntax from a string
 * @param markdown The markdown string to strip
 * @returns The plain text string
 */
export function stripMarkdown(markdown: string): string {
    return (
        markdown
            // Delete headings #, ##, ###, etc.
            .replace(/^#{1,6}\s+/gm, '')
            // Delete bold **text** and italic *text*
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            // Delete links [text](url)
            .replace(/\[(.+?)\]\(.+?\)/g, '$1')
            // Delete images ![alt](url)
            .replace(/!\[(.*?)\]\(.+?\)/g, '$1')
            // Delete numbered lists
            .replace(/^\d+\.\s+/gm, '')
            // Delete bulleted lists (- * +)
            .replace(/^[-*+]\s+/gm, '')
            // Delete code blocks ```
            .replace(/```[\s\S]*?```/g, '')
            // Delete inline code `code`
            .replace(/`(.+?)`/g, '$1')
            // Delete blockquotes > quote
            .replace(/^>\s+/gm, '')
            // Delete horizontal lines
            .replace(/^---+$/gm, '')
            // Delete multiple line breaks
            .replace(/\n{3,}/g, '\n\n')
            .trim()
    );
}
