// Simple 3-question quiz
window.checkAnswers = function () {
  let score = 0;
  const q1 = document.querySelector('input[name="q1"]:checked')?.value;
  const q2 = document.querySelector('input[name="q2"]:checked')?.value;
  const q3 = document.querySelector('input[name="q3"]:checked')?.value;
  if (q1 === "4") score++;
  if (q2 === "Paris") score++;
  if (q3 === "H2O") score++;

  const result = document.getElementById("result");
  result.textContent = `Your score: ${score}/3`;
};
