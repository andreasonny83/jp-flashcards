import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo } from 'react';
import { useApp } from '../AppState';

interface UserStatsProps {}

export const UserStats: React.FC<UserStatsProps> = ({}) => {
  const { userLoggedIn, userStats, fetchUserData, gameMode } = useApp();

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const weakCardsCopy = useMemo(() => {
    if (!userStats?.weakCards) {
      return null;
    }

    if (userStats.weakCards === 1) {
      return 'You only have 1 word to improve';
    }
    return `You have ${userStats.weakCards} word to improve`;
  }, [userStats?.weakCards]);

  const learnedCardsCopy = useMemo(() => {
    if (!userStats?.learnedCards) {
      return null;
    }

    if (!userStats.learnedCards) {
      return "You haven't learned any word yet";
    }
    if (userStats.learnedCards === 1) {
      return 'You know only 1 word for now';
    }
    return `You have studied a total of ${userStats.learnedCards} words so far`;
  }, [userStats?.learnedCards]);

  if (!userLoggedIn || !userStats || gameMode !== 'train') {
    return null;
  }

  return (
    <Box sx={{ my: 4 }}>
      <Box sx={{ pb: 2 }}>
        <Typography>Your current level is {userStats.level}</Typography>
        <Typography>{learnedCardsCopy}</Typography>
        {(userStats.learnedCards && userStats.weakCards && <Typography>{weakCardsCopy}</Typography>) || null}
      </Box>
      <Typography>That{"'"}s amazing. Keep learning!</Typography>
    </Box>
  );
};