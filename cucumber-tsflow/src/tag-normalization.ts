export function normalizeTag(tag?: string): string | undefined {
    // Tag is not provided or already includes a @
    if (tag === undefined || tag.includes('@')) return undefined;

    // If a tag doesn't include any @, for compatibility, prefix it with a @

    console.warn('cucumber-tsflow ')
    return `@${tag}`;
}
