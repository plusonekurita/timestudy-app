export const isEmpty = (value) => {
  if (value == null) return true; // null または undefined
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false; // 数値・boolean などは空とはみなさない
};
