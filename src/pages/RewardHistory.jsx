import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getAllUserRewards } from '../services/reward';


const RewardHistory = () => {

  const { userId } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['userRewardHistory', userId],
    queryFn: () => getAllUserRewards(userId),
    enabled: !!userId,
  });

  const userReward = data?.data?.users?.[0];

  if (isLoading) return <p>Loading history...</p>;
  if (isError || !data) return <p>Error loading reward history</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h2 className="text-xl font-bold mb-4">Reward Activity for {data?.userId?.name}</h2>
      <div className="bg-white shadow rounded-lg p-4 space-y-3">
        {userReward?.history?.map((entry) => (
          <div key={entry._id} className="border-b pb-2">
            <div className="flex justify-between text-sm">
              <span>{entry.action} {entry.points > 0 ? `+${entry.points}` : entry.points} pts</span>
              <span>{new Date(userReward?.createdAt).toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-500">{entry.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RewardHistory;