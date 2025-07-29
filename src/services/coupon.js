import api from './api';

export const createCoupon = async (couponData) => {
    const res = await api.post('/coupon/create-coupon', couponData);
    return res.data;
};

export const getAllCoupons = async () => {
    const res = await api.get('/coupon/getallcoupons');
    return res.data;
};

export const updateCoupon = async (id, payload) => {
    const res = await api.put(`/coupon/update-coupon/${id}`, payload);
    return res.data;
};

export const deleteCoupon = async (id) => {
    const res = await api.delete(`/coupon/delete-coupon/${id}`);
    return res.data;
};