document.addEventListener('DOMContentLoaded', () => {
    initSandbox();
    initQuiz();
});

/* --- Sandbox Simulation --- */
function initSandbox() {
    const canvas = document.getElementById('reflectionCanvas');
    const ctx = canvas.getContext('2d');
    const angleSlider = document.getElementById('angleSlider');
    const angleValueDisplay = document.getElementById('angleValue');

    function drawSimulation(incidentAngle) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height - 50;

        // Draw Mirror surface
        ctx.beginPath();
        ctx.moveTo(100, cy);
        ctx.lineTo(canvas.width - 100, cy);
        ctx.strokeStyle = '#66fcf1';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Draw hatching lines to indicate mirror back
        ctx.strokeStyle = '#45a29e';
        ctx.lineWidth = 1;
        for (let x = 110; x < canvas.width - 100; x += 15) {
            ctx.beginPath();
            ctx.moveTo(x, cy);
            ctx.lineTo(x - 10, cy + 15);
            ctx.stroke();
        }

        // Draw Normal line
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, 50);
        ctx.strokeStyle = '#c5c6c7';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        // Calculate angles in radians
        // Normal is at 90 deg (or PI/2). Incident angle is measured from Normal.
        const normalAngleRad = -Math.PI / 2; 
        const incidentRad = incidentAngle * (Math.PI / 180);
        
        // Incident Ray Angle (Left side of normal)
        const rayInAngle = normalAngleRad - incidentRad;
        // Reflected Ray Angle (Right side of normal)
        const rayOutAngle = normalAngleRad + incidentRad;

        const rayLength = 200;

        // Calculate endpoints
        const inEndX = cx + rayLength * Math.cos(rayInAngle);
        const inEndY = cy + rayLength * Math.sin(rayInAngle);

        const outEndX = cx + rayLength * Math.cos(rayOutAngle);
        const outEndY = cy + rayLength * Math.sin(rayOutAngle);

        // Draw Incident Ray
        ctx.beginPath();
        ctx.moveTo(inEndX, inEndY);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = '#ff3366';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw Incident Arrow
        drawArrow(ctx, inEndX, inEndY, cx, cy, '#ff3366');

        // Draw Reflected Ray
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(outEndX, outEndY);
        ctx.strokeStyle = '#33ccff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw Reflected Arrow
        drawArrow(ctx, cx, cy, outEndX, outEndY, '#33ccff');

        // Draw Arcs and labels
        ctx.font = '16px Inter';
        ctx.fillStyle = '#ffffff';
        
        // Incident Arc
        if (incidentAngle > 0) {
            ctx.beginPath();
            ctx.arc(cx, cy, 40, normalAngleRad - incidentRad, normalAngleRad, false);
            ctx.strokeStyle = 'rgba(255, 51, 102, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillText(`i = ${incidentAngle}°`, cx - 60, cy - 50);
        }

        // Reflected Arc
        if (incidentAngle > 0) {
            ctx.beginPath();
            ctx.arc(cx, cy, 40, normalAngleRad, normalAngleRad + incidentRad, false);
            ctx.strokeStyle = 'rgba(51, 204, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillText(`r = ${incidentAngle}°`, cx + 20, cy - 50);
        }
    }

    function drawArrow(ctx, fromX, fromY, toX, toY, color) {
        const headlen = 10;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);
        
        // Find midpoint
        const midX = fromX + dx * 0.5;
        const midY = fromY + dy * 0.5;

        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(midX - headlen * Math.cos(angle - Math.PI / 6), midY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(midX, midY);
        ctx.lineTo(midX - headlen * Math.cos(angle + Math.PI / 6), midY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // Event Listener for Slider
    angleSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        angleValueDisplay.textContent = val;
        drawSimulation(val);
    });

    // Initial draw
    drawSimulation(45);
}

/* --- Quiz System --- */
const quizData = [
    {
        question: "According to the laws of reflection, which statement is true?",
        options: [
            "Angle of incidence is greater than angle of reflection",
            "Angle of incidence is less than angle of reflection",
            "Angle of incidence is always equal to angle of reflection",
            "There is no relationship between the angles"
        ],
        correct: 2
    },
    {
        question: "A smooth, highly polished surface like a mirror produces:",
        options: [
            "Irregular reflection",
            "Regular (specular) reflection",
            "Diffused reflection",
            "No reflection"
        ],
        correct: 1
    },
    {
        question: "When a light ray passes from air into a glass slab, it:",
        options: [
            "Bends away from the normal",
            "Bends towards the normal",
            "Does not bend",
            "Reflects back"
        ],
        correct: 1
    }
];

let currentQuestion = 0;
let score = 0;

function initQuiz() {
    loadQuestion();
    document.getElementById('nextBtn').addEventListener('click', () => {
        currentQuestion++;
        if (currentQuestion < quizData.length) {
            loadQuestion();
        } else {
            showResults();
        }
    });
}

function loadQuestion() {
    const q = quizData[currentQuestion];
    document.getElementById('questionText').textContent = `${currentQuestion + 1}. ${q.question}`;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    document.getElementById('nextBtn').style.display = 'none';

    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = opt;
        btn.addEventListener('click', () => selectOption(index, btn));
        optionsContainer.appendChild(btn);
    });
}

function selectOption(selectedIndex, btn) {
    const q = quizData[currentQuestion];
    const optionsContainer = document.getElementById('optionsContainer');
    
    // Disable all buttons
    Array.from(optionsContainer.children).forEach(child => {
        child.disabled = true;
        child.style.pointerEvents = 'none';
    });

    if (selectedIndex === q.correct) {
        btn.classList.add('correct');
        score++;
    } else {
        btn.classList.add('wrong');
        // Highlight correct
        optionsContainer.children[q.correct].classList.add('correct');
    }

    document.getElementById('nextBtn').style.display = 'inline-block';
}

function showResults() {
    const container = document.getElementById('quizContainer');
    container.innerHTML = `
        <h2 class="section-title" style="margin-bottom: 1rem;">Quiz Complete!</h2>
        <div id="quizResult">You scored ${score} out of ${quizData.length}</div>
        <button class="btn primary-btn" style="margin-top: 2rem;" onclick="location.reload()">Try Again</button>
    `;
}
