export function getBillSharePath(billId: string): string {
  return `/bill/${billId}`;
}

export function getAppBaseUrl(origin?: string): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (origin) {
    return origin.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export function getBillShareUrl(
  billId: string,
  options?: { password?: string; origin?: string },
): string {
  const baseUrl = getAppBaseUrl(options?.origin);
  const path = getBillSharePath(billId);

  if (options?.password) {
    return `${baseUrl}${path}#${encodeURIComponent(options.password)}`;
  }

  return `${baseUrl}${path}`;
}
