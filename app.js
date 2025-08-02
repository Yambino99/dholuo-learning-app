// Dynamic Lesson Loader for Dholuo App
let currentLesson = null;
let currentSection = 0;
let totalSections = 0;
let currentLessonNumber = 1;  // Track which lesson we're on
let totalLessons = 30;  // number of planned lessons

// Main function to load a lesson
async function loadLesson(lessonId) {
    try {
        const response = await fetch(`lessons/lesson${lessonId}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const lesson = await response.json();
        currentLesson = lesson;
        totalSections = lesson.sections.length;
        currentSection = 0;
        
        displaySection(0);
        updateProgress();
    } catch (error) {
        console.error('Error loading lesson:', error);
        displayError('Could not load lesson. Please try again.');
    }
}

// Display a specific section of the current lesson
function displaySection(sectionIndex) {
    if (!currentLesson || sectionIndex >= currentLesson.sections.length) {
        console.error('Invalid section index or no lesson loaded');
        return;
    }

    const section = currentLesson.sections[sectionIndex];
    const container = document.getElementById('lessonContainer');
    
    let html = '';
    
    // Generate HTML based on section type
    switch (section.type) {
        case 'theory':
            html = generateTheoryHTML(section);
            break;
        case 'conversation':
            html = generateConversationHTML(section);
            break;
        case 'vocabulary':
            html = generateVocabularyHTML(section);
            break;
        case 'practice':
            html = generatePracticeHTML(section);
            break;
        default:
            html = '<div class="error">Unknown section type</div>';
    }
    
    // Add navigation
    html += generateNavigation(sectionIndex);
    
    container.innerHTML = `<div class="lesson-card">${html}</div>`;
}

// Generate Theory Section HTML
function generateTheoryHTML(section) {
    const content = section.content;
    let html = `<h2 class="section-title">${section.title}</h2>`;
    
    html += `<div class="theory-content">`;
    html += `<p>${content.introduction}</p>`;
    
    // Add phrase boxes
    if (content.phrases) {
        content.phrases.forEach(phrase => {
            html += `
                <div class="phrase-box">
                    <div class="dholuo-text">${phrase.dholuo}</div>
                    <div class="literal-translation">Literal: "${phrase.literal}"</div>
                    <div class="english-translation">English: ${phrase.english}</div>
                    ${phrase.notes ? `<div style="margin-top: 8px; font-size: 0.9em; color: #666;">${phrase.notes}</div>` : ''}
                </div>
            `;
        });
    }
    
    // Add grammar note
    if (content.grammar_note) {
        html += `<p><strong>Grammar Note:</strong> ${content.grammar_note}</p>`;
    }
    
    html += `</div>`;
    return html;
}

// Generate Conversation Section HTML
function generateConversationHTML(section) {
    const content = section.content;
    let html = `<h2 class="section-title">${section.title}</h2>`;
    
    html += `
        <div class="conversation-section">
            <div class="conversation-title">💬 Conversation Practice</div>
    `;
    
    // Add dialogue
    content.dialogue.forEach(line => {
        const speakerClass = line.speaker_type.toLowerCase();
        html += `
            <div class="conversation-line person-${speakerClass}">
                ${speakerClass === 'a' ? '' : `<div class="speaker-label">${line.speaker}</div>`}
                <div class="speech-bubble person-${speakerClass}">
                    <div class="dholuo-text">
                        ${highlightPronoun(line.dholuo, line.highlighted_pronoun)}
                    </div>
                    <div class="literal-breakdown">Literal: "${line.literal}"</div>
                    <div class="literal-translation">"${line.english}"</div>
                </div>
                ${speakerClass === 'a' ? `<div class="speaker-label">${line.speaker}</div>` : ''}
            </div>
        `;
    });
    
    // Add note
    if (content.note) {
        html += `
            <div class="conversation-note">
                <strong>Notice:</strong> ${content.note}
            </div>
        `;
    }
    
    html += `</div>`;
    return html;
}

// Generate Vocabulary Section HTML
function generateVocabularyHTML(section) {
    const content = section.content;
    let html = `<h2 class="section-title">${section.title}</h2>`;
    
    html += `
        <div class="vocabulary-card">
            <div class="vocabulary-title">📚 Vocabulary from the Conversation</div>
            <div class="vocabulary-grid">
    `;
    
    content.words.forEach(word => {
        html += `
            <div class="vocab-item">
                <div class="vocab-type">${word.type}</div>
                <div class="vocab-dholuo">${word.dholuo}</div>
                <div class="vocab-meaning">${word.english}</div>
                <div class="vocab-note">${word.notes}</div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    return html;
}

// Generate Practice Section HTML
function generatePracticeHTML(section) {
    const content = section.content;
    let html = `<h2 class="section-title">${section.title}</h2>`;
    
    html += `<div class="practice-section">`;
    
    // Pronunciation guides
    if (content.pronunciation) {
        html += `
            <div class="exercise-type">
                <div class="exercise-title">🔊 Pronunciation Guide</div>
        `;
        
        content.pronunciation.forEach(item => {
            html += `
                <div class="pronunciation-guide">
                    <strong>${item.dholuo}</strong> - ${item.phonetic}
                    <button class="play-button" onclick="playPronunciation('${item.dholuo}')">▶ Play</button>
                    <div style="margin-top: 8px; font-size: 0.9em; color: #666;">
                        Tips: ${item.tips}
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    // Exercises
    if (content.exercises) {
        content.exercises.forEach((exercise, index) => {
            if (exercise.type === 'multiple_choice') {
                html += `
                    <div class="exercise-type">
                        <div class="exercise-title">📝 Exercise ${index + 1}</div>
                        <div class="exercise-question">
                            <p><strong>Question:</strong> ${exercise.question}</p>
                            <div class="options">
                `;
                
                exercise.options.forEach((option, optionIndex) => {
                    const isCorrect = optionIndex === exercise.correct_answer;
                    html += `
                        <div class="option-button" onclick="selectOption(this, ${isCorrect}, '${exercise.explanation}')">
                            ${option}
                        </div>
                    `;
                });
                
                html += `
                            </div>
                            <div class="feedback hidden"></div>
                        </div>
                    </div>
                `;
            }
        });
    }
    
    html += `</div>`;
    return html;
}

// Helper function to highlight pronouns in text
function highlightPronoun(text, pronoun) {
    if (!pronoun) return text;
    return text.replace(new RegExp(`\\b${pronoun}\\b`, 'g'), `<span class="pronoun">${pronoun}</span>`);
}

// Generate navigation buttons
function generateNavigation(sectionIndex) {
    const isFirst = sectionIndex === 0;
    const isLast = sectionIndex === totalSections - 1;
    
    return `
        <div class="navigation">
            <button class="nav-button" ${isFirst ? 'disabled' : ''} onclick="previousSection()">
                Previous
            </button>
            <button class="nav-button" onclick="${isLast ? 'completeLesson()' : 'nextSection()'}">
                ${isLast ? 'Complete Lesson' : 'Next Section'}
            </button>
        </div>
    `;
}

// Navigation functions
function nextSection() {
    if (currentSection < totalSections - 1) {
        currentSection++;
        displaySection(currentSection);
        updateProgress();
    }
}

function previousSection() {
    if (currentSection > 0) {
        currentSection--;
        displaySection(currentSection);
        updateProgress();
    }
}

function completeLesson() {
    alert('Lesson completed! 🎉\n\nGreat job learning about Dholuo pronouns!');
    // And/or go to the next lesson
    nextLesson();
}

function nextLesson() {
    if (currentLessonNumber < totalLessons) {
        currentLessonNumber++;
        loadLesson(currentLessonNumber);  // Use existing loadLesson function
        updateProgress();
    } else {
        alert('Congratulations! You\'ve completed all lessons! 🎉');
    }
}

// Update progress bar
function updateProgress() {
    const progress = ((currentSection + 1) / totalSections) * 100;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    
    if (progressText) {
        progressText.textContent = `Lesson ${currentLessonNumber} - Section ${currentSection + 1} of ${totalSections}`;
    }
}

// Exercise interaction functions
function selectOption(button, isCorrect, explanation) {
    // Remove previous selections
    const options = button.parentElement.querySelectorAll('.option-button');
    options.forEach(opt => {
        opt.classList.remove('correct', 'incorrect');
    });

    // Mark the selected option
    if (isCorrect) {
        button.classList.add('correct');
        showFeedback(button.parentElement.parentElement, true, `Correct! ${explanation}`);
    } else {
        button.classList.add('incorrect');
        showFeedback(button.parentElement.parentElement, false, "Not quite right. Try again!");
    }
}

function showFeedback(exerciseElement, isCorrect, message) {
    const feedback = exerciseElement.querySelector('.feedback');
    feedback.textContent = message;
    feedback.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
    feedback.classList.remove('hidden');
}

function playPronunciation(word) {
    // Simulate pronunciation playback
    alert(`Playing pronunciation for: ${word}\n\n(In a real app, this would play an audio file)`);
}

// Error display function
function displayError(message) {
    const container = document.getElementById('lessonContainer');
    container.innerHTML = `
        <div class="lesson-card">
            <div class="error" style="color: red; text-align: center; padding: 20px;">
                <h3>Error</h3>
                <p>${message}</p>
                <button class="nav-button" onclick="loadLesson(1)">Try Again</button>
            </div>
        </div>
    `;
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load the first lesson by default
    loadLesson(1);
});