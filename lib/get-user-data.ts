import type { UserData } from '../src/types';
import { getDbClient } from './dynamo-db';

export const getUserData = async (userHash: string): Promise<UserData> => {
  const client = getDbClient();
  const initialUserData: UserData = {
    type: 'user',
    current_level: '1',
    id: userHash,
    weak_cards: {},
    learned_cards: [],
  };
  const data = await client.get({
    Key: {
      id: userHash,
    },
  });

  return {
    ...initialUserData,
    current_level: data.Item?.current_level || initialUserData.current_level,
    weak_cards: data.Item?.weak_cards || initialUserData.weak_cards,
    learned_cards: data.Item?.learned_cards || initialUserData.learned_cards,
  };
};
