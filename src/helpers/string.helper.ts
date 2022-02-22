export function capitalize(str: string) {
  const capitalized_chars = str.replace(/[-_\s.]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
  const capital_char = capitalized_chars[0].toUpperCase();

  return capital_char + capitalized_chars.slice(1);
}
