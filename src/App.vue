<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { useWordStore } from "./store/wordStore";
import { storeToRefs } from "pinia";

const wordStore = useWordStore();
const { randomWord, loading, error } = storeToRefs(wordStore);

const targetWord = ref("");
const guesses = ref([["", "", "", "", ""]]);
const inputRefs = ref([]);
const isGameInProgress = ref(false);
const timer = ref(90); // 1.5 minutes countdown in seconds
const timerInterval = ref(null);
const isSuccess = ref(false);
const isGameEnded = ref(false);
const score = ref(0);

const handleLetterChange = (guessIndex, index, event) => {
  const newLetter = event.target.value.slice(-1).toUpperCase();
  if (newLetter.match(/[A-Z]/i)) {
    guesses.value[guessIndex][index] = newLetter;
    if (index < 4) {
      nextTick(() => {
        inputRefs.value[guessIndex][index + 1].focus();
      });
    } else if (guessIndex === guesses.value.length - 1) {
      handleSubmitGuess();
    }
  }
};

const handleSubmitGuess = () => {
  const currentGuess = guesses.value[guesses.value.length - 1];
  if (currentGuess.some((letter) => letter === "")) return;

  if (currentGuess.join("") === targetWord.value) {
    clearInterval(timerInterval.value);
    isGameInProgress.value = false;
    isSuccess.value = true;
    calculateScore();
  } else {
    if (guesses.value.length === 5) {
      clearInterval(timerInterval.value);
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
    inputRefs.value[inputRefs.value.length - 1][0].focus();
  });
};

const maxScore = 1000;

const startNewGame = async () => {
  await wordStore.fetchRandomWord();
  targetWord.value = randomWord.value;
  guesses.value = [["", "", "", "", ""]];
  isGameInProgress.value = true;
  isSuccess.value = false;
  isGameEnded.value = false;
  score.value = 0;
  timer.value = 90; // reset timer to 1.5 minutes
  startTimer();
};

const startTimer = () => {
  clearInterval(timerInterval.value);
  timerInterval.value = setInterval(() => {
    if (timer.value > 0) {
      timer.value -= 1;
    } else {
      clearInterval(timerInterval.value);
      isGameInProgress.value = false;
      isSuccess.value = false;
      calculateScore();
    }
  }, 1000);
};

const endGameImmediately = () => {
  clearInterval(timerInterval.value);
  isGameEnded.value = true;
  isGameInProgress.value = false;
  isSuccess.value = false;
  calculateScore();
};

const calculateScore = () => {
  const attempts = guesses.value.length - 1;
  const timeTaken = 90 - timer.value;
  if (isSuccess.value) {
    // Decrease points for more attempts and more time taken
    score.value = maxScore - (attempts * 100 + timeTaken * 5);
  } else {
    // No points if the player fails to guess the word
    score.value = 0;
  }
  if (score.value < 0) {
    score.value = 0;
  }
};

// Computed properties
const message = computed(() => {
  if (isGameInProgress.value) return "";

  if (isGameEnded.value)
    return "You ended the game, click on 'Play New Game' to play.";

  const attempts = guesses.value.length;
  const minutes = Math.floor((90 - timer.value) / 60);
  const seconds = (90 - timer.value) % 60;
  let msg = "";

  if (timer.value <= 0) {
    msg = `You failed to guess the word "${targetWord.value}" within the time limit.`;
  } else if (isSuccess.value) {
    if (attempts < 3) {
      msg = `Wow! You guessed the word "${targetWord.value}" in ${attempts} attempts in ${minutes} minutes and ${seconds} seconds. Impressive! Your score: ${score.value}`;
    } else if (attempts >= 3 && attempts < 5) {
      msg = `Great job! It took you only ${attempts} tries to guess the word "${targetWord.value}" in ${minutes} minutes and ${seconds} seconds. Your score: ${score.value}`;
    } else if (attempts === 5) {
      msg = `Phew! You found the word "${targetWord.value}" on your last attempt. Good job! Your score: ${score.value}`;
    }
  } else {
    msg = `You failed to guess the word "${targetWord.value}" within ${attempts} attempts. Your score: ${score.value}`;
  }
  return msg;
});

const getClass = (guess, index) => {
  const target = targetWord.value;
  const guessLetter = guess[index];
  if (guessLetter === "") return "box";
  if (guessLetter === target[index]) return "box correct";
  if (target.includes(guessLetter)) return "box wrong-position";
  return "box";
};

const setInputRef = (guessIndex, index) => (el) => {
  if (!inputRefs.value[guessIndex]) {
    inputRefs.value[guessIndex] = [];
  }
  inputRefs.value[guessIndex][index] = el;
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
      <p v-if="!isGameInProgress" class="message">{{ message }}</p>
      <button v-if="!isGameInProgress" class="btn" @click="startNewGame">
        Play New Game
      </button>
      <div v-else>
        <p class="feedback">Guess the 5-letter word</p>
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
          <label v-for="(letter, index) in guess" :key="index">
            <input
              type="text"
              autoComplete="off"
              :aria-label="`Letter ${index + 1} of 5`"
              aria-required="true"
              maxlength="1"
              v-model="guess[index]"
              @input="(event) => handleLetterChange(guessIndex, index, event)"
              :ref="setInputRef(guessIndex, index)"
              :class="getClass(guess, index)"
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
