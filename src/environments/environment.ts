// Producción: mismo origen; los rewrites de render.yaml reenvían /api/v1/auth a shared-expenses-auth-service y
// el resto de /api a shared-expenses-service. Así las cookies HttpOnly de la sesión son del propio sitio.
export const environment = {
  apiUrl: '/'
};
