// Empty or invalid CMS values leave the existing stylesheet colors in control.
export function cmsColorStyle(value) {
  const color = typeof value === 'string' ? value.trim() : '';
  return /^#[0-9a-fA-F]{6}$/.test(color) ? { color } : undefined;
}
