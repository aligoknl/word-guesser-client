import { defineStore } from "pinia";
import { ref } from "vue";
import { useWordStore } from "./wordStore";
import { useScoreStore } from "./scoreStore";

export const useGameStore = defineStore("gameStore", () => {
  const username = ref<string>("");
  const isGameInProgress = ref<boolean>(false);
  const score = ref<number>(0);
  const wordStore = useWordStore();
  const scoreStore = useScoreStore();

  const setUsername = (name: string) => {
    username.value = name;
  };

  const startGame = () => {
    isGameInProgress.value = true;
    wordStore.fetchRandomWord();
    score.value = 0;
  };

  const endGame = () => {
    isGameInProgress.value = false;
    if (score.value > 0) {
      scoreStore.submitScore(username.value, score.value);
    }
    username.value = ""; // Reset username after the game ends
  };

  const calculateScore = (attempts: number, timeTaken: number) => {
    score.value = 1200 - (attempts * 50 + timeTaken * 5);
    if (score.value < 0) {
      score.value = 0;
    }
  };

  return {
    username,
    isGameInProgress,
    score,
    setUsername,
    startGame,
    endGame,
    calculateScore,
  };
});
