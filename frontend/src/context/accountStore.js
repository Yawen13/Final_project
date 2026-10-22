import { createContext, useContext } from 'react';

// The resolved profile (name, handle, bio, avatar) for the signed-in account.
// App.jsx owns the session + GET /users lookup; the navbar and sidebars read it
// from here so every avatar in the UI matches.
export const AccountContext = createContext(null);

export function useAccount() {
  return useContext(AccountContext);
}
