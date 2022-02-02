import { AppState, AppAction, AppActionType } from "./types";

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case AppActionType.LOAD_DATA: {
      if (state.currentCard) {
        return state;
      }

      const remainingCards = action.payload.cardIds.filter(
        (cardId) => cardId !== action.payload.randomCard
      );
      const random = Math.floor(Math.random() * remainingCards.length);
      const nextCard = remainingCards[random];

      return {
        ...state,
        remainingCards,
        nextCard: `${nextCard}`,
        currentCard: `${action.payload.randomCard}`,
        usedCards: [],
      };
    }

    case AppActionType.NEXT_CARD: {
      const newCurrentCard = state.nextCard;
      const newRemainingCards = state.remainingCards.filter(
        (card) => card !== newCurrentCard
      );

      const random = Math.floor(Math.random() * newRemainingCards.length);

      const nextCard = newRemainingCards.length
        ? newRemainingCards[random]
        : "";

      const newUsedCards = [...state.usedCards, state.currentCard];

      return {
        ...state,
        currentCard: `${newCurrentCard}`,
        nextCard: `${nextCard}`,
        remainingCards: newRemainingCards,
        usedCards: newUsedCards,
      };
    }

    default:
      return state;
  }
}