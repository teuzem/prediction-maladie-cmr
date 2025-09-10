export const checkPasswordStrength = (password: string) => {
  let score = 0;
  if (!password) return 0;

  // Critères de notation
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  return score;
};
