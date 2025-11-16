// 你的嘲讽语句（原样）
const TAUNTS = [
  "就这？",
  "建议转人工",
  "手机放转转回收了吧",
  "嘻嘻",
  "开了吗？我说灵智",
  "菜就多练",
  "建议外接义脑",
  "？",
];

let currentQuizQuestions = [];
let currentIndex = 0;

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

// 打乱数组
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

// 底部随机图片（每次“页面变化”都更新）
function updateBottomImage() {
  const img = document.getElementById("bottom-image");
  if (!img) return;
  const picCount = 5; // 你有多少张图就写多少
  const index = Math.floor(Math.random() * picCount) + 1;
  img.src = `pic${index}.png`;
}

// 切换 screen（首页 / 答题 / 结果）
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

// 开始一轮挑战：综合 2 + 逻辑 2 + 邪门 2
function startQuiz() {
  currentIndex = 0;

  const comp = pickRandomQuestions(window.quizData.comprehensive, 2);
  const logic = pickRandomQuestions(window.quizData.logic, 2);
  const weird = pickRandomQuestions(window.quizData.weird, 2);

  currentQuizQuestions = shuffle([...comp, ...logic, ...weird]);

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

  // 每换一道题，也换一张底部图片
  updateBottomImage();
}

// 提交答案
function handleSubmit() {
  const questionInput = document.getElementById("answer-input");
  const feedback = document.getElementById("feedback");
  const userInput = questionInput.value;
  const currentQuestion = currentQuizQuestions[currentIndex];

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
    const taunt = TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
    feedback.textContent = taunt;
    feedback.classList.remove("feedback-correct");
    feedback.classList.add("feedback-wrong");
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
  // 显示题库总数（综合 + 逻辑 + 邪门）
  const totalCount =
    window.quizData.comprehensive.length +
    window.quizData.logic.length +
    window.quizData.weird.length;
  const counterSpan = document.getElementById("question-count");
  if (counterSpan) {
    counterSpan.textContent = totalCount;
  }

  document
    .getElementById("start-btn")
    .addEventListener("click", startQuiz);
  document
    .getElementById("submit-btn")
    .addEventListener("click", handleSubmit);
  document
    .getElementById("restart-btn")
    .addEventListener("click", restartQuiz);

  switchScreen("home");
});
