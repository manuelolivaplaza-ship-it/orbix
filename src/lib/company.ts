export function selectActiveCompany<T extends { id: string }>(
  companies: T[],
  activeId: string | null | undefined,
): T | null {
  if (!companies.length) return null;
  if (activeId) {
    const found = companies.find((company) => company.id === activeId);
    if (found) return found;
  }
  return companies[0];
}

export function switchActiveCompany(
  currentId: string,
  nextId: string,
  companyIds: string[],
): string {
  if (!companyIds.includes(nextId)) return currentId;
  return nextId;
}

export function filterByCompany<T extends { companyId: string }>(
  items: T[],
  companyId: string,
): T[] {
  return items.filter((item) => item.companyId === companyId);
}
