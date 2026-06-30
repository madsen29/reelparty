/** Short random id used for users and queue items. */
export const rid = (): string => Math.random().toString(36).slice(2, 10);

/** Random 5-digit party code. */
export const code5 = (): string =>
  String(Math.floor(10000 + Math.random() * 90000));
