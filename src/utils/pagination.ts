export const generateCursor = (createdAt: string, id: string): string => {
  return `${createdAt}_${id}`;
};

export const parseCursor = (cursor: string): { createdAt: string; id: string } | null => {
  const parts = cursor.split('_');
  if (parts.length !== 2) return null;
  
  return {
    createdAt: parts[0]!,
    id: parts[1]!
  };
};

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;