/**
 * Checks if a numerical number exists in a string.
 */
export function numberPresent(text: string) {
    const numberRegex = /\d+/;
    return numberRegex.test(text);
}