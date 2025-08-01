// Get lesson name from URL like lesson.html?lesson=lesson1
const urlParams = new URLSearchParams(window.location.search);
const lessonName = urlParams.get("lesson") || "lesson1"; // default to lesson1

// Load the JSON file
fetch(`lessons/${lessonName}.json`)
  .then(response => response.json())
  .then(data => renderLesson(data))
  .catch(error => {
    console.error("Failed to load lesson:", error);
    document.body.innerHTML = "<h2>Lesson not found.</h2>";
  });

// Render the lesson
function renderLesson(lesson) {
  const container = document.getElementById("lesson-container");
  container.innerHTML = `<h1>${lesson.title}</h1>`;

  lesson.sections.forEach(section => {
    if (section.type === "theory") {
      const theory = document.createElement("div");
      theory.className = "section theory";
      theory.innerHTML = `<p>${section.content}</p>`;
      container.appendChild(theory);
    }

    else if (section.type === "conversation") {
      const convo = document.createElement("div");
      convo.className = "section conversation";
      convo.innerHTML = `<h2>Conversation</h2>`;
      section.dialogue.forEach(line => {
        const p = document.createElement("p");
        p.innerHTML = `<strong>${line.speaker}:</strong> ${line.text}`;
        convo.appendChild(p);
      });
      container.appendChild(convo);
    }

    else if (section.type === "quiz") {
      const quiz = document.createElement("div");
      quiz.className = "section quiz";
      quiz.innerHTML = `<h2>Quiz</h2>`;
      section.questions.forEach((q, i) => {
        const qDiv = document.createElement("div");
        qDiv.className = "quiz-question";
        qDiv.innerHTML = `<p><strong>Q${i + 1}:</strong> ${q.question}</p>`;
        q.options.forEach(option => {
          const label = document.createElement("label");
          label.innerHTML = `
            <input type="radio" name="q${i}" value="${option}">
            ${option}
          `;
          qDiv.appendChild(label);
        });
        quiz.appendChild(qDiv);
      });
      container.appendChild(quiz);
    }
  });
}
