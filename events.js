const canvas = document.getElementById('hexCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const points = [];
const numPoints = 200;  
const pointRadius = 2;  
const transitionSpeed = 0.000005;   
const lineFormationDelay = 200;  
const hoverRadius = 200;  
const lineDuration = 200;  

let mouseX = -1000, mouseY = -1000;  
let lines = [];

// Create random points
for (let i = 0; i < numPoints; i++) {
    points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        targetX: Math.random() * canvas.width,
        targetY: Math.random() * canvas.height,
        vx: 0,
        vy: 0 
    });
}

// Function to draw points and lines
function drawLines() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all points
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    });

    // Draw the lines that should be visible
    lines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.strokeStyle = 'white';
        ctx.stroke();
    });

    // Remove lines that have been visible for longer than lineDuration
    const currentTime = Date.now();
    lines = lines.filter(line => currentTime - line.timestamp < lineDuration);
}

// Function to find the closest points
function findClosestPoints(point, pointsArray) {
    return pointsArray
        .filter(p => p !== point)
        .sort((a, b) => distance(point, a) - distance(point, b))
        .slice(0, 5); // Get the 5 closest points
}

// Calculate the distance between two points
function distance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

// Update the points' positions to create a smoother transition
function updatePoints() {
    points.forEach(point => {
        const dx = point.targetX - point.x;
        const dy = point.targetY - point.y;
        point.vx += dx * transitionSpeed;
        point.vy += dy * transitionSpeed;

        point.x += point.vx;
        point.y += point.vy;

        // Randomly change target position after a while
        if (Math.random() < 0.01) {
            point.targetX = Math.random() * canvas.width;
            point.targetY = Math.random() * canvas.height;
        }

        // Keep points within canvas bounds
        if (point.x < 0 || point.x > canvas.width) point.x = Math.random() * canvas.width;
        if (point.y < 0 || point.y > canvas.height) point.y = Math.random() * canvas.height;
    });
}

// Track mouse movement to update the mouse position
canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Find the point closest to the mouse
    const closestPoint = points.reduce((prev, curr) => 
        distance(curr, {x: mouseX, y: mouseY}) < distance(prev, {x: mouseX, y: mouseY}) ? curr : prev);

    // Find the closest points to the chosen point
    const closestPoints = findClosestPoints(closestPoint, points);

    // Add lines to be drawn between the closest points
    closestPoints.forEach(p => {
        lines.push({
            start: closestPoint,
            end: p,
            timestamp: Date.now()
        });
    });
});

// Animation loop
function animate() {
    updatePoints();
    drawLines();
    requestAnimationFrame(animate);
}

animate();  // Start the animation loop
