import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getAllUserRewards } from '../services/reward';

const Reward = () => {
    const navigate = useNavigate();

    const { data: users, isLoading, isError } = useQuery({
        queryKey: ['userRewards'],
        queryFn: getAllUserRewards,
    });

    const rewards = users?.data?.users || [];

    if (isLoading) return <p className="text-center">Loading...</p>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
            <h2 className="text-2xl font-bold text-black mb-6">Top Reward Users</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                {rewards.map((user) => (
                    <div
                        key={user?._id}
                        className="bg-white rounded-lg shadow-md px-6 py-5 cursor-pointer hover:shadow-lg transition"
                        onClick={() => navigate(`/reward-history/${user?.userId?._id}`)}
                    >
                        <div className="flex items-center space-x-4">
                            <img
                                src={user?.userId?.profilePic}
                                alt={user?.userId?.name}
                                className="w-14 h-14 rounded-full bg-green-400"
                            />
                            <div>
                                <div className="text-black font-semibold">{user?.userId?.name}</div>
                                <div className="text-black text-sm">{user?.userId?.email}</div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-around text-center">
                            <div>
                                <div className="text-green-600 text-xl font-bold">{user?.lifetimePoints?.earned}</div>
                                <div className="text-green-600 text-sm">Earned</div>
                            </div>
                            <div>
                                <div className="text-blue-600 text-xl font-bold">{user?.lifetimePoints?.used}</div>
                                <div className="text-blue-600 text-sm">Used</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reward;