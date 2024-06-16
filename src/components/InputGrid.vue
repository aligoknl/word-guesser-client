<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from "vue";

type Guess = string[];
type Guesses = Guess[];

const props = defineProps<{
  guesses: Guesses;
  targetWord: string;
  isGameInProgress: boolean;
  shakeClass: boolean;
}>();

const emit = defineEmits(["letterChange"]);

const inputRefs = ref<Record<string, HTMLInputElement | null>>({});

const getKey = (guessIndex: number, index: number) => `${guessIndex}-${index}`;

const setInputRef = (el: Element | null, guessIndex: number, index: number) => {
  const key = getKey(guessIndex, index);
  if (el instanceof HTMLInputElement) {
    inputRefs.value[key] = el;
  } else {
    delete inputRefs.value[key];
  }
};

const getClass = (guess: string[], index: number) => {
  const target = props.targetWord;
  const guessLetter = guess[index];
  if (guessLetter === "") return "box";
  if (guessLetter === target[index]) return "box correct";
  if (target.includes(guessLetter)) return "box wrong-position";
  return "box";
};

// Ensure initial focus on the first input when the component mounts
onMounted(() => {
  nextTick(() => {
    const firstKey = getKey(0, 0);
    inputRefs.value[firstKey]?.focus();
  });
});

// Watch for changes in guesses to manage focus
watch(
  () => props.guesses,
  (newGuesses: Guesses) => {
    const lastGuessIndex = newGuesses.length - 1;
    const lastLetterIndex = newGuesses[lastGuessIndex].findIndex(
      (letter) => letter === ""
    );

    if (lastLetterIndex !== -1) {
      nextTick(() => {
        const nextKey = getKey(lastGuessIndex, lastLetterIndex);
        inputRefs.value[nextKey]?.focus();
      });
    }
  },
  { deep: true }
);
</script>

#### Template: ```vue
<template>
  <div>
    <div
      v-for="(guess, guessIndex) in guesses"
      :key="guessIndex"
      :class="guessIndex === guesses.length - 1 && shakeClass ? 'shake' : ''"
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
          @input="(event) => emit('letterChange', { guessIndex, index, event })"
          :ref="(el) => setInputRef(el, guessIndex, index)"
          :class="
            isGameInProgress && guessIndex === guesses.length - 1
              ? 'box'
              : getClass(guess, index)
          "
          :disabled="!!guess[index]"
        />
      </label>
    </div>
  </div>
</template>

<style scoped>
.boxes {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.box {
  width: 3.2rem;
  height: 3.2rem;
  margin: 0 5px;
  text-align: center;
  font-size: 24px;
  border: 2px solid #ccc;
  border-radius: 0.5rem;
}

.box.correct {
  border-bottom: 3px solid green;
}

.box.wrong-position {
  border-bottom: 3px solid red;
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  50% {
    transform: translateX(5px);
  }
  75% {
    transform: translateX(-5px);
  }
  100% {
    transform: translateX(0);
  }
}

.shake {
  animation: shake 0.3s;
}
</style>
