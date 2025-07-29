import api from './api';

export const createSpaceType = async (spaceData) => {
    const res = await api.post('/spacetype/create-spacetype', spaceData);
    return res.data;
};

export const getAllSpaceType = async () => {
    const res = await api.get('/spacetype/getallspacetypes');
    return res.data;
};

export const updateSpaceType = async (id, payload) => {
    const res = await api.put(`/spacetype/update-spacetype/${id}`, payload);
    return res.data;
};

export const deleteSpaceType = async (id) => {
    const res = await api.delete(`/spacetype/delete-space/${id}`);
    return res.data;
};