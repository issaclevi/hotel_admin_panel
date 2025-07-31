import api from './api';
import { jwtDecode } from 'jwt-decode';

export const authLogin = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  console.log(response);
  

  return {
    userData: response.data.data,
    user: jwtDecode(response.data.data.accessToken),
    accessToken: response.data.data.accessToken,
    refreshToken: response.data.data.refreshToken,
  };
};

// export const validateToken = async () => {
//   return await api.get('/auth/validate-token');
// };
