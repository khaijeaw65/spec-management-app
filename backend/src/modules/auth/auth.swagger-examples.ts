export const loginExample = {
  email: 'analyst@example.com',
  password: 'SecurePass2024!', // NOSONAR - swagger example (not a real secret)
} as const;

export const refreshTokenExample = {
  refreshToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTcxMzAwMDgwMH0.signature-placeholder', // NOSONAR - swagger example (not a real token)
} as const;

export const registerExample = {
  email: 'new.user@example.com',
  password: 'SecurePass2024!', // NOSONAR - swagger example (not a real secret)
  firstName: 'Somchai',
  lastName: 'Prasert',
} as const;
