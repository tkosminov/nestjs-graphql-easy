export function toBoolean(value?: boolean | string) {
  if (typeof value === 'undefined') {
    return undefined;
  } else if (typeof value === 'boolean') {
    return value;
  } else {
    if (value.toLowerCase() === 'false') {
      return false;
    }

    if (value.toLowerCase() === 'true') {
      return true;
    }

    return undefined;
  }
}

export function toArray(value?: unknown[] | string) {
  if (typeof value === 'undefined') {
    return undefined;
  } else if (Array.isArray(value)) {
    return value;
  } else {
    try {
      const arr = JSON.parse(value);

      if (Array.isArray(arr)) {
        return arr;
      }
    } catch {
      // continue
    }

    return undefined;
  }
}

export function toNumber(value?: number | string) {
  if (typeof value === 'undefined') {
    return undefined;
  } else if (typeof value === 'number') {
    return value;
  } else {
    try {
      const num = parseFloat(value);

      if (!Number.isNaN(num)) {
        return num;
      }
    } catch {
      // continue
    }

    return undefined;
  }
}
