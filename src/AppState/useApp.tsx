import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSession, signIn, signOut } from "next-auth/react";
import { createHash } from "crypto";

import { AppContext } from "./AppContext";
import { AppActionType, GameLevel, GameMode } from "./types";

export function useApp() {
  const router = useRouter();
  const context = useContext(AppContext);
  const audioPlayer = useRef<HTMLAudioElement>();
  const { data: session } = useSession();
  const [userHash, setUserHash] = useState<string>();

  if (!context) {
    throw new Error(`useApp must be used within an AppProvider`);
  }

  const { state, dispatch } = context;

  useEffect(() => {
    if (session?.user?.email) {
      const hash = createHash("sha256").update(session.user.email).digest("hex");
      setUserHash(hash);
    } else {
      setUserHash(null);
    }
  }, [session]);

  const loadData = useCallback(
    (cardIds: string[]) => {
      const nextCard = cardIds[String(Math.floor(Math.random() * cardIds.length))];

      dispatch({
        type: AppActionType.LOAD_DATA,
        payload: { cardIds, nextCard },
      });

      return router.push(`/shuffle/${nextCard}`);
    },
    [dispatch, router]
  );

  const setGame = useCallback(
    (gameMode: GameMode) => {
      dispatch({
        type: AppActionType.SET_GAME,
        payload: gameMode,
      });
    },
    [dispatch]
  );

  const setLevel = useCallback(
    (gameLevel: GameLevel) => {
      dispatch({
        type: AppActionType.SET_LEVEL,
        payload: gameLevel,
      });
    },
    [dispatch]
  );

  const goHome = useCallback(() => {
    router.push(`/`);
  }, [router]);

  const loadSound = useCallback(
    async (audio: string) => {
      if (!session) {
        return;
      }

      dispatch({
        type: AppActionType.LOADING_SOUND,
        payload: true,
      });

      fetch("/api/play", {
        method: "POST",
        body: JSON.stringify({ audio }),
      })
        .then((response) => response.json())
        .then((response) => response.data || "")
        .then((response: string) => {
          const audioData = Buffer.from(response, "hex");
          const blob = new Blob([audioData], { type: "audio/mpeg" });
          const audioSrc = webkitURL.createObjectURL(blob);
          audioPlayer.current = new Audio(audioSrc);
          audioPlayer.current.load();
        })
        .catch(() => {
          // User unauthenticated. The audio won't work unless the users logs in
        })
        .finally(() => {
          dispatch({
            type: AppActionType.LOADING_SOUND,
            payload: false,
          });
        });
    },
    [dispatch, session]
  );

  const playSound = useCallback(() => {
    if (!session) {
      return;
    }

    audioPlayer.current?.load();
    audioPlayer.current?.play();
  }, [session]);

  const unloadSound = useCallback(() => {
    if (!session) {
      return;
    }

    audioPlayer.current?.load();
    audioPlayer.current?.pause();
    audioPlayer.current = undefined;
  }, [session]);

  const nextCard = useCallback(() => {
    unloadSound();
    dispatch({ type: AppActionType.NEXT_CARD });

    if (state.nextCard) {
      router.push(`/shuffle/${state.nextCard}`);
    }
  }, [dispatch, router, state.nextCard, unloadSound]);

  return {
    currentCard: state.currentCard,
    gameMode: state.gameMode,
    gameLevel: state.gameLevel,
    loading: Boolean(state.loading),
    isUserLoggedIn: Boolean(session),
    canPlaySounds: Boolean(session),
    signIn: useCallback(() => signIn(), []),
    signOut: useCallback(() => signOut(), []),
    userHash,
    setGame,
    setLevel,
    loadData,
    loadSound,
    unloadSound,
    nextCard,
    goHome,
    playSound,
  };
}
