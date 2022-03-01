import { createHash } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { getDbClient } from '../../lib/dynamo-db';
import { getUserData } from '../../lib/get-user-data';
import { CardResult, UserData } from '../../src/types';
interface InputData {
  cardId: string;
  cardResult: CardResult;
}

const updateUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const { cardId, cardResult }: InputData = JSON.parse(req.body || '{}');
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  if (!cardId || !cardResult) {
    return res.status(400).json({ error: 'Missing data' });
  }

  if (cardResult !== 'correct' && cardResult !== 'wrong') {
    return res.json({});
  }

  const userHash = createHash('sha256').update(session.user.email).digest('hex');
  const userData = await getUserData(userHash);
  const updatedUserData: UserData = {
    ...userData,
    learned_cards: [...userData.learned_cards],
    weak_cards: { ...userData.weak_cards },
  };
  const weakCards = updatedUserData.weak_cards;
  const learnedCards = updatedUserData.learned_cards;
  const isWeakCard = Boolean(weakCards[cardId]);
  const isLearnedCard = Boolean(updatedUserData.learned_cards.find((card) => card === cardId));
  const cardAccuracy = (isWeakCard && Number(weakCards[cardId])) || 0;
  const currentAccuracyScore = Number(cardResult === 'correct' ? 100 : 0);
  const newAccuracy = Math.floor(Number((cardAccuracy + currentAccuracyScore) / 2));

  if (isLearnedCard && cardResult === 'correct') {
    return res.json({});
  }

  // Remove from learned cards, when user fails to answer
  if (isLearnedCard && cardResult === 'wrong') {
    updatedUserData.learned_cards = learnedCards.filter((card) => card !== cardId);
  }

  // Add card to weak cards, if not already
  if (!isWeakCard && cardResult === 'wrong') {
    weakCards[cardId] = '0';
  }

  // Update weak card accuracy
  weakCards[cardId] = `${newAccuracy}`;

  // Remove card from weak and add it to learned cards when accuracy is higher 95%
  if (newAccuracy >= 95) {
    delete weakCards[cardId];
    learnedCards.push(`${cardId}`);
  }

  const accessKeyId = process.env.NEXT_DYNAMO_WRITE_KEY;
  const secretAccessKey = process.env.NEXT_DYNAMO_WRITE_SECRET;
  const client = getDbClient(accessKeyId, secretAccessKey);

  await client.put({ Item: updatedUserData });

  res.status(204).json({});
};

export default updateUser;
