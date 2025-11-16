// 嘲讽升级系统
const TAUNTS_LIGHT = [
  "再想想？",
  "就当热身了",
];

const TAUNTS_MEDIUM = [
  "就这？",
  "建议转人工",
  "嘻嘻",
  "开了吗？我说灵智",
];

const TAUNTS_HEAVY = [
  "手机放转转回收了吧",
  "菜就多练",
  "建议外接义脑",
  "？",
  "啊？？？？？",
  "这脑容量堪忧",
  "连 AI 都沉默了",
  "建议卸载大脑重装系统",
  "你这是物理降智",
];

let currentQuizQuestions = [];
let currentIndex = 0;
let currentMode = "normal"; // normal / weird / poem

let wrongCount = 0;
const MAX_HP = 5;
let brainHP = MAX_HP;

// 标准化答案：去空格、标点、小写
function normalizeAnswer(str) {
  if (!str) return "";
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[，。、“”"‘’！!？?：:；;，（）、,.%％]/g, "");
}

// 判断是否回答正确
function isCorrectAnswer(question, userInput) {
  const normalizedInput = normalizeAnswer(userInput);
  if (!normalizedInput) return false;
  return question.answers.some(
    (ans) => normalizeAnswer(ans) === normalizedInput
  );
}

// 随机打乱数组
function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 从一个分类中随机抽 N 题
function pickRandomQuestions(sourceArray, count) {
  const active = sourceArray.filter((q) => q.active !== false);
  const shuffled = shuffle(active);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// 随机底部图片
function updateBottomImage() {
  const img = document.getElementById("bottom-image");
  if (!img) return;
  const picCount = 5; // 你有几张图就改成多少
  const index = Math.floor(Math.random() * picCount) + 1;
  img.src = `pic${index}.png`;
}

// 嘲讽分级选择
function getTaunt() {
  if (wrongCount < 3) {
    return TAUNTS_LIGHT[Math.floor(Math.random() * TAUNTS_LIGHT.length)];
  } else if (wrongCount < 7) {
    return TAUNTS_MEDIUM[Math.floor(Math.random() * TAUNTS_MEDIUM.length)];
  } else {
    return TAUNTS_HEAVY[Math.floor(Math.random() * TAUNTS_HEAVY.length)];
  }
}

// 更新脑容量显示
function updateBrainUI() {
  const el = document.getElementById("brain-hp");
  if (!el) return;
  const hearts = "❤".repeat(brainHP) + "♡".repeat(MAX_HP - brainHP);
  el.textContent = `脑容量：${hearts} （${brainHP} / ${MAX_HP}）`;
}

// 切换页面
function switchScreen(screen) {
  const home = document.getElementById("home-screen");
  const quiz = document.getElementById("quiz-screen");
  const result = document.getElementById("result-screen");

  home.classList.remove("active");
  quiz.classList.remove("active");
  result.classList.remove("active");

  if (screen === "home") {
    home.classList.add("active");
  } else if (screen === "quiz") {
    quiz.classList.add("active");
  } else if (screen === "result") {
    result.classList.add("active");
  }

  updateBottomImage();
}

// 开始一轮挑战：根据模式配题
function startQuiz() {
  currentIndex = 0;
  wrongCount = 0;
  brainHP = MAX_HP;

  let selected = [];

  if (currentMode === "normal") {
    const comp = pickRandomQuestions(window.quizData.comprehensive, 2);
    const logic = pickRandomQuestions(window.quizData.logic, 2);
    const weird = pickRandomQuestions(window.quizData.weird, 2);
    selected = [...comp, ...logic, ...weird];
  } else if (currentMode === "weird") {
    selected = pickRandomQuestions(window.quizData.weird, 6);
  } else if (currentMode === "poem") {
    const poemQuestions = window.quizData.comprehensive.filter(
      (q) => q.isPoem === true
    );
    selected = pickRandomQuestions(poemQuestions, 6);
  }

  currentQuizQuestions = shuffle(selected);

  switchScreen("quiz");
  renderQuestion();
}

// 渲染当前题目
function renderQuestion() {
  const questionTitle = document.getElementById("question-title");
  const questionText = document.getElementById("question-text");
  const questionInput = document.getElementById("answer-input");
  const feedback = document.getElementById("feedback");

  const q = currentQuizQuestions[currentIndex];

  questionTitle.textContent = `第 ${currentIndex + 1} 题 / 共 ${
    currentQuizQuestions.length
  } 题`;
  questionText.textContent = q.prompt;
  questionInput.value = "";
  feedback.textContent = "";
  feedback.classList.remove("feedback-correct", "feedback-wrong");
  questionInput.focus();

  updateBrainUI();
  updateBottomImage();
}

// 提交答案
function handleSubmit() {
  const questionInput = document.getElementById("answer-input");
  const feedback = document.getElementById("feedback");
  const userInput = questionInput.value;
  const currentQuestion = currentQuizQuestions[currentIndex];

  // 隐藏彩蛋：开发者最帅 → 直接通关
  if (normalizeAnswer(userInput) === normalizeAnswer("开发者最帅")) {
    alert("识货的人，直接毕业。");
    showResultScreen();
    return;
  }

  // 正常判断
  if (isCorrectAnswer(currentQuestion, userInput)) {
    feedback.textContent = "答对了！自动进入下一题～";
    feedback.classList.remove("feedback-wrong");
    feedback.classList.add("feedback-correct");

    setTimeout(() => {
      currentIndex++;
      if (currentIndex >= currentQuizQuestions.length) {
        showResultScreen();
      } else {
        renderQuestion();
      }
    }, 600);
  } else {
    wrongCount++;
    brainHP = Math.max(0, brainHP - 1);
    updateBrainUI();

    const taunt = getTaunt();
    // 嘲讽弹窗，必须点确定才能继续
    alert(taunt);

    feedback.textContent = "回答错误。";
    feedback.classList.remove("feedback-correct");
    feedback.classList.add("feedback-wrong");

    if (brainHP <= 0) {
      alert("脑容量告罄，请重启大脑。");
      restartQuiz();
    }
  }
}

function showResultScreen() {
  switchScreen("result");
  startFlowerRain();
}

function restartQuiz() {
  switchScreen("home");
}

// 飘花动画
function startFlowerRain() {
  const container = document.getElementById("flower-container");
  if (!container) return;
  container.innerHTML = "";
  const petalCount = 30;

  for (let i = 0; i < petalCount; i++) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.textContent = "❀";
    petal.style.left = Math.random() * 100 + "vw";
    petal.style.animationDelay = Math.random() * 5 + "s";
    petal.style.animationDuration = 5 + Math.random() * 5 + "s";
    container.appendChild(petal);
  }
}

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  // 显示题库总数
  const totalCount =
    window.quizData.comprehensive.length +
    window.quizData.logic.length +
    window.quizData.weird.length;
  const counterSpan = document.getElementById("question-count");
  if (counterSpan) {
    counterSpan.textContent = totalCount;
  }

  // 模式按钮
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentMode = btn.dataset.mode || "normal";
      startQuiz();
    });
  });

  // 提交按钮
  document.getElementById("submit-btn").addEventListener("click", handleSubmit);

  // 回车键提交
  document
    .getElementById("answer-input")
    .addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    });

  // 重开按钮
  document
    .getElementById("restart-btn")
    .addEventListener("click", restartQuiz);

  switchScreen("home");
});
