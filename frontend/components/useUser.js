'use client';
// frontend/components/useUser.js
//
// Reusable hook — call this anywhere in the dashboard to get the logged-in user.
// It hits your existing /api/user route which calls Keycloak's userinfo endpoint.
//
// Usage:
//   const { user, loading } = useUser();
//   <h1>Welcome, {user?.given_name}!</h1>

import { useState, useEffect } from 'react';

export function useUser() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user')
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Helpers — Keycloak returns given_name, family_name, preferred_username, email, sub
  const firstName   = user?.given_name        || user?.preferred_username || 'Traveller';
  const lastName    = user?.family_name        || '';
  const fullName    = lastName ? `${firstName} ${lastName}` : firstName;
  const email       = user?.email              || '';
  const userId      = user?.sub                || '';
  const initials    = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'KP';

  return { user, loading, firstName, lastName, fullName, email, userId, initials };
}