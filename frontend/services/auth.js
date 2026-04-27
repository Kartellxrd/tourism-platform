// Since token is in HTTP-only cookie, we can't read it in JS
// The browser sends it automatically with credentials: 'include'
export const auth = {
  isLoggedIn: async () => {
    try {
      const response = await fetch('/api/user', {
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    }
  },
  
  logout: async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/login';
  }
};