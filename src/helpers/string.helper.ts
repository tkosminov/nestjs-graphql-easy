export function capitalize(str: string) {
  const capital_char = str[0].toUpperCase();

  return capital_char + str.slice(1);
}
