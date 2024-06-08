<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from "vue";
import { useWordStore } from "../src/store/wordStore";
import { storeToRefs } from "pinia";

const wordStore = useWordStore();
const { randomWord, loading, error, validationError } = storeToRefs(wordStore);

const targetWord = ref<string>("");
const guesses = ref<string[][]>([["", "", "", "", ""]]);
const inputRefs = ref<Record<string, HTMLInputElement | null>>({});
const isGameInProgress = ref<boolean>(false);
const timer = ref<number>(120); // 2 minutes countdown in seconds
let timerInterval: NodeJS.Timeout | null = null;
const isSuccess = ref<boolean>(false);
const isGameEnded = ref<boolean>(false);
const score = ref<number>(0);
const maxAttempts = ref<number>(10);
const maxScore = ref<number>(1200);

const getKey = (guessIndex: number, index: number) => `${guessIndex}-${index}`;

const handleLetterChange = (
  guessIndex: number,
  index: number,
  event: Event
) => {
  const input = event.target as HTMLInputElement;
  const newLetter = input.value.slice(-1).toUpperCase();
  if (newLetter.match(/[A-Z]/i)) {
    guesses.value[guessIndex][index] = newLetter;
    if (index < 4) {
      nextTick(() => {
        const nextKey = getKey(guessIndex, index + 1);
        inputRefs.value[nextKey]?.focus();
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
    // Show validation error and clear the current row for re-entry
    validationError.value = `The word "${guessWord}" is not valid. Please enter a valid word.`;
    guesses.value[guesses.value.length - 1] = ["", "", "", "", ""];
    nextTick(() => {
      const firstKey = getKey(guesses.value.length - 1, 0);
      inputRefs.value[firstKey]?.focus();
    });
    return;
  }

  validationError.value = null; // Clear any previous validation error

  if (guessWord === targetWord.value) {
    if (timerInterval) clearInterval(timerInterval);
    isGameInProgress.value = false;
    isSuccess.value = true;
    calculateScore();
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
    const firstKey = getKey(guesses.value.length - 1, 0);
    inputRefs.value[firstKey]?.focus();
  });
};

const startNewGame = async () => {
  await wordStore.fetchRandomWord();
  targetWord.value = randomWord.value;
  guesses.value = [["", "", "", "", ""]];
  isGameInProgress.value = true;
  isSuccess.value = false;
  isGameEnded.value = false;
  score.value = maxScore.value;
  timer.value = 120; // reset timer to 2 minutes
  startTimer();
  validationError.value = null;
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
  const timeTaken = 120 - timer.value;
  if (isSuccess.value) {
    score.value = maxScore.value - (attempts * 50 + timeTaken * 5);
  } else {
    score.value = 0;
  }
  if (score.value < 0) {
    score.value = 0;
  }
};

const message = computed(() => {
  if (isGameInProgress.value) return "";

  if (isGameEnded.value)
    return "You ended the game, click on 'Play New Game' to play.";

  const attempts = guesses.value.length;
  const minutes = Math.floor((120 - timer.value) / 60);
  const seconds = (120 - timer.value) % 60;
  let msg = "";

  if (timer.value <= 0) {
    msg = `You failed to guess the word "${targetWord.value}" within the time limit.`;
  } else if (isSuccess.value) {
    if (attempts < 5) {
      msg = `Wow! You guessed the word "${targetWord.value}" in ${attempts} attempts in ${minutes} minutes and ${seconds} seconds. Impressive! Your score: ${score.value}`;
    } else if (attempts >= 5 && attempts < maxAttempts.value) {
      msg = `Great job! It took you only ${attempts} tries to guess the word "${targetWord.value}" in ${minutes} minutes and ${seconds} seconds. Your score: ${score.value}`;
    } else if (attempts === maxAttempts.value) {
      msg = `Phew! You found the word "${targetWord.value}" on your last attempt. Good job! Your score: ${score.value}`;
    }
  } else {
    msg = `You failed to guess the word "${targetWord.value}" within ${attempts} attempts. Your score: ${score.value}`;
  }
  return msg;
});

const getClass = (guess: string[], index: number) => {
  const target = targetWord.value;
  const guessLetter = guess[index];
  if (guessLetter === "") return "box";
  if (guessLetter === target[index]) return "box correct";
  if (target.includes(guessLetter)) return "box wrong-position";
  return "box";
};

const setInputRef =
  (guessIndex: number, index: number) => (el: HTMLInputElement | null) => {
    const key = getKey(guessIndex, index);
    inputRefs.value[key] = el;
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
      <p v-if="!isGameInProgress" class="message">{{ message }}</p>
      <button v-if="!isGameInProgress" class="btn" @click="startNewGame">
        Play New Game
      </button>
      <div v-else>
        <p class="feedback">
          Guess the 5-letter word in maximum {{ maxAttempts }} attemps
        </p>
        <p class="timer">
          Time left: {{ Math.floor(timer / 60) }}:{{
            (timer % 60).toString().padStart(2, "0")
          }}
        </p>
        <div
          v-for="(guess, guessIndex) in guesses"
          :key="guessIndex"
          class="boxes"
        >
          <label v-for="(letter, index) in guess" :key="letter">
            <input
              type="text"
              autoComplete="off"
              :aria-label="`Letter ${index + 1} of 5`"
              aria-required="true"
              maxlength="1"
              v-model="guess[index]"
              @input="(event) => handleLetterChange(guessIndex, index, event)"
              :ref="setInputRef(guessIndex, index)"
              :class="
                isGameInProgress && guessIndex === guesses.length - 1
                  ? 'box'
                  : getClass(guess, index)
              "
              :disabled="!!guess[index]"
            />
          </label>
        </div>
        <div class="buttons">
          <button class="btn" @click="handleSubmitGuess">Submit Guess</button>
          <button class="btn end-game-btn" @click="endGameImmediately">
            End Game
          </button>
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
  margin-top: 10rem;
}

.container {
  display: inline-block;
}

.validation-error {
  color: red;
  font-size: 18px;
  margin-bottom: 10px;
}

.feedback {
  font-size: 20px;
  margin-bottom: 10px;
}

.timer {
  font-size: 18px;
  margin-bottom: 10px;
}

.boxes {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.box {
  width: 3.5rem;
  height: 3.5rem;
  margin: 0 5px;
  text-align: center;
  font-size: 24px;
  border: none;
  border: 2px solid #ccc;
}

.box.correct {
  border-bottom: 3px solid green;
}

.box.wrong-position {
  border-bottom: 3px solid red;
}

.buttons {
  display: flex;
  flex-direction: column;
  margin: 20px;
  gap: 2rem;
}

.btn {
  margin: 0 10px;
  padding: 10px 20px;
  cursor: pointer;
  background-color: rgb(78, 144, 78);
  color: white;
}
.end-game-btn {
  background-color: rgb(155, 77, 93);
}
</style>
