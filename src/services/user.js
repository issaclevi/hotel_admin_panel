import api from './api';

export const createBooking = async () => {
  return await api.post('/booking/booking-create');
};

export const getAllUsers = async () => {
    const res = await api.get('/user/getAllUsers');
    return res.data;
  };
  