import * as _ from "underscore";

export function normalizeTag(tag?: string): string | undefined {
  return tag === undefined || tag.includes('@')
    // Tag is not provided or already includes a @
    ? tag
    // If a tag doesn't include any @, for compatibility, prefix it with a @
    : `@${tag}`;
}
