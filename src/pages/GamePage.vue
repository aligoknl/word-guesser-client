<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from "vue";
import { useWordStore } from "../store/wordStore";
import { useScoreStore } from "../store/scoreStore";
import { useGameStore } from "../store/gameStore";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import MessageDisplay from "../components/MessageDisplay.vue";
import InputGrid from "../components/InputGrid.vue";
import GameButton from "../components/GameButton.vue";

const router = useRouter();
const wordStore = useWordStore();
const scoreStore = useScoreStore();
const gameStore = useGameStore();
const { username, score } = storeToRefs(gameStore);
const { randomWord, loading, error, validationError } = storeToRefs(wordStore);
const targetWord = ref<string>("");
const guesses = ref<string[][]>([["", "", "", "", ""]]);
const inputRefs = ref<Record<string, HTMLInputElement | null>>({});
const isGameInProgress = ref<boolean>(false);
const timer = ref<number>(120); // 2 minutes countdown in seconds
let timerInterval: NodeJS.Timeout | null = null;
const isSuccess = ref<boolean>(false);
const isGameEnded = ref<boolean>(false);
const maxAttempts = ref<number>(10);
const maxScore = ref<number>(1200);
const shakeClass = ref<boolean>(false);
const maxTime = <number>120;

const handleLetterChange = ({
  guessIndex,
  index,
  event,
}: {
  guessIndex: number;
  index: number;
  event: Event;
}) => {
  const input = event.target as HTMLInputElement;
  const newLetter = input.value.slice(-1).toUpperCase();
  if (newLetter.match(/[A-Z]/i)) {
    guesses.value[guessIndex][index] = newLetter;
    if (index < 4) {
      nextTick(() => {
        const nextKey = `${guessIndex}-${index + 1}`;
        (
          document.querySelector(
            `input[ref-key="${nextKey}"]`
          ) as HTMLInputElement
        )?.focus();
      });
    } else if (guessIndex === guesses.value.length - 1) {
      handleSubmitGuess();
    }
  }
};

const handleSubmitGuess = async () => {
  const currentGuess = guesses.value[guesses.value.length - 1];
  if (currentGuess.some((letter) => letter === "")) return;

  const guessWord = currentGuess.join("");
  const isValidWord = await wordStore.validateWord(guessWord);

  if (!isValidWord) {
    validationError.value = `The word "${guessWord}" is not valid. Please enter a valid word.`;
    guesses.value[guesses.value.length - 1] = ["", "", "", "", ""];
    nextTick(() => {
      const firstKey = `0-0`;
      (
        document.querySelector(
          `input[ref-key="${firstKey}"]`
        ) as HTMLInputElement
      )?.focus();
    });
    shakeClass.value = true;
    setTimeout(() => {
      shakeClass.value = false;
    }, 500);
    return;
  }

  validationError.value = null;

  if (guessWord === targetWord.value) {
    if (timerInterval) clearInterval(timerInterval);
    isGameInProgress.value = false;
    isSuccess.value = true;
    calculateScore();
    scoreStore.submitScore(username.value, score.value);
  } else {
    if (guesses.value.length === maxAttempts.value) {
      if (timerInterval) clearInterval(timerInterval);
      isGameInProgress.value = false;
      isSuccess.value = false;
      calculateScore();
    } else {
      addNewGuessRow();
    }
  }
};

const addNewGuessRow = () => {
  guesses.value.push(["", "", "", "", ""]);
  nextTick(() => {
    const firstKey = `0-0`;
    (
      document.querySelector(`input[ref-key="${firstKey}"]`) as HTMLInputElement
    )?.focus();
  });
};

const startNewGame = async () => {
  try {
    await wordStore.fetchRandomWord();
    targetWord.value = randomWord.value;
    guesses.value = [["", "", "", "", ""]];
    isGameInProgress.value = true;
    isSuccess.value = false;
    isGameEnded.value = false;
    score.value = maxScore.value;
    timer.value = maxTime;
    startTimer();
    validationError.value = null;

    await nextTick();
    const firstKey = `0-0`;
    (
      document.querySelector(`input[ref-key="${firstKey}"]`) as HTMLInputElement
    )?.focus();
  } catch (error) {
    console.error("Failed to start new game:", error);
  }
};

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timer.value > 0) {
      timer.value -= 1;
    } else {
      if (timerInterval) clearInterval(timerInterval);
      isGameInProgress.value = false;
      isSuccess.value = false;
      calculateScore();
    }
  }, 1000);
};

const endGameImmediately = () => {
  if (timerInterval) clearInterval(timerInterval);
  isGameEnded.value = true;
  isGameInProgress.value = false;
  isSuccess.value = false;
  calculateScore();
};

const calculateScore = () => {
  validationError.value = null;
  const attempts = guesses.value.length - 1;
  const timeTaken = maxTime - timer.value;
  if (isSuccess.value) {
    gameStore.calculateScore(attempts, timeTaken);
  } else {
    score.value = 0;
  }
  if (score.value < 0) {
    score.value = 0;
  }
};

const navigateToLandingPage = () => {
  router.push({ name: "LandingPage" });
};

onMounted(() => {
  startNewGame();
});
</script>

<template>
  <div class="app">
    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>
    <div v-if="!loading && !error" class="container">
      <p v-if="validationError" class="validation-error">
        {{ validationError }}
      </p>
      <section v-if="!isGameInProgress" class="message">
        <MessageDisplay
          :isGameInProgress="isGameInProgress"
          :guesses="guesses"
          :targetWord="targetWord"
          :timer="timer"
          :isSuccess="isSuccess"
          :maxAttempts="maxAttempts"
          :maxTime="maxTime"
          :score="score"
          :isGameEnded="isGameEnded"
        ></MessageDisplay>
        <div class="game-buttons">
          <GameButton
            v-if="!isGameInProgress"
            label="Play New Game"
            @click="startNewGame"
          ></GameButton>
          <GameButton
            v-if="!isGameInProgress"
            label="Go to Home"
            @click="navigateToLandingPage"
            class="end-game-btn"
          ></GameButton>
        </div>
      </section>
      <div v-else>
        <p class="feedback">
          Guess the 5-letter word in maximum {{ maxAttempts }} attempts
        </p>
        <p class="timer">
          Time left: {{ Math.floor(timer / 60) }}:{{
            (timer % 60).toString().padStart(2, "0")
          }}
        </p>
        <InputGrid
          :guesses="guesses"
          :targetWord="targetWord"
          :isGameInProgress="isGameInProgress"
          :shakeClass="shakeClass"
          @letterChange="handleLetterChange"
        />
        <div class="buttons">
          <GameButton
            @click="handleSubmitGuess"
            label="Submit Guess"
          ></GameButton>
          <GameButton
            @click="endGameImmediately"
            label="End Game"
            class="end-game-btn"
          ></GameButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  justify-content: center;
  text-align: center;
  margin-top: 5rem;
  font-family: "Poppins", sans-serif;
  font-weight: 400;
  font-style: normal;
}

.container {
  display: inline-block;
}

.validation-error {
  color: rgb(255, 0, 162);
  font-size: 16px;
  margin: 1rem;
  padding: 1rem;
}

.feedback {
  font-size: 20px;
  margin-bottom: 10px;
}

.timer {
  font-size: 18px;
  margin-bottom: 10px;
}

.buttons {
  display: flex;
  flex-direction: column;
  margin: 20px;
  gap: 2rem;
}

.end-game-btn {
  background-color: rgb(155, 77, 93);
}
</style>
