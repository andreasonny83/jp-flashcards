import { AppState, AppAction, AppActionType } from "./types";

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case AppActionType.LOAD_DATA: {
      const remainingCards = action.payload.cardIds.filter(
        (cardId) => cardId !== action.payload.nextCard
      );
      const random = Math.floor(Math.random() * remainingCards.length);
      const nextCard = remainingCards[random];

      return {
        ...state,
        remainingCards,
        nextCard: `${nextCard}`,
        currentCard: `${action.payload.nextCard}`,
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

    case AppActionType.SET_GAME: {
      return {
        ...state,
        gameMode: action.payload.gameMode,
      };
    }

    default:
      return state;
  }
}
