import api from './api';

export const createRoom = async (roomData) => {
    return await api.post('/room/room-create', roomData);
};

export const getAllUserRewards = async () => {
    const res = await api.get(`/reward/getallrewards`,);
    return res.data;
};

export const getUserRewards = async (userId) => {
    const res = await api.get(`/reward/getallrewards?userId${userId}`);
    return res.data;
};