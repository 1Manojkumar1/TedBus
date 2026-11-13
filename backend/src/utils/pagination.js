/**
 * Reads ?page & ?limit. A plain array response is kept when neither is given,
 * so existing clients (and the app's own route list) keep working unchanged.
 */
export function parsepagination(query, { defaultlimit = 20, maxlimit = 100 } = {}) {
  const requested = query.page !== undefined || query.limit !== undefined;
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    maxlimit,
    Math.max(1, Number.parseInt(query.limit, 10) || defaultlimit)
  );

  return { page, limit, skip: (page - 1) * limit, requested };
}

export function paginated(items, total, { page, limit }) {
  return {
    items,
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}
