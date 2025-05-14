/**
 * Capitalizes the first letter of each word in a string
 * @param str The string to capitalize
 * @returns The string with the first letter of each word capitalized
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return str;
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
