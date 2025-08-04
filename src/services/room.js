import api from './api';

export const createRoom = async (roomData) => {
    return await api.post('/hotel/hotel-create', roomData);
};

export const getAllRooms = async () => {
    const res = await api.get('/hotel/getAllRooms');
    return res.data;
};

export const getRoomAvailability = async (id, date) => {
    const res = await api.get(`/room/${id}/availability?date=${date}`);
    return res.data;
};

export const updateRoom = async (id, roomData) => {
    const res = await api.put(`/room/updateRoom/${id}`, roomData);
    return res.data;
};

export const deleteRoom = async (id) => {
    const res = await api.delete(`/room/deleteRoom/${id}`);
    return res.data;
};