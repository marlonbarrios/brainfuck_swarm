// BrainFuck Swarm: Minimalist Grayscale Visualization

class BrainfuckInterpreter {
    constructor() {
        this.memory = new Array(30000).fill(0);
        this.pointer = 0;
        this.code = '';
        this.codePointer = 0;
        this.bracketPairs = {};
        this.operationCount = 0;
        this.output = [];
        this.input = [];
    }

    reset() {
        this.memory = new Array(30000).fill(0);
        this.pointer = 0;
        this.codePointer = 0;
        this.operationCount = 0;
        this.output = [];
    }

    setCode(code) {
        this.code = code;
        this.preprocessBrackets();
    }

    preprocessBrackets() {
        this.bracketPairs = {};
        const stack = [];
        for (let i = 0; i < this.code.length; i++) {
            if (this.code[i] === '[') {
                stack.push(i);
            } else if (this.code[i] === ']') {
                if (stack.length === 0) return;
                const start = stack.pop();
                this.bracketPairs[start] = i;
                this.bracketPairs[i] = start;
            }
        }
    }

    step() {
        if (this.codePointer >= this.code.length) return false;
        const command = this.code[this.codePointer];
        this.operationCount++;

        switch (command) {
            case '>': this.pointer = (this.pointer + 1) % this.memory.length; break;
            case '<': this.pointer = (this.pointer - 1 + this.memory.length) % this.memory.length; break;
            case '+': this.memory[this.pointer] = (this.memory[this.pointer] + 1) % 256; break;
            case '-': this.memory[this.pointer] = (this.memory[this.pointer] - 1 + 256) % 256; break;
            case '.': this.output.push(this.memory[this.pointer]); break;
            case ',': 
                if (this.input.length > 0) {
                    this.memory[this.pointer] = this.input.shift();
                }
                break;
            case '[': if (this.memory[this.pointer] === 0) this.codePointer = this.bracketPairs[this.codePointer] || this.code.length; break;
            case ']': if (this.memory[this.pointer] !== 0) this.codePointer = this.bracketPairs[this.codePointer] || 0; break;
        }
        this.codePointer++;
        return true;
    }

    run(maxSteps = 1000) {
        this.operationCount = 0;
        let steps = 0;
        while (this.codePointer < this.code.length && steps < maxSteps) {
            this.step();
            steps++;
            if (this.operationCount > maxSteps * 10) break;
        }
        return this.operationCount;
    }
}

class Organism {
    constructor(x, y, tape, id) {
        this.x = x;
        this.y = y;
        this.vx = random(-0.8, 0.8);
        this.vy = random(-0.8, 0.8);
        this.tape = tape;
        this.id = id;
        this.size = 8; // Increased from 4 to 8
        this.pulsePhase = random(TWO_PI);
        this.codeChanged = false; // Track if code has changed
        
        // Code execution state for behavior and phenotype - initialize FIRST
        this.interpreter = new BrainfuckInterpreter();
        this.executionCounter = 0;
        // Initialize with default values to prevent undefined errors
        this.lastExecutionResult = {
            operations: 0,
            memorySum: 0,
            memoryPattern: [0, 0, 0, 0, 0, 0, 0, 0],
            output: []
        };
        this.behaviorState = {
            preferredDirection: random(TWO_PI),
            activityLevel: 0.5,
            socialTendency: 0.5,
            orbitalTendency: 0.5,
            wanderTendency: 0.5,
            aggressiveness: 0.5,
            speedPreference: 1.0,
            outputInfluence: 0
        };
        
        // Track if this is the most complex organism
        this.isMostComplex = false;
        
        // Cluster behavior tracking
        this.clusterDensity = 0;
        this.scatterTimer = 0;
        this.isScattering = false;
        
        // Organic relationship tracking
        this.relationshipHistory = {}; // Track interactions with other organisms
        this.socialMomentum = { x: 0, y: 0 }; // Momentum from social interactions
        this.attractionField = 0; // Personal attraction/repulsion field strength
        
        // Explosion tracking
        this.explosionTimer = 0;
        this.isExploding = false;
        
        // Most complex tracking (can be one of the two most complex)
        this.isMostComplex = false;
        this.isSecondMostComplex = false;
        
        // Lifespan tracking
        this.age = 0; // Age in frames
        this.lifespan = floor(random(3000, 8000)); // Random lifespan between 3000-8000 frames (~50-133 seconds at 60fps)
        
        // Execute code once to initialize execution results
        this.executeCode();
        
        // Now calculate complexity and gray value (which depends on execution results)
        this.complexity = this.calculateComplexity();
        this.grayValue = this.getGrayValue();
        
        // Execute code once to initialize execution results
        this.executeCode();
    }

    calculateComplexity() {
        const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
        let count = 0;
        for (let c of this.tape) {
            if (validOps.includes(c)) count++;
        }
        return count;
    }

    getGrayValue() {
        // Base gray value from complexity
        let baseGray = map(this.complexity, 0, 64, 80, 240);
        
        // Modify based on code execution - memory patterns affect color
        if (this.lastExecutionResult.memorySum > 0) {
            const memoryInfluence = map(this.lastExecutionResult.memorySum % 256, 0, 255, -20, 20);
            baseGray = constrain(baseGray + memoryInfluence, 50, 250);
        }
        
        return baseGray;
    }
    
    executeCode() {
        // Execute organism's own code to determine behavior and phenotype
        this.executionCounter++;
        
        // Execute code every few frames (not every frame for performance)
        if (this.executionCounter % 5 === 0) {
            this.interpreter.reset();
            this.interpreter.setCode(this.tape);
            const operations = this.interpreter.run(100); // Limited steps for performance
            
            // Extract execution results
            const memorySum = this.interpreter.memory.reduce((a, b) => a + b, 0);
            const memoryPattern = [...this.interpreter.memory].slice(0, 8); // First 8 memory cells
            
            this.lastExecutionResult = {
                operations: operations,
                memorySum: memorySum,
                memoryPattern: memoryPattern,
                output: [...this.interpreter.output]
            };
            
            // Update behavior based on execution
            this.updateBehaviorFromCode();
        }
    }
    
    updateBehaviorFromCode() {
        const result = this.lastExecutionResult;
        
        // Behavior: Movement direction directly from memory pattern (code execution result)
        if (result.memoryPattern.length >= 2) {
            // Use memory values to directly determine direction - this is the code's "intention"
            const dirX = map(result.memoryPattern[0] % 256, 0, 255, -1, 1);
            const dirY = map(result.memoryPattern[1] % 256, 0, 255, -1, 1);
            this.behaviorState.preferredDirection = atan2(dirY, dirX);
        }
        
        // Behavior: Activity level directly from operations count (how much the code runs)
        this.behaviorState.activityLevel = map(constrain(result.operations, 0, 100), 0, 100, 0.1, 1.0);
        
        // Behavior: Social tendency from memory sum (code's computational state)
        this.behaviorState.socialTendency = map(result.memorySum % 1000, 0, 1000, 0, 1);
        
        // Behavior: Orbital tendency from memory pattern[2] (code's rotational preference)
        this.behaviorState.orbitalTendency = map(result.memoryPattern[2] % 256, 0, 255, 0, 1);
        
        // Behavior: Wandering tendency from memory pattern[3] (code's exploration preference)
        this.behaviorState.wanderTendency = map(result.memoryPattern[3] % 256, 0, 255, 0, 1);
        
        // Behavior: Aggressiveness from memory pattern[4] (code's interaction style)
        this.behaviorState.aggressiveness = map(result.memoryPattern[4] % 256, 0, 255, 0, 1);
        
        // Behavior: Speed preference from memory pattern[5] (code's movement style)
        this.behaviorState.speedPreference = map(result.memoryPattern[5] % 256, 0, 255, 0.3, 1.5);
        
        // Behavior: Output-based behavior - if code produces output, it affects behavior
        if (result.output.length > 0) {
            // Use output values to influence behavior
            const outputSum = result.output.reduce((a, b) => a + b, 0);
            this.behaviorState.outputInfluence = map(outputSum % 256, 0, 255, -0.2, 0.2);
        } else {
            this.behaviorState.outputInfluence = 0;
        }
    }

    update() {
        // Age the organism
        this.age++;
        
        // Execute code to update behavior and phenotype
        this.executeCode();
        
        // Movement based on code execution results (behavior)
        const activityLevel = this.behaviorState.activityLevel;
        const movementChance = activityLevel * activityLevel; // Square it
        
        if (this.codeChanged || random() < movementChance) {
            // Movement speed directly from code execution (speedPreference from memory pattern[5])
            const speedMultiplier = map(activityLevel, 0, 1, 0.1, 1.5) * this.behaviorState.speedPreference;
            
            // Direction directly from code execution (memory pattern[0] and [1] determine direction)
            const preferredDir = this.behaviorState.preferredDirection;
            const codeInfluence = 0.4 + (this.behaviorState.aggressiveness * 0.2); // More aggressive = stronger code influence
            this.vx += cos(preferredDir) * codeInfluence * activityLevel;
            this.vy += sin(preferredDir) * codeInfluence * activityLevel;
            
            // Output influence on movement (if code produces output, it affects behavior)
            if (this.behaviorState.outputInfluence !== 0) {
                const outputAngle = this.pulsePhase * 2;
                this.vx += cos(outputAngle) * this.behaviorState.outputInfluence * activityLevel;
                this.vy += sin(outputAngle) * this.behaviorState.outputInfluence * activityLevel;
            }
            
            // Fitness landscape influence - organisms move toward higher fitness
            if (typeof ecosystem !== 'undefined' && ecosystem && ecosystem.getFitnessGradient) {
                const fitness = ecosystem.getFitness(this.x, this.y);
                const gradient = ecosystem.getFitnessGradient(this.x, this.y);
                
                // Stronger organisms (higher complexity) are more sensitive to fitness gradients
                const fitnessSensitivity = map(this.complexity, 0, 64, 0.05, 0.3);
                const fitnessInfluence = fitnessSensitivity * (1 - activityLevel * 0.3);
                
                // Move toward higher fitness
                if (gradient.magnitude > 0.01) {
                    this.vx += (gradient.x / gradient.magnitude) * fitnessInfluence;
                    this.vy += (gradient.y / gradient.magnitude) * fitnessInfluence;
                }
            }
            
            // Apply movement
            this.x += this.vx * speedMultiplier;
            this.y += this.vy * speedMultiplier;
            
            // Pulse speed directly from code execution (memory pattern[7] affects pulse rate)
            const pulseSpeedMultiplier = this.lastExecutionResult.memoryPattern.length > 7
                ? map(this.lastExecutionResult.memoryPattern[7] % 256, 0, 255, 0.5, 1.5)
                : 1.0;
            const pulseSpeed = (0.05 + (activityLevel * 0.1)) * pulseSpeedMultiplier;
            this.pulsePhase += pulseSpeed;
            
            // Bounce off edges
            const margin = this.size;
            const bounceDamping = 0.8; // Reduce velocity on bounce (0.8 = 80% retained)
            
            // Bounce off left edge
            if (this.x < margin) {
                this.x = margin;
                this.vx = abs(this.vx) * bounceDamping; // Bounce right
            }
            // Bounce off right edge
            if (this.x > width - margin) {
                this.x = width - margin;
                this.vx = -abs(this.vx) * bounceDamping; // Bounce left
            }
            // Bounce off top edge
            if (this.y < margin) {
                this.y = margin;
                this.vy = abs(this.vy) * bounceDamping; // Bounce down
            }
            // Bounce off bottom edge
            if (this.y > height - margin) {
                this.y = height - margin;
                this.vy = -abs(this.vy) * bounceDamping; // Bounce up
            }
            
            // Reduced center pull - only for most complex organism, and much weaker
            const centerX = width / 2;
            const centerY = height / 2;
            const distFromCenter = dist(this.x, this.y, centerX, centerY);
            const maxDist = dist(0, 0, centerX, centerY);
            const normalizedDist = distFromCenter / maxDist;
            
            // Only most complex organism has center pull, and it's much weaker
            if (this.isMostComplex) {
                const centerPull = map(normalizedDist, 0, 1, 0, 0.08) * (1 - activityLevel * 0.5);
                const angleToCenter = atan2(centerY - this.y, centerX - this.x);
                this.vx += cos(angleToCenter) * centerPull;
                this.vy += sin(angleToCenter) * centerPull;
            }
            
            // Orbital movement directly from code execution (memory pattern[2])
            const orbitStrength = this.behaviorState.orbitalTendency * 0.15 * activityLevel;
            const orbitAngle = this.pulsePhase + (this.id * 0.1);
            this.vx += cos(orbitAngle) * orbitStrength;
            this.vy += sin(orbitAngle) * orbitStrength;
            
            // Wandering directly from code execution (memory pattern[3])
            const noiseX = noise(this.id * 0.01, time * 0.5) * 2 - 1;
            const noiseY = noise(this.id * 0.01 + 1000, time * 0.5) * 2 - 1;
            const wanderStrength = this.behaviorState.wanderTendency * map(activityLevel, 0, 1, 0.02, 0.12);
            this.vx += noiseX * wanderStrength;
            this.vy += noiseY * wanderStrength;
            
            // Random movement influenced by code execution (more operations = less random, more directed)
            const randomStrength = map(activityLevel, 0, 1, 0.02, 0.06) * (1 - this.behaviorState.aggressiveness);
            this.vx += random(-randomStrength, randomStrength);
            this.vy += random(-randomStrength, randomStrength);
            
            // Limit velocity with some variation based on activity
            const maxVel = 1.5 + (activityLevel * 0.5);
            this.vx = constrain(this.vx, -maxVel, maxVel);
            this.vy = constrain(this.vy, -maxVel, maxVel);
            
            // Add velocity damping to prevent excessive speed buildup
            this.vx *= 0.95;
            this.vy *= 0.95;
            
            // Reset flag after movement
            this.codeChanged = false;
        } else {
            // Still pulse even when not moving, speed directly from code execution
            const pulseSpeedMultiplier = this.lastExecutionResult.memoryPattern.length > 7
                ? map(this.lastExecutionResult.memoryPattern[7] % 256, 0, 255, 0.5, 1.5)
                : 1.0;
            const pulseSpeed = (0.02 + (activityLevel * 0.03)) * pulseSpeedMultiplier;
            this.pulsePhase += pulseSpeed;
        }
    }

    draw(isMostComplex = false) {
        push();
        translate(this.x, this.y);
        
        // Explosion effect - visual representation
        if (this.isExploding) {
            const explosionSize = map(this.explosionTimer, 10, 0, 1, 5);
            const explosionAlpha = map(this.explosionTimer, 10, 0, 200, 0);
            
            // Draw explosion rings
            for (let i = 0; i < 3; i++) {
                const ringSize = (this.size + this.complexity * 0.8) * explosionSize * (1 + i * 0.5);
                stroke(0, explosionAlpha);
                strokeWeight(2 - i);
                noFill();
                circle(0, 0, ringSize);
            }
            
            // Draw particles
            for (let i = 0; i < 8; i++) {
                const angle = (TWO_PI / 8) * i;
                const dist = (10 - this.explosionTimer) * 5;
                fill(0, explosionAlpha);
                noStroke();
                circle(cos(angle) * dist, sin(angle) * dist, 3);
            }
        }
        
        // Phenotype: Size directly from code execution (operations count)
        const executionSizeBonus = map(this.lastExecutionResult.operations, 0, 100, 0, 3);
        const pulse = sin(this.pulsePhase) * 0.2 + 1;
        const baseSize = this.size + this.complexity * 0.8;
        const currentSize = (baseSize + executionSizeBonus) * pulse;
        
        // Phenotype: Color directly from code execution (memorySum affects gray value)
        const gray = this.getGrayValue();
        
        // Phenotype: Shape variation directly from code execution (memory pattern[0])
        const shapeVariation = this.lastExecutionResult.memoryPattern.length > 0 
            ? map(this.lastExecutionResult.memoryPattern[0] % 256, 0, 255, 0.7, 1.3)
            : 1.0;
        
        // Phenotype: Shape complexity directly from code execution (memory pattern[6])
        const shapeComplexity = this.lastExecutionResult.memoryPattern.length > 6
            ? map(this.lastExecutionResult.memoryPattern[6] % 256, 0, 255, 0.5, 2.0)
            : 1.0;
        
        // Phenotype: Pulse speed directly from code execution (memory pattern[7])
        const pulseSpeedMultiplier = this.lastExecutionResult.memoryPattern.length > 7
            ? map(this.lastExecutionResult.memoryPattern[7] % 256, 0, 255, 0.5, 1.5)
            : 1.0;
        
        // Special highlighting for most complex organisms
        if (isMostComplex || this.isSecondMostComplex) {
            // Pulsing outer glow ring
            const glowPulse = sin(this.pulsePhase * 2) * 0.3 + 0.7;
            stroke(0);
            strokeWeight(3 * glowPulse);
            noFill();
            circle(0, 0, currentSize * 2.5);
            
            // Multiple concentric rings
            stroke(0);
            strokeWeight(2);
            circle(0, 0, currentSize * 2.2);
            strokeWeight(1);
            circle(0, 0, currentSize * 2.8);
        }
        
        // Amoeba-like organic blob shape
        fill(gray);
        noStroke();
        
        beginShape();
        const numPoints = 12;
        for (let i = 0; i < numPoints; i++) {
            const angle = (TWO_PI / numPoints) * i;
            // Noise-based variation directly from code execution (shapeComplexity affects noise)
            const noiseValue = noise(
                this.id * 0.1 + i * 0.5 * shapeComplexity, 
                this.pulsePhase * 0.1 * pulseSpeedMultiplier
            );
            const radiusVariation = map(noiseValue, 0, 1, 0.7, 1.3) * shapeVariation;
            
            // Phenotype: Shape directly from code execution (memory pattern values)
            let memoryInfluence = 1.0;
            if (this.lastExecutionResult.memoryPattern.length > i % 8) {
                memoryInfluence = map(this.lastExecutionResult.memoryPattern[i % 8] % 256, 0, 255, 0.9, 1.1);
            }
            
            const radius = currentSize * 0.5 * radiusVariation * memoryInfluence;
            
            // Pulsing variation directly from code execution (pulseSpeedMultiplier affects pulse)
            const pulseVariation = sin(this.pulsePhase * pulseSpeedMultiplier + i * 0.5) * 0.15;
            const finalRadius = radius * (1 + pulseVariation);
            
            const x = cos(angle) * finalRadius;
            const y = sin(angle) * finalRadius;
            vertex(x, y);
        }
        endShape(CLOSE);
        
        // Inner blob for depth
        fill(gray + 20, 150);
        beginShape();
        for (let i = 0; i < numPoints; i++) {
            const angle = (TWO_PI / numPoints) * i;
            const noiseValue = noise(this.id * 0.1 + i * 0.5, this.pulsePhase * 0.1);
            const radiusVariation = map(noiseValue, 0, 1, 0.7, 1.3);
            const radius = currentSize * 0.3 * radiusVariation;
            const x = cos(angle) * radius;
            const y = sin(angle) * radius;
            vertex(x, y);
        }
        endShape(CLOSE);
        
        // Subtle outer ring for high complexity
        if (this.complexity > 15) {
            stroke(gray, 50);
            strokeWeight(1);
            noFill();
            beginShape();
            for (let i = 0; i < numPoints; i++) {
                const angle = (TWO_PI / numPoints) * i;
                const noiseValue = noise(this.id * 0.1 + i * 0.5, this.pulsePhase * 0.1);
                const radiusVariation = map(noiseValue, 0, 1, 0.7, 1.3);
                const radius = currentSize * 0.75 * radiusVariation;
                const x = cos(angle) * radius;
                const y = sin(angle) * radius;
                vertex(x, y);
            }
            endShape(CLOSE);
        }
        
        // Display code next to organism - show ALL code with wrapping
        push();
        translate(0, currentSize + 15);
        
        // Show only valid Brainfuck instructions - NO LIMIT
        const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
        let codeDisplay = '';
        for (let c of this.tape) {
            if (validOps.includes(c)) {
                codeDisplay += c;
            }
        }
        
        // Only show if there are valid instructions
        if (codeDisplay.length > 0) {
            const maxWidth = 200; // Maximum width before wrapping
            const isComplex = isMostComplex || this.isSecondMostComplex;
            const lineHeight = isComplex ? 12 * 3 : 10; // 3x larger line height for complex organisms
            
            if (isMostComplex || this.isSecondMostComplex) {
                // Enhanced display for most complex organisms - use same font size and color as title
                const textSizeVal = constrain(windowWidth / 60, 14, 24) * 1.33; // Same as title
                fill(30); // Match title color
                textSize(textSizeVal);
                textStyle(NORMAL); // Match title style
                textAlign(CENTER);
                textFont('Courier New'); // Match title font
                
                // Calculate wrapped text
                let words = codeDisplay.split('');
                let currentLine = '';
                let lines = [];
                
                // Use same max width calculation as title
                const titleMaxWidth = width - 40; // Same as title
                
                for (let char of words) {
                    const testLine = currentLine + char;
                    const testWidth = textWidth(testLine);
                    
                    if (testWidth > titleMaxWidth && currentLine.length > 0) {
                        lines.push(currentLine);
                        currentLine = char;
                    } else {
                        currentLine = testLine;
                    }
                }
                if (currentLine.length > 0) {
                    lines.push(currentLine);
                }
                
                // No background - transparent so organism is visible
                // Draw text lines with same styling as title
                fill(30); // Match title color
                const titleLineHeight = textSizeVal * 1.2; // Same as title
                for (let i = 0; i < lines.length; i++) {
                    text(lines[i], 0, (i - lines.length/2 + 0.5) * titleLineHeight);
                }
            } else {
                fill(80, 180);
                textSize(8);
                textAlign(CENTER);
                textStyle(NORMAL);
                
                // Calculate wrapped text for regular organisms
                let words = codeDisplay.split('');
                let currentLine = '';
                let lines = [];
                
                for (let char of words) {
                    const testLine = currentLine + char;
                    const testWidth = textWidth(testLine);
                    
                    if (testWidth > maxWidth && currentLine.length > 0) {
                        lines.push(currentLine);
                        currentLine = char;
                    } else {
                        currentLine = testLine;
                    }
                }
                if (currentLine.length > 0) {
                    lines.push(currentLine);
                }
                
                // Draw text lines
                for (let i = 0; i < lines.length; i++) {
                    text(lines[i], 0, i * lineHeight);
                }
            }
        }
        pop();
        
        pop();
    }

    checkCollision(other) {
        const d = dist(this.x, this.y, other.x, other.y);
        // Behavior: Social tendency affects collision detection range
        const socialRange = (this.size + other.size) * 2;
        const adjustedRange = socialRange * (1 + (this.behaviorState.socialTendency + other.behaviorState.socialTendency) * 0.3);
        return d < adjustedRange;
    }
}

// Sound functions - defined before BFFEcosystem class to ensure they're available
function playSplittingSound(org) {
    if (!audioContext || !soundEnabled) return;
    
    try {
        // Generate sound based on organism's code characteristics
        const complexity = org.complexity || 0;
        const memorySum = org.lastExecutionResult.memorySum || 0;
        const operations = org.lastExecutionResult.operations || 0;
        const memoryPattern = org.lastExecutionResult.memoryPattern || [0, 0, 0, 0, 0, 0, 0, 0];
        
        // Base frequency based on complexity (bee-like buzzing: 200-400 Hz)
        const baseFreq = map(constrain(complexity, 0, 64), 0, 64, 200, 400); // Bee frequency range
        
        // Duration based on operations (more operations = longer drone)
        const duration = map(constrain(operations, 0, 100), 0, 100, 0.4, 1.2);
        
        // End frequency based on memory sum (creates subtle drift in drone)
        const endFreq = map(constrain(memorySum % 1000, 0, 1000), 0, 1000, baseFreq * 0.85, baseFreq * 1.15);
        
        // Create multiple oscillators for complex, layered sound
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const oscillator3 = audioContext.createOscillator();
        const gainNode1 = audioContext.createGain();
        const gainNode2 = audioContext.createGain();
        const gainNode3 = audioContext.createGain();
        const masterGain = audioContext.createGain();
        
        // Connect oscillators to gain nodes, then to master gain
        oscillator1.connect(gainNode1);
        oscillator2.connect(gainNode2);
        oscillator3.connect(gainNode3);
        gainNode1.connect(masterGain);
        gainNode2.connect(masterGain);
        gainNode3.connect(masterGain);
        masterGain.connect(audioContext.destination);
        
        const now = audioContext.currentTime;
        
        // Create drone-like sound with slow, subtle modulation
        const modulator1 = audioContext.createOscillator();
        const modulator2 = audioContext.createOscillator();
        const modGain1 = audioContext.createGain();
        const modGain2 = audioContext.createGain();
        
        // Slow, subtle modulation for drone effect (2-6 Hz modulation rate)
        modulator1.frequency.value = map(constrain(memorySum % 100, 0, 100), 0, 100, 2, 6);
        modulator2.frequency.value = map(constrain((memorySum + 50) % 100, 0, 100), 0, 100, 1.5, 5);
        modGain1.gain.value = map(constrain(complexity, 0, 64), 0, 64, 3, 8); // Subtle modulation for drone
        modGain2.gain.value = map(constrain(complexity, 0, 64), 0, 64, 2, 5);
        
        // Connect modulators to oscillators for subtle drone variation
        modulator1.connect(modGain1);
        modulator2.connect(modGain2);
        modGain1.connect(oscillator1.frequency);
        modGain2.connect(oscillator2.frequency);
        
        // Main oscillator (fundamental frequency with subtle drone)
        oscillator1.frequency.setValueAtTime(baseFreq, now);
        oscillator1.frequency.linearRampToValueAtTime(endFreq, now + duration);
        oscillator1.type = 'sine'; // Sine wave for smooth drone
        
        // Second oscillator (slightly detuned for depth)
        const freq2 = baseFreq * 0.5; // Octave below for depth
        oscillator2.frequency.setValueAtTime(freq2, now);
        oscillator2.frequency.linearRampToValueAtTime(freq2 * (endFreq / baseFreq), now + duration);
        oscillator2.type = 'triangle'; // Triangle for smooth drone
        
        // Third oscillator (subharmonic for depth)
        const freq3 = baseFreq * 0.75;
        oscillator3.frequency.setValueAtTime(freq3, now);
        oscillator3.frequency.linearRampToValueAtTime(freq3 * (endFreq / baseFreq), now + duration);
        oscillator3.type = 'sine'; // Sine for smooth drone
        
        // Drone envelope: smooth attack, sustained, gentle decay
        const attackTime = 0.1; // Slower attack for drone
        const sustainTime = duration * 0.7; // Most of the duration is sustained
        const fadeOutTime = 0.05; // 50ms fade-out
        const baseVolume = map(constrain(complexity, 0, 64), 0, 64, 0.15, 0.35); // Increased volume for audibility
        
        // Main oscillator envelope
        gainNode1.gain.setValueAtTime(0, now);
        gainNode1.gain.linearRampToValueAtTime(baseVolume, now + attackTime);
        gainNode1.gain.setValueAtTime(baseVolume, now + attackTime + sustainTime);
        gainNode1.gain.linearRampToValueAtTime(baseVolume, now + duration - fadeOutTime);
        gainNode1.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        // Second oscillator envelope (quieter)
        gainNode2.gain.setValueAtTime(0, now);
        gainNode2.gain.linearRampToValueAtTime(baseVolume * 0.4, now + attackTime);
        gainNode2.gain.setValueAtTime(baseVolume * 0.4, now + attackTime + sustainTime);
        gainNode2.gain.linearRampToValueAtTime(baseVolume * 0.4, now + duration - fadeOutTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        // Third oscillator envelope (even quieter for depth)
        gainNode3.gain.setValueAtTime(0, now);
        gainNode3.gain.linearRampToValueAtTime(baseVolume * 0.25, now + attackTime);
        gainNode3.gain.setValueAtTime(baseVolume * 0.25, now + attackTime + sustainTime);
        gainNode3.gain.linearRampToValueAtTime(baseVolume * 0.25, now + duration - fadeOutTime);
        gainNode3.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        // Start all oscillators and modulators for drone
        modulator1.start(now);
        modulator2.start(now);
        oscillator1.start(now);
        oscillator2.start(now);
        oscillator3.start(now);
        modulator1.stop(now + duration + 0.01);
        modulator2.stop(now + duration + 0.01);
        oscillator1.stop(now + duration + 0.01);
        oscillator2.stop(now + duration + 0.01);
        oscillator3.stop(now + duration + 0.01);
    } catch (e) {
        // Silently fail if audio context is not available
    }
}

// Interaction sound - plays when organisms interact
function playInteractionSound(org1, org2, operations) {
    if (!audioContext || !soundEnabled) return;
    
    try {
        // Blend characteristics from both organisms
        const complexity1 = org1.complexity || 0;
        const complexity2 = org2.complexity || 0;
        const avgComplexity = (complexity1 + complexity2) / 2;
        
        const memorySum1 = org1.lastExecutionResult.memorySum || 0;
        const memorySum2 = org2.lastExecutionResult.memorySum || 0;
        const blendedMemorySum = (memorySum1 + memorySum2) / 2;
        
        // Base frequency from blended complexity (bee-like buzzing: 250-450 Hz)
        const baseFreq = map(constrain(avgComplexity, 0, 64), 0, 64, 250, 450); // Bee frequency range
        
        // Duration based on operations
        const duration = map(constrain(operations, 5, 100), 5, 100, 0.2, 0.6);
        
        // Create multiple oscillators for complex, layered sound
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const modulator1 = audioContext.createOscillator(); // For frequency modulation
        const modulator2 = audioContext.createOscillator(); // Second modulator
        const modGain1 = audioContext.createGain();
        const modGain2 = audioContext.createGain();
        const gainNode1 = audioContext.createGain();
        const gainNode2 = audioContext.createGain();
        const masterGain = audioContext.createGain();
        
        // Set up slow, subtle frequency modulation for drone (2-8 Hz modulation rate)
        const modFreq1 = map(constrain(blendedMemorySum % 100, 0, 100), 0, 100, 2, 8); // Slow modulation for drone
        const modFreq2 = map(constrain((blendedMemorySum + 50) % 100, 0, 100), 0, 100, 1.5, 7); // Second slow modulation
        modGain1.gain.value = map(constrain(avgComplexity, 0, 64), 0, 64, 4, 10); // Subtle modulation for drone
        modGain2.gain.value = map(constrain(avgComplexity, 0, 64), 0, 64, 3, 8); // Subtle second modulation
        
        // Connect modulation for first oscillator
        modulator1.connect(modGain1);
        modGain1.connect(oscillator1.frequency);
        
        // Connect modulation for second oscillator
        modulator2.connect(modGain2);
        modGain2.connect(oscillator2.frequency);
        
        // Connect oscillators to gain nodes, then to master gain
        oscillator1.connect(gainNode1);
        oscillator2.connect(gainNode2);
        gainNode1.connect(masterGain);
        gainNode2.connect(masterGain);
        masterGain.connect(audioContext.destination);
        
        const now = audioContext.currentTime;
        
        // First oscillator (main frequency with subtle drone)
        oscillator1.frequency.setValueAtTime(baseFreq, now);
        oscillator1.type = 'sine'; // Sine wave for smooth drone
        
        // Second oscillator (slightly detuned for depth)
        const freq2 = baseFreq * 0.6; // Lower harmonic for depth
        oscillator2.frequency.setValueAtTime(freq2, now);
        oscillator2.type = 'triangle'; // Triangle for smooth drone
        
        // Set modulator frequencies
        modulator1.frequency.value = modFreq1;
        modulator2.frequency.value = modFreq2;
        
        // Envelope: quick attack, sustained, gentle decay
        const attackTime = 0.05;
        const sustainTime = duration * 0.6;
        const baseVolume = map(constrain(avgComplexity, 0, 64), 0, 64, 0.12, 0.3); // Increased volume for audibility
        const fadeOutTime = 0.03;
        
        // Envelope for first oscillator
        gainNode1.gain.setValueAtTime(0, now);
        gainNode1.gain.linearRampToValueAtTime(baseVolume, now + attackTime);
        gainNode1.gain.setValueAtTime(baseVolume, now + attackTime + sustainTime);
        gainNode1.gain.linearRampToValueAtTime(baseVolume, now + duration - fadeOutTime);
        gainNode1.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        // Envelope for second oscillator (quieter)
        gainNode2.gain.setValueAtTime(0, now);
        gainNode2.gain.linearRampToValueAtTime(baseVolume * 0.5, now + attackTime);
        gainNode2.gain.setValueAtTime(baseVolume * 0.5, now + attackTime + sustainTime);
        gainNode2.gain.linearRampToValueAtTime(baseVolume * 0.5, now + duration - fadeOutTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        modulator1.type = 'sine';
        modulator2.type = 'sine';
        
        // Start all oscillators and modulators
        modulator1.start(now);
        modulator2.start(now);
        oscillator1.start(now);
        oscillator2.start(now);
        modulator1.stop(now + duration + 0.01);
        modulator2.stop(now + duration + 0.01);
        oscillator1.stop(now + duration + 0.01);
        oscillator2.stop(now + duration + 0.01);
    } catch (e) {
        // Silently fail if audio context is not available
    }
}

function playFusionSound(org1, org2) {
    if (!audioContext || !soundEnabled) return;
    
    try {
        // Blend characteristics from both organisms for fusion
        const complexity1 = org1.complexity || 0;
        const complexity2 = org2.complexity || 0;
        
        const memorySum1 = org1.lastExecutionResult.memorySum || 0;
        const memorySum2 = org2.lastExecutionResult.memorySum || 0;
        
        // Create bee-like buzzing oscillators for fusion
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const modulator1 = audioContext.createOscillator();
        const modulator2 = audioContext.createOscillator();
        const modGain1 = audioContext.createGain();
        const modGain2 = audioContext.createGain();
        const gainNode1 = audioContext.createGain();
        const gainNode2 = audioContext.createGain();
        const masterGain = audioContext.createGain();
        
        // Slow, subtle modulation for drone (2-6 Hz)
        modulator1.frequency.value = map(constrain(memorySum1 % 100, 0, 100), 0, 100, 2, 6);
        modulator2.frequency.value = map(constrain(memorySum2 % 100, 0, 100), 0, 100, 1.5, 5.5);
        modGain1.gain.value = 5; // Subtle modulation for drone
        modGain2.gain.value = 4;
        
        // Connect modulators
        modulator1.connect(modGain1);
        modulator2.connect(modGain2);
        modGain1.connect(oscillator1.frequency);
        modGain2.connect(oscillator2.frequency);
        
        // Connect both oscillators to master gain
        oscillator1.connect(gainNode1);
        oscillator2.connect(gainNode2);
        gainNode1.connect(masterGain);
        gainNode2.connect(masterGain);
        masterGain.connect(audioContext.destination);
        
        const now = audioContext.currentTime;
        const duration = 0.8; // Longer for fusion event
        
        // First oscillator based on org1 (drone frequency range)
        const freq1 = map(constrain(complexity1, 0, 64), 0, 64, 200, 400);
        oscillator1.frequency.setValueAtTime(freq1, now);
        oscillator1.frequency.linearRampToValueAtTime(freq1 * 1.02, now + duration); // Very subtle drift
        oscillator1.type = 'sine'; // Smooth drone
        
        // Second oscillator based on org2 (slightly detuned for depth)
        const freq2 = map(constrain(complexity2, 0, 64), 0, 64, 220, 420);
        oscillator2.frequency.setValueAtTime(freq2, now);
        oscillator2.frequency.linearRampToValueAtTime(freq2 * 0.99, now + duration); // Very subtle drift
        oscillator2.type = 'triangle'; // Smooth drone
        
        // Envelope: smooth attack, sustained blend, gentle decay
        const attackTime = 0.1;
        const sustainTime = duration * 0.7;
        const volume = 0.25; // Increased volume for audibility
        
        gainNode1.gain.setValueAtTime(0, now);
        gainNode1.gain.linearRampToValueAtTime(volume, now + attackTime);
        gainNode1.gain.setValueAtTime(volume, now + attackTime + sustainTime);
        // Smooth fade-out to prevent clicks
        const fadeOutTime = 0.05; // 50ms fade-out
        gainNode1.gain.linearRampToValueAtTime(volume, now + duration - fadeOutTime);
        gainNode1.gain.exponentialRampToValueAtTime(0.001, now + duration); // Very gentle fade to near-zero
        
        gainNode2.gain.setValueAtTime(0, now);
        gainNode2.gain.linearRampToValueAtTime(volume, now + attackTime);
        gainNode2.gain.setValueAtTime(volume, now + attackTime + sustainTime);
        gainNode2.gain.linearRampToValueAtTime(volume, now + duration - fadeOutTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.001, now + duration); // Very gentle fade to near-zero
        
        // Start modulators and oscillators for drone
        modulator1.start(now);
        modulator2.start(now);
        oscillator1.start(now);
        oscillator2.start(now);
        modulator1.stop(now + duration);
        modulator2.stop(now + duration);
        oscillator1.stop(now + duration);
        oscillator2.stop(now + duration);
    } catch (e) {
        // Silently fail if audio context is not available
    }
}

class BFFEcosystem {
    constructor(numOrganisms = 250) {
        this.organisms = [];
        this.interpreter = new BrainfuckInterpreter();
        this.interactionCount = 0;
        this.totalOperations = 0;
        this.maxOperations = 0;
        this.operationsHistory = [];
        this.isRunning = false;
        this.speed = 1;
        this.maxPopulation = 400; // Maximum number of organisms
        this.nextId = numOrganisms;
        
        // Statistics tracking
        this.explosionCount = 0; // Renamed to splittingCount conceptually
        this.absorptionCount = 0;
        this.offspringCount = 0; // Total offspring created from splittings
        this.deadCount = 0; // Total organisms that have died
        
        // Fitness landscape parameters
        this.fitnessLandscape = {
            scale: 0.01, // Scale for noise function
            time: 0,
            centers: [] // Multiple fitness peaks
        };
        
        // Initialize fitness peaks
        this.initializeFitnessLandscape();
        
        this.initializeEcosystem(numOrganisms);
    }
    
    initializeFitnessLandscape() {
        // Create multiple fitness peaks across the landscape
        const numPeaks = 5;
        this.fitnessLandscape.centers = [];
        for (let i = 0; i < numPeaks; i++) {
            this.fitnessLandscape.centers.push({
                x: random(width * 0.2, width * 0.8),
                y: random(height * 0.2, height * 0.8),
                strength: random(0.5, 1.5),
                radius: random(150, 300)
            });
        }
    }
    
    getFitness(x, y) {
        // Base fitness from noise (creates organic landscape)
        const noiseFitness = noise(x * this.fitnessLandscape.scale, 
                                   y * this.fitnessLandscape.scale, 
                                   this.fitnessLandscape.time) * 0.5;
        
        // Add fitness from peaks
        let peakFitness = 0;
        for (let peak of this.fitnessLandscape.centers) {
            const d = dist(x, y, peak.x, peak.y);
            const peakValue = peak.strength * exp(-(d * d) / (peak.radius * peak.radius));
            peakFitness = max(peakFitness, peakValue);
        }
        
        // Combine noise and peaks
        return noiseFitness + peakFitness;
    }
    
    getFitnessGradient(x, y) {
        // Calculate gradient direction (direction of increasing fitness)
        const delta = 5;
        const fx = this.getFitness(x + delta, y);
        const fy = this.getFitness(x, y + delta);
        const f = this.getFitness(x, y);
        
        const gradX = (fx - f) / delta;
        const gradY = (fy - f) / delta;
        
        return { x: gradX, y: gradY, magnitude: sqrt(gradX * gradX + gradY * gradY) };
    }
    
    drawFitnessLandscape() {
        // Draw subtle fitness landscape visualization
        push();
        noStroke();
        
        const resolution = 40; // Grid resolution for performance
        for (let x = 0; x < width; x += resolution) {
            for (let y = 0; y < height; y += resolution) {
                const fitness = this.getFitness(x, y);
                // Map fitness to subtle gray background
                const gray = map(fitness, 0, 2, 255, 245);
                fill(gray, 30); // Very transparent
                rect(x, y, resolution, resolution);
            }
        }
        
        pop();
    }

    initializeEcosystem(numOrganisms) {
        this.organisms = [];
        const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
        
        for (let i = 0; i < numOrganisms; i++) {
            let tape = '';
            for (let j = 0; j < 64; j++) {
                if (Math.random() < 0.03125) {
                    tape += validOps[Math.floor(Math.random() * validOps.length)];
                } else {
                    tape += String.fromCharCode(Math.floor(Math.random() * 256));
                }
            }
            
            const x = random(50, width - 50);
            const y = random(50, height - 50);
            this.organisms.push(new Organism(x, y, tape, i));
        }
    }

    interact(org1, org2) {
        const combined = org1.tape + org2.tape;
        this.interpreter.reset();
        this.interpreter.setCode(combined);
        const operations = this.interpreter.run(1000);
        
        this.totalOperations += operations;
        this.interactionCount++;
        
        // Play interaction sound - modulated based on both organisms' code
        if (operations > 5) { // Only play sound for meaningful interactions
            playInteractionSound(org1, org2, operations);
        }
        
        if (operations > this.maxOperations) {
            this.maxOperations = operations;
        }
        
        // Record for history
        this.operationsHistory.push({
            interaction: this.interactionCount,
            operations: operations
        });
        
        // Keep history manageable
        if (this.operationsHistory.length > 500) {
            this.operationsHistory.shift();
        }
        
        // Organic code evolution - relationships influence learning
        // Get fitness values (will be reused later)
        const fitness1 = this.getFitness(org1.x, org1.y);
        const fitness2 = this.getFitness(org2.x, org2.y);
        const avgFitness = (fitness1 + fitness2) / 2;
        const fitnessMultiplier = 1 + map(avgFitness, 0, 2, 0, 1);
        
        // Initialize relationship history if needed
        if (!org1.relationshipHistory[org2.id]) {
            org1.relationshipHistory[org2.id] = { interactions: 0, lastSeen: 0, affinity: random(0.5, 1.5) };
        }
        if (!org2.relationshipHistory[org1.id]) {
            org2.relationshipHistory[org1.id] = { interactions: 0, lastSeen: 0, affinity: random(0.5, 1.5) };
        }
        
        // Relationship affinity affects learning
        const affinity1 = org1.relationshipHistory[org2.id].affinity;
        const affinity2 = org2.relationshipHistory[org1.id].affinity;
        const relationshipBonus = (affinity1 + affinity2) / 2;
        
        // Successful interactions strengthen relationships
        if (operations > 10) {
            org1.relationshipHistory[org2.id].interactions++;
            org2.relationshipHistory[org1.id].interactions++;
            org1.relationshipHistory[org2.id].affinity = min(2.0, org1.relationshipHistory[org2.id].affinity + 0.02);
            org2.relationshipHistory[org1.id].affinity = min(2.0, org2.relationshipHistory[org1.id].affinity + 0.02);
        }
        
        if (operations > 5) {
            // Organic learning - stronger relationships = better learning
            const learningChance = 0.1 * fitnessMultiplier * relationshipBonus;
            if (random() < learningChance) {
                this.evolveCode(org1, org2, operations);
            }
            
            // Organic trading - relationships enable better code exchange
            const tradingChance = 0.15 * fitnessMultiplier * relationshipBonus;
            if (random() < tradingChance) {
                this.tradeCode(org1, org2);
            }
        }
        
        // Replication - successful interactions can create offspring
        // Fitness influences replication chance (fitness already calculated above)
        
        if (operations > 10 && this.organisms.length < this.maxPopulation) {
            const baseReplicationChance = map(operations, 10, 100, 0.02, 0.1);
            // Higher fitness = higher replication chance
            const fitnessBonus = map(avgFitness, 0, 2, 0, 0.15);
            const replicationChance = baseReplicationChance + fitnessBonus;
            
            if (random() < replicationChance) {
                this.replicate(org1, org2, operations);
            }
        }
        
        // Random mutation (rare)
        if (random() < 0.01) { // 1% chance
            this.mutateCode(org1);
        }
        if (random() < 0.01) {
            this.mutateCode(org2);
        }
        
        return operations;
    }

    tradeCode(org1, org2) {
        // Exchange code segments between organisms
        const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
        
        // Extract valid instruction segments from both organisms
        let segment1 = '';
        let segment2 = '';
        
        for (let c of org1.tape) {
            if (validOps.includes(c)) segment1 += c;
        }
        for (let c of org2.tape) {
            if (validOps.includes(c)) segment2 += c;
        }
        
        // If both have valid segments, trade parts
        if (segment1.length > 3 && segment2.length > 3) {
            const tradeLength = min(5, floor(min(segment1.length, segment2.length) / 3));
            const start1 = floor(random(segment1.length - tradeLength));
            const start2 = floor(random(segment2.length - tradeLength));
            
            const traded1 = segment1.substring(start1, start1 + tradeLength);
            const traded2 = segment2.substring(start2, start2 + tradeLength);
            
            // Find positions in original tapes and swap
            let pos1 = 0, pos2 = 0;
            let count1 = 0, count2 = 0;
            
            // Find where to insert traded segments
            for (let i = 0; i < org1.tape.length && count1 < start1; i++) {
                if (validOps.includes(org1.tape[i])) count1++;
                if (count1 < start1) pos1 = i + 1;
            }
            
            for (let i = 0; i < org2.tape.length && count2 < start2; i++) {
                if (validOps.includes(org2.tape[i])) count2++;
                if (count2 < start2) pos2 = i + 1;
            }
            
            // Insert traded segments (simplified - replace segments)
            if (pos1 < org1.tape.length && pos2 < org2.tape.length) {
                // Replace segments in tapes
                const newTape1 = org1.tape.substring(0, pos1) + traded2 + org1.tape.substring(pos1 + tradeLength);
                const newTape2 = org2.tape.substring(0, pos2) + traded1 + org2.tape.substring(pos2 + tradeLength);
                
                if (newTape1.length === org1.tape.length && newTape2.length === org2.tape.length) {
                    org1.tape = newTape1;
                    org2.tape = newTape2;
                    org1.complexity = org1.calculateComplexity();
                    org2.complexity = org2.calculateComplexity();
                    org1.grayValue = org1.getGrayValue();
                    org2.grayValue = org2.getGrayValue();
                    org1.codeChanged = true;
                    org2.codeChanged = true;
                }
            }
        }
    }

    replicate(org1, org2, operations) {
        // Create a new organism from the combination of two parents
        const combined = org1.tape + org2.tape;
        
        // Create offspring with combined code (might be longer, so trim to 64)
        let offspringTape = combined;
        if (offspringTape.length > 64) {
            // Take best parts - more valid instructions
            const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
            let validSegments = [];
            let currentSegment = '';
            
            for (let i = 0; i < combined.length; i++) {
                if (validOps.includes(combined[i])) {
                    currentSegment += combined[i];
                } else {
                    if (currentSegment.length > 0) {
                        validSegments.push(currentSegment);
                        currentSegment = '';
                    }
                }
            }
            if (currentSegment.length > 0) {
                validSegments.push(currentSegment);
            }
            
            // Combine segments up to 64 bytes
            offspringTape = '';
            for (let seg of validSegments) {
                if (offspringTape.length + seg.length <= 64) {
                    offspringTape += seg;
                } else {
                    const remaining = 64 - offspringTape.length;
                    offspringTape += seg.substring(0, remaining);
                    break;
                }
            }
            
            // Fill rest with random bytes if needed
            while (offspringTape.length < 64) {
                offspringTape += String.fromCharCode(Math.floor(Math.random() * 256));
            }
        }
        
        // Create new organism at midpoint between parents
        const x = (org1.x + org2.x) / 2 + random(-20, 20);
        const y = (org1.y + org2.y) / 2 + random(-20, 20);
        
        const offspring = new Organism(
            constrain(x, 50, width - 50),
            constrain(y, 50, height - 50),
            offspringTape,
            this.nextId++
        );
        
        // Offspring starts with movement from code inheritance
        offspring.codeChanged = true;
        offspring.vx = (org1.vx + org2.vx) / 2 + random(-0.5, 0.5);
        offspring.vy = (org1.vy + org2.vy) / 2 + random(-0.5, 0.5);
        
        this.organisms.push(offspring);
    }

    evolveCode(org1, org2, operations) {
        // The organism with more operations influences the other
        // Extract successful patterns from the combined code
        const combined = org1.tape + org2.tape;
        const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
        
        // Find patterns of valid instructions
        let pattern = '';
        for (let i = 0; i < combined.length; i++) {
            if (validOps.includes(combined[i])) {
                pattern += combined[i];
            }
        }
        
        // If we found a good pattern, organisms might adopt parts of it
        if (pattern.length > 2 && operations > 10) {
            // Copy a small segment to one of the organisms
            const segmentLength = min(8, floor(pattern.length / 4));
            const startIdx = floor(random(pattern.length - segmentLength));
            const segment = pattern.substring(startIdx, startIdx + segmentLength);
            
            // Insert into random position in organism's tape
            const targetOrg = random() < 0.5 ? org1 : org2;
            const insertPos = floor(random(targetOrg.tape.length - segmentLength));
            
            // Replace part of tape with the segment
            const newTape = targetOrg.tape.substring(0, insertPos) + 
                          segment + 
                          targetOrg.tape.substring(insertPos + segmentLength);
            targetOrg.tape = newTape;
            targetOrg.complexity = targetOrg.calculateComplexity();
            targetOrg.grayValue = targetOrg.getGrayValue();
            targetOrg.codeChanged = true; // Mark that code changed
        }
    }

    mutateCode(org) {
        const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
        const mutationType = random();
        
        if (mutationType < 0.3) {
            // Insert random valid instruction
            const pos = floor(random(org.tape.length));
            const newOp = validOps[floor(random(validOps.length))];
            org.tape = org.tape.substring(0, pos) + newOp + org.tape.substring(pos + 1);
        } else if (mutationType < 0.6) {
            // Replace random byte with valid instruction
            const pos = floor(random(org.tape.length));
            const newOp = validOps[floor(random(validOps.length))];
            org.tape = org.tape.substring(0, pos) + newOp + org.tape.substring(pos + 1);
        } else {
            // Small random change to a byte
            const pos = floor(random(org.tape.length));
            const currentByte = org.tape.charCodeAt(pos);
            const newByte = String.fromCharCode((currentByte + floor(random(-5, 6)) + 256) % 256);
            org.tape = org.tape.substring(0, pos) + newByte + org.tape.substring(pos + 1);
        }
        
        // Recalculate complexity
        org.complexity = org.calculateComplexity();
        org.grayValue = org.getGrayValue();
        org.codeChanged = true; // Mark that code changed
    }
    
    explodeOrganism(org) {
        // When organism reaches 64 valid instructions, explode into simpler organisms
        const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
        
        // Extract all valid instructions
        let validCode = '';
        for (let c of org.tape) {
            if (validOps.includes(c)) {
                validCode += c;
            }
        }
        
        // Create 3-5 simpler organisms from the explosion
        const numOffspring = floor(random(3, 6));
        const codePerOffspring = floor(validCode.length / numOffspring);
        
        // Count actual offspring that will be created (may be limited by population)
        let actualOffspringCreated = 0;
        
        for (let i = 0; i < numOffspring && this.organisms.length < this.maxPopulation; i++) {
            // Extract code segment for this offspring
            const startIdx = i * codePerOffspring;
            const endIdx = (i === numOffspring - 1) ? validCode.length : (i + 1) * codePerOffspring;
            let offspringCode = validCode.substring(startIdx, endIdx);
            
            // Fill to 64 bytes with random bytes
            while (offspringCode.length < 64) {
                if (random() < 0.1) {
                    // 10% chance to add valid instruction
                    offspringCode += validOps[floor(random(validOps.length))];
                } else {
                    // 90% chance to add random byte
                    offspringCode += String.fromCharCode(Math.floor(Math.random() * 256));
                }
            }
            offspringCode = offspringCode.substring(0, 64); // Ensure exactly 64 bytes
            
            // Create offspring at explosion location with random velocity
            const angle = (TWO_PI / numOffspring) * i + random(-0.3, 0.3);
            const explosionSpeed = random(3, 6);
            const offsetX = cos(angle) * explosionSpeed * 20;
            const offsetY = sin(angle) * explosionSpeed * 20;
            
            const x = constrain(org.x + offsetX, 50, width - 50);
            const y = constrain(org.y + offsetY, 50, height - 50);
            
            const offspring = new Organism(x, y, offspringCode, this.nextId++);
            
            // Give offspring explosion velocity
            offspring.vx = cos(angle) * explosionSpeed;
            offspring.vy = sin(angle) * explosionSpeed;
            
            this.organisms.push(offspring);
            actualOffspringCreated++; // Count each successfully created offspring
        }
        
        // Track total offspring created from this splitting
        this.offspringCount += actualOffspringCreated;
    }
    
    fuseOrganisms(org1, org2) {
        // When two most complex organisms touch, fuse and spawn multiple offspring
        // Play fusion sound - modulated blend of both organisms
        playFusionSound(org1, org2);
        
        const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
        
        // Extract all valid instructions from both organisms
        let combinedCode = '';
        for (let c of org1.tape) {
            if (validOps.includes(c)) {
                combinedCode += c;
            }
        }
        for (let c of org2.tape) {
            if (validOps.includes(c)) {
                combinedCode += c;
            }
        }
        
        // Number of offspring based on total instruction count
        // More instructions = more offspring (but cap at reasonable number)
        const totalInstructions = combinedCode.length;
        const numOffspring = constrain(floor(totalInstructions / 8), 3, 12); // 3-12 offspring based on instructions
        
        // Divide code among offspring
        const codePerOffspring = floor(combinedCode.length / numOffspring);
        
        for (let i = 0; i < numOffspring && this.organisms.length < this.maxPopulation - numOffspring; i++) {
            // Extract code segment for this offspring
            const startIdx = i * codePerOffspring;
            const endIdx = (i === numOffspring - 1) ? combinedCode.length : (i + 1) * codePerOffspring;
            let offspringCode = combinedCode.substring(startIdx, endIdx);
            
            // Fill to 64 bytes with random bytes
            while (offspringCode.length < 64) {
                if (random() < 0.15) {
                    // 15% chance to add valid instruction
                    offspringCode += validOps[floor(random(validOps.length))];
                } else {
                    // 85% chance to add random byte
                    offspringCode += String.fromCharCode(Math.floor(Math.random() * 256));
                }
            }
            offspringCode = offspringCode.substring(0, 64); // Ensure exactly 64 bytes
            
            // Create offspring at fusion location with radial velocity
            const angle = (TWO_PI / numOffspring) * i + random(-0.2, 0.2);
            const fusionSpeed = random(4, 8);
            const offsetX = cos(angle) * fusionSpeed * 30;
            const offsetY = sin(angle) * fusionSpeed * 30;
            
            const x = constrain((org1.x + org2.x) / 2 + offsetX, 50, width - 50);
            const y = constrain((org1.y + org2.y) / 2 + offsetY, 50, height - 50);
            
            const offspring = new Organism(x, y, offspringCode, this.nextId++);
            
            // Give offspring fusion velocity
            offspring.vx = cos(angle) * fusionSpeed;
            offspring.vy = sin(angle) * fusionSpeed;
            
            this.organisms.push(offspring);
        }
        
        // Remove fused organisms
        const index1 = this.organisms.indexOf(org1);
        const index2 = this.organisms.indexOf(org2);
        if (index1 > -1) this.organisms.splice(index1, 1);
        if (index2 > -1 && index2 > index1) {
            this.organisms.splice(index2 - 1, 1);
        } else if (index2 > -1) {
            this.organisms.splice(index2, 1);
        }
    }

    update() {
        if (!this.isRunning) return;
        
        // Find two most complex organisms for special interactions
        const { mostComplex, secondMostComplex } = this.getTwoMostComplexOrganisms();
        
        // Mark two most complex organisms and check for explosions
        for (let org of this.organisms) {
            org.isMostComplex = (org === mostComplex);
            org.isSecondMostComplex = (org === secondMostComplex);
            org.clusterDensity = 0; // Reset cluster density
            org.scatterTimer = max(0, org.scatterTimer - 1); // Decrease scatter timer
            if (org.scatterTimer <= 0) {
                org.isScattering = false;
            }
            
            // Check if organism reaches maximum complexity (64 valid instructions) - trigger explosion
            const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
            let validCount = 0;
            for (let c of org.tape) {
                if (validOps.includes(c)) {
                    validCount++;
                }
            }
            
            if (validCount >= 64 && !org.isExploding && this.organisms.length < this.maxPopulation - 3) {
                org.isExploding = true;
                org.explosionTimer = 10; // Explosion animation frames
                this.explosionCount++; // Track explosion
                playSplittingSound(org); // Play sound effect based on organism's code
                this.explodeOrganism(org);
            }
            
            // Update explosion timer
            if (org.isExploding) {
                org.explosionTimer--;
                if (org.explosionTimer <= 0) {
                    // Remove exploded organism
                    const index = this.organisms.indexOf(org);
                    if (index > -1) {
                        this.organisms.splice(index, 1);
                    }
                }
            }
        }
        
        // Calculate cluster density for each organism
        const clusterRadius = 100;
        const densityThreshold = 8; // Number of nearby organisms that triggers scattering
        
        for (let i = 0; i < this.organisms.length; i++) {
            const org = this.organisms[i];
            let nearbyCount = 0;
            
            for (let j = 0; j < this.organisms.length; j++) {
                if (i !== j) {
                    const d = dist(org.x, org.y, this.organisms[j].x, this.organisms[j].y);
                    if (d < clusterRadius) {
                        nearbyCount++;
                    }
                }
            }
            
            org.clusterDensity = nearbyCount;
            
            // Check if threshold is reached - trigger scattering
            if (org.clusterDensity >= densityThreshold && !org.isScattering) {
                org.isScattering = true;
                org.scatterTimer = 60; // Scatter for 60 frames
                
                // Change behavior - increase activity and randomize direction
                org.behaviorState.activityLevel = min(1.0, org.behaviorState.activityLevel * 1.5);
                org.behaviorState.preferredDirection = random(TWO_PI);
                
                // Add strong repulsion velocity
                const scatterStrength = 2.0;
                org.vx += random(-scatterStrength, scatterStrength);
                org.vy += random(-scatterStrength, scatterStrength);
                
                // Small chance to mutate code when scattering
                if (random() < 0.1) {
                    this.mutateCode(org);
                }
            }
        }
        
        // Organic organism-to-organism interactions - more fluid and nuanced
        for (let i = 0; i < this.organisms.length; i++) {
            for (let j = i + 1; j < this.organisms.length; j++) {
                const org1 = this.organisms[i];
                const org2 = this.organisms[j];
                const d = dist(org1.x, org1.y, org2.x, org2.y);
                
                // Build relationship history (organic memory)
                const relationshipKey = `${min(org1.id, org2.id)}-${max(org1.id, org2.id)}`;
                if (!org1.relationshipHistory[org2.id]) {
                    org1.relationshipHistory[org2.id] = { interactions: 0, lastSeen: 0, affinity: random(0.5, 1.5) };
                }
                if (!org2.relationshipHistory[org1.id]) {
                    org2.relationshipHistory[org1.id] = { interactions: 0, lastSeen: 0, affinity: random(0.5, 1.5) };
                }
                
                // Update relationship memory
                if (d < 150) {
                    org1.relationshipHistory[org2.id].lastSeen = frameCount;
                    org2.relationshipHistory[org1.id].lastSeen = frameCount;
                }
                
                // If either organism is scattering, add extra repulsion
                if (org1.isScattering || org2.isScattering) {
                    if (d < 150 && d > 0) {
                        const scatterRepulsion = map(d, 0, 150, 0.8, 0);
                        const angle = atan2(org1.y - org2.y, org1.x - org2.x);
                        org1.vx += cos(angle) * scatterRepulsion;
                        org1.vy += sin(angle) * scatterRepulsion;
                        org2.vx -= cos(angle) * scatterRepulsion;
                        org2.vy -= sin(angle) * scatterRepulsion;
                    }
                    continue; // Skip normal interactions when scattering
                }
                
                // Organic repulsion - varies with relationship and code compatibility
                if (d < 80 && d > 0) {
                    const baseRepulsion = map(d, 0, 80, 0.15, 0);
                    const angle = atan2(org1.y - org2.y, org1.x - org2.x);
                    
                    // Relationship affinity affects repulsion
                    const affinity1 = org1.relationshipHistory[org2.id].affinity;
                    const affinity2 = org2.relationshipHistory[org1.id].affinity;
                    const avgAffinity = (affinity1 + affinity2) / 2;
                    
                    // Code compatibility (similar complexity = less repulsion)
                    const complexityDiff = abs(org1.complexity - org2.complexity);
                    const compatibility = map(complexityDiff, 0, 64, 1, 0.3);
                    
                    // Social tendency
                    const socialFactor = (org1.behaviorState.socialTendency + org2.behaviorState.socialTendency) * 0.5;
                    
                    // Organic repulsion combines all factors
                    const organicRepulsion = baseRepulsion * (1 - avgAffinity * 0.4) * compatibility * (1 - socialFactor * 0.5);
                    
                    org1.vx += cos(angle) * organicRepulsion;
                    org1.vy += sin(angle) * organicRepulsion;
                    org2.vx -= cos(angle) * organicRepulsion;
                    org2.vy -= sin(angle) * organicRepulsion;
                }
                
                // Organic attraction - creates fluid clusters with memory
                if (d > 80 && d < 250) {
                    const baseAttraction = map(d, 80, 250, 0.08, 0);
                    const angle = atan2(org2.y - org1.y, org2.x - org1.x);
                    
                    // Relationship affinity strengthens attraction
                    const affinity1 = org1.relationshipHistory[org2.id].affinity;
                    const affinity2 = org2.relationshipHistory[org1.id].affinity;
                    const avgAffinity = (affinity1 + affinity2) / 2;
                    
                    // Code similarity creates attraction (complementary complexity)
                    const complexityMatch = 1 - abs(org1.complexity - org2.complexity) / 64;
                    
                    // Social tendency
                    const socialFactor = (org1.behaviorState.socialTendency + org2.behaviorState.socialTendency) * 0.5;
                    
                    // Recent interactions strengthen bonds
                    const timeSinceLastSeen1 = frameCount - org1.relationshipHistory[org2.id].lastSeen;
                    const timeSinceLastSeen2 = frameCount - org2.relationshipHistory[org1.id].lastSeen;
                    const recencyBonus = map(min(timeSinceLastSeen1, timeSinceLastSeen2), 0, 300, 1.5, 0.5);
                    
                    // Organic attraction combines all factors
                    const organicAttraction = baseAttraction * avgAffinity * (0.5 + complexityMatch * 0.5) * (0.5 + socialFactor * 0.5) * recencyBonus;
                    
                    org1.vx += cos(angle) * organicAttraction;
                    org1.vy += sin(angle) * organicAttraction;
                    org2.vx -= cos(angle) * organicAttraction;
                    org2.vy -= sin(angle) * organicAttraction;
                    
                    // Update social momentum (creates organic group movement)
                    org1.socialMomentum.x += cos(angle) * organicAttraction * 0.1;
                    org1.socialMomentum.y += sin(angle) * organicAttraction * 0.1;
                    org2.socialMomentum.x -= cos(angle) * organicAttraction * 0.1;
                    org2.socialMomentum.y -= sin(angle) * organicAttraction * 0.1;
                }
            }
            
            // Apply social momentum (creates organic group dynamics)
            const org = this.organisms[i];
            org.vx += org.socialMomentum.x;
            org.vy += org.socialMomentum.y;
            
            // Decay social momentum (organic fading)
            org.socialMomentum.x *= 0.95;
            org.socialMomentum.y *= 0.95;
            
            // Update personal attraction field based on code execution
            const fieldStrength = map(org.lastExecutionResult.operations, 0, 100, 0, 0.5);
            org.attractionField = lerp(org.attractionField, fieldStrength, 0.1);
        }
        
        // Two most complex organisms search for each other
        if (mostComplex && secondMostComplex && mostComplex !== secondMostComplex) {
            const d = dist(mostComplex.x, mostComplex.y, secondMostComplex.x, secondMostComplex.y);
            
            // They attract to each other
            if (d > 20) {
                const attractionStrength = map(d, 20, 500, 0.3, 0.05);
                const angle1 = atan2(secondMostComplex.y - mostComplex.y, secondMostComplex.x - mostComplex.x);
                const angle2 = atan2(mostComplex.y - secondMostComplex.y, mostComplex.x - secondMostComplex.x);
                
                mostComplex.vx += cos(angle1) * attractionStrength;
                mostComplex.vy += sin(angle1) * attractionStrength;
                secondMostComplex.vx += cos(angle2) * attractionStrength;
                secondMostComplex.vy += sin(angle2) * attractionStrength;
            }
            
            // Check if they touch - trigger fusion
            if (d < 30) {
                this.fuseOrganisms(mostComplex, secondMostComplex);
                // After fusion, organisms are removed, so skip to next update cycle
                return;
            }
        }
        
        // Both most complex organisms can hunt and absorb less complex organisms
        const complexOrganisms = [];
        if (mostComplex) complexOrganisms.push(mostComplex);
        if (secondMostComplex && secondMostComplex !== mostComplex) complexOrganisms.push(secondMostComplex);
        
        for (let i = 0; i < this.organisms.length; i++) {
            const org = this.organisms[i];
            
            for (let complexOrg of complexOrganisms) {
                if (org === complexOrg || org.isScattering) continue;
                
                const d = dist(org.x, org.y, complexOrg.x, complexOrg.y);
                const complexityGap = complexOrg.complexity - org.complexity;

                // Complex organism moves toward less complex organisms
                if (complexityGap > 5 && d > 30 && d < 400) {
                    const huntAttraction = map(d, 30, 400, 0.25, 0.05);
                    const angle = atan2(org.y - complexOrg.y, org.x - complexOrg.x);

                    // Stronger attraction for larger complexity gaps
                    const gapFactor = map(constrain(complexityGap, 5, 50), 5, 50, 0.5, 2.0);
                    const adjustedAttraction = huntAttraction * gapFactor;

                    complexOrg.vx += cos(angle) * adjustedAttraction;
                    complexOrg.vy += sin(angle) * adjustedAttraction;
                }
                    
                // Absorption - when complex organism gets close enough to less complex
                if (complexityGap > 3 && d < 30) {
                    // Absorb the less complex organism
                    const absorbedComplexity = org.complexity;
                    const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
                    
                    // Extract valid code from absorbed organism
                    let absorbedCode = '';
                    for (let c of org.tape) {
                        if (validOps.includes(c)) {
                            absorbedCode += c;
                        }
                    }
                    
                    // Integrate absorbed code into complex organism's tape
                    if (absorbedCode.length > 0) {
                        // Strategy: Replace non-functional bytes with absorbed code
                        // Find positions in complex organism's tape that are not valid ops
                        let nonOpPositions = [];
                        for (let i = 0; i < complexOrg.tape.length; i++) {
                            if (!validOps.includes(complexOrg.tape[i])) {
                                nonOpPositions.push(i);
                            }
                        }
                        
                        // Insert absorbed code into non-functional positions
                        let newTape = complexOrg.tape.split('');
                        let absorbedIndex = 0;
                        
                        // First, replace non-functional bytes with absorbed code
                        for (let pos of nonOpPositions) {
                            if (absorbedIndex < absorbedCode.length) {
                                newTape[pos] = absorbedCode[absorbedIndex];
                                absorbedIndex++;
                            }
                        }
                        
                        // If there's remaining absorbed code and tape isn't full, append it
                        if (absorbedIndex < absorbedCode.length && newTape.length < 64) {
                            const remainingCode = absorbedCode.substring(absorbedIndex);
                            const spaceLeft = 64 - newTape.length;
                            const codeToAppend = remainingCode.substring(0, spaceLeft);
                            
                            // Insert at strategic positions (prefer middle sections)
                            const insertPos = floor(newTape.length * 0.3 + random() * newTape.length * 0.4);
                            for (let i = 0; i < codeToAppend.length; i++) {
                                if (insertPos + i < 64) {
                                    newTape.splice(insertPos + i, 0, codeToAppend[i]);
                                }
                            }
                        }
                        
                        // Ensure tape stays at 64 bytes
                        complexOrg.tape = newTape.slice(0, 64).join('');
                        
                        // Also incorporate absorbed organism's execution patterns into behavior
                        // Blend memory patterns
                        for (let i = 0; i < min(complexOrg.lastExecutionResult.memoryPattern.length, org.lastExecutionResult.memoryPattern.length); i++) {
                            const blended = (complexOrg.lastExecutionResult.memoryPattern[i] + org.lastExecutionResult.memoryPattern[i]) / 2;
                            complexOrg.lastExecutionResult.memoryPattern[i] = blended;
                        }
                        
                        // Incorporate absorbed activity level (weighted average)
                        complexOrg.behaviorState.activityLevel = (complexOrg.behaviorState.activityLevel * 0.7) + (org.behaviorState.activityLevel * 0.3);
                        
                        // Blend social tendency
                        complexOrg.behaviorState.socialTendency = (complexOrg.behaviorState.socialTendency * 0.7) + (org.behaviorState.socialTendency * 0.3);
                    }
                    
                    // Update complexity and appearance to reflect absorbed code
                    complexOrg.complexity = complexOrg.calculateComplexity();
                    complexOrg.grayValue = complexOrg.getGrayValue();
                    complexOrg.codeChanged = true;
                    
                    // Re-execute code to update behavior with absorbed patterns
                    complexOrg.executeCode();
                    
                    // Track absorption
                    this.absorptionCount++;
                    
                    // Remove absorbed organism
                    const index = this.organisms.indexOf(org);
                    if (index > -1) {
                        this.organisms.splice(index, 1);
                    }
                }
                
                // Less complex organisms try to flee from most complex
                if (complexityGap > 5 && d < 200) {
                    const fleeStrength = map(d, 0, 200, 0.3, 0.05);
                    const angle = atan2(org.y - mostComplex.y, org.x - mostComplex.x);
                    
                    // Flee away from most complex
                    org.vx += cos(angle) * fleeStrength;
                    org.vy += sin(angle) * fleeStrength;
                }
            }
        }
        
        // Update fitness landscape (slowly evolves over time)
        this.fitnessLandscape.time += 0.001;
        
        // Natural selection - organisms in low fitness areas have higher death rate
        // Also check for lifespan expiration
        for (let i = this.organisms.length - 1; i >= 0; i--) {
            const org = this.organisms[i];
            
            // Check if organism has exceeded its lifespan
            if (org.age >= org.lifespan && this.organisms.length > 50) {
                this.organisms.splice(i, 1);
                this.deadCount++; // Only count lifespan expiration as "dead"
                continue;
            }
            
            const fitness = this.getFitness(org.x, org.y);
            
            // Low fitness = higher chance of death (natural selection, not counted as "dead")
            const deathChance = map(fitness, 0, 2, 0.0005, 0.0001);
            if (random() < deathChance && this.organisms.length > 50) {
                this.organisms.splice(i, 1);
                // Not counted as "dead" - this is natural selection, different from lifespan expiration
            }
        }
        
        // Update all organisms
        for (let org of this.organisms) {
            org.update();
        }
        
        // Check for collisions and interactions
        for (let i = 0; i < this.speed; i++) {
            const idx1 = Math.floor(random(this.organisms.length));
            const idx2 = Math.floor(random(this.organisms.length));
            
            if (idx1 !== idx2) {
                const org1 = this.organisms[idx1];
                const org2 = this.organisms[idx2];
                
                if (org1.checkCollision(org2) || random() < 0.1) {
                    this.interact(org1, org2);
                }
            }
        }
    }

    getMostComplexOrganism() {
        // Ensure all complexities are up-to-date
        for (let org of this.organisms) {
            org.complexity = org.calculateComplexity();
        }
        
        // Find organism with highest complexity
        if (this.organisms.length === 0) return null;
        
        let mostComplex = this.organisms[0];
        let maxComplexity = mostComplex.complexity;
        
        for (let org of this.organisms) {
            const currentComplexity = org.calculateComplexity();
            if (currentComplexity > maxComplexity) {
                maxComplexity = currentComplexity;
                mostComplex = org;
            }
        }
        
        return mostComplex;
    }
    
    getTwoMostComplexOrganisms() {
        // Recalculate complexity for all organisms to ensure accuracy
        for (let org of this.organisms) {
            org.complexity = org.calculateComplexity();
        }
        
        // Find the two most complex organisms
        let mostComplex = null;
        let secondMostComplex = null;
        let maxComplexity = -1;
        let secondMaxComplexity = -1;
        
        for (let org of this.organisms) {
            if (org.complexity > maxComplexity) {
                secondMaxComplexity = maxComplexity;
                secondMostComplex = mostComplex;
                maxComplexity = org.complexity;
                mostComplex = org;
            } else if (org.complexity > secondMaxComplexity && org !== mostComplex) {
                secondMaxComplexity = org.complexity;
                secondMostComplex = org;
            }
        }
        
        return { mostComplex, secondMostComplex };
    }

    draw() {
        // Draw fitness landscape background (subtle visualization)
        this.drawFitnessLandscape();
        
        // Find two most complex organisms first
        const { mostComplex, secondMostComplex } = this.getTwoMostComplexOrganisms();
        
        // Draw special connection between the two most complex organisms
        if (mostComplex && secondMostComplex && mostComplex !== secondMostComplex) {
            const d = dist(mostComplex.x, mostComplex.y, secondMostComplex.x, secondMostComplex.y);
            // Draw a prominent link between them
            push();
            stroke(0); // Dark gray/black for visibility
            strokeWeight(1.25); // Half intensity - thinner line
            // Add pulsing effect based on distance (closer = more visible)
            const alpha = map(d, 0, width, 100, 50); // Half intensity
            stroke(0, alpha);
            // Draw the connection line
            line(mostComplex.x, mostComplex.y, secondMostComplex.x, secondMostComplex.y);
            
            // Add a subtle glow effect (half intensity)
            stroke(0, alpha * 0.15); // Half of the previous glow
            strokeWeight(2.5); // Half intensity
            line(mostComplex.x, mostComplex.y, secondMostComplex.x, secondMostComplex.y);
            pop();
        }
        
        // Draw connections between nearby organisms - more visible
        for (let i = 0; i < this.organisms.length; i++) {
            for (let j = i + 1; j < this.organisms.length; j++) {
                const d = dist(this.organisms[i].x, this.organisms[i].y, 
                              this.organisms[j].x, this.organisms[j].y);
                if (d < 120) { // Increased range from 80 to 120
                    const alpha = map(d, 0, 120, 120, 20); // Increased opacity from 40 to 120
                    stroke(100, alpha); // Darker gray for better visibility
                    strokeWeight(map(d, 0, 120, 2, 0.8)); // Thicker lines, from 2px to 0.8px
                    line(this.organisms[i].x, this.organisms[i].y,
                         this.organisms[j].x, this.organisms[j].y);
                }
            }
        }
        
        // Draw organisms (draw most complex last so they're on top, skip exploding ones)
        for (let org of this.organisms) {
            if (org !== mostComplex && org !== secondMostComplex && !org.isExploding) {
                org.draw();
            }
        }
        
        // Draw two most complex organisms last with special highlighting (if not exploding)
        if (mostComplex && !mostComplex.isExploding) {
            mostComplex.draw(true); // Pass true to indicate it's most complex
        }
        if (secondMostComplex && secondMostComplex !== mostComplex && !secondMostComplex.isExploding) {
            secondMostComplex.draw(true); // Pass true to indicate it's second most complex
        }
        
        // Draw exploding organisms on top for visibility
        for (let org of this.organisms) {
            if (org.isExploding) {
                org.draw(org === mostComplex || org === secondMostComplex);
            }
        }
    }
}

// Global variables
let ecosystem;
let isPaused = false;
let time = 0;
let soundEnabled = false; // Sound toggle state (off by default)
let audioContext; // For sound generation
let statsDisplay = {
    x: 0, // Will be set in setup based on window width
    y: 0, // Will be set in setup based on window height
    w: 280,
    h: 305 // Height calculated: 42 (title/status) + 8*20 (8 stat lines) + 28 (gap) + 30 (graph) + 5 (bottom padding) = 305
};

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvasContainer');
    
    colorMode(RGB, 255, 255, 255);
    ecosystem = new BFFEcosystem(250); // Start with 250 organisms to kickstart evolution
    ecosystem.isRunning = true;
    
    // Position stats at the top
    statsDisplay.x = width - statsDisplay.w - 20;
    statsDisplay.y = 20;
    
    // Initialize audio context for sound effects
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // Reposition stats at the top
    statsDisplay.x = width - statsDisplay.w - 20;
    statsDisplay.y = 20;
}

function draw() {
    time += 0.01;
    
    // Clean white background
    background(255);
    
    // Update ecosystem
    if (!isPaused) {
        ecosystem.update();
    }
    
    // Draw ecosystem
    ecosystem.draw();
    
    // Draw stats overlay
    drawStats();
    
    // Draw most complex code as title
    drawMostComplexCode();
}

function drawMostComplexCode() {
    if (!ecosystem || ecosystem.organisms.length === 0) return;
    
    // Use the ecosystem's method to get the two most complex organisms
    // This ensures complexity is always recalculated and up-to-date
    const { mostComplex, secondMostComplex } = ecosystem.getTwoMostComplexOrganisms();
    
    // Combine code from both most complex organisms
    if (!mostComplex && !secondMostComplex) return;
    
    // Extract valid Brainfuck instructions - combine code from both organisms
    const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
    let codeDisplay = '';
    
    // Add code from most complex organism
    if (mostComplex) {
        for (let c of mostComplex.tape) {
            if (validOps.includes(c)) {
                codeDisplay += c;
            }
        }
    }
    
    // Add code from second most complex organism
    if (secondMostComplex && secondMostComplex !== mostComplex) {
        for (let c of secondMostComplex.tape) {
            if (validOps.includes(c)) {
                codeDisplay += c;
            }
        }
    }
    
    // Display as title - show ALL code with wrapping (but make it invisible)
    if (codeDisplay.length > 0) {
        push();
        fill(30, 0); // Make invisible (alpha = 0)
        const textSizeVal = constrain(windowWidth / 60, 14, 24) * 1.33; // 1/3 larger
        textSize(textSizeVal);
        textAlign(CENTER);
        textStyle(NORMAL);
        textFont('Courier New');
        
        // Wrap text to fit screen width
        const maxWidth = width - 40; // Leave margins
        const lineHeight = textSizeVal * 1.2;
        let words = codeDisplay.split('');
        let currentLine = '';
        let lines = [];
        
        for (let char of words) {
            const testLine = currentLine + char;
            const testWidth = textWidth(testLine);
            
            if (testWidth > maxWidth && currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine.length > 0) {
            lines.push(currentLine);
        }
        
        // Draw wrapped text lines at center bottom
        const startY = height - (lines.length * lineHeight) - 20; // 20px from bottom (lower on y-axis)
        for (let i = 0; i < lines.length; i++) {
            text(lines[i], width / 2, startY + i * lineHeight);
        }
        
        pop();
    }
}

function drawStats() {
    // Minimalist transparent background
    fill(255, 255, 255, 200);
    stroke(200);
    strokeWeight(1);
    rect(statsDisplay.x, statsDisplay.y, statsDisplay.w, statsDisplay.h, 5);
    
    // Stats text - grayscale
    fill(30);
    textSize(13);
    textAlign(LEFT);
    textStyle(BOLD);
    text('BRAINFUCK SWARM', statsDisplay.x + 12, statsDisplay.y + 22);
    
    // Sound indicator
    const soundY = statsDisplay.y + 22;
    const soundX = statsDisplay.x + statsDisplay.w - 25;
    fill(soundEnabled ? 60 : 180); // Darker when on, lighter when off
    noStroke();
    circle(soundX, soundY - 5, 6);
    // Sound waves when on
    if (soundEnabled) {
        stroke(60);
        strokeWeight(1);
        noFill();
        const waveOffset = sin(time * 0.1) * 2;
        arc(soundX + 4, soundY - 5, 8, 8, -PI/4, PI/4);
        arc(soundX + 8, soundY - 5, 12, 12, -PI/3, PI/3);
    }
    textStyle(NORMAL);
    
    textSize(11);
    let yOffset = statsDisplay.y + 42;
    const statusGray = ecosystem.isRunning ? 100 : 150;
    fill(statusGray);
    text(`● ${ecosystem.isRunning ? 'ACTIVE' : 'PAUSED'}`, statsDisplay.x + 12, statsDisplay.y + 42);
    
    fill(60);
    // Consistent 20px spacing between stat lines
    const lineSpacing = 20;
    let currentY = statsDisplay.y + 62; // Start after title and status
    
    text(`Interactions: ${ecosystem.interactionCount.toLocaleString()}`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    text(`Max Operations: ${ecosystem.maxOperations}`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    // Display total current organism count (includes all organisms: initial, offspring from splitting, and offspring from fusion)
    text(`Organisms: ${ecosystem.organisms.length}`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    text(`Speed: ${ecosystem.speed}x`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    text(`Splittings: ${ecosystem.explosionCount}`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    text(`Offspring: ${ecosystem.offspringCount}`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    text(`Absorbed: ${ecosystem.absorptionCount}`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    text(`Dead: ${ecosystem.deadCount}`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing + 28; // Extra spacing before graph (20px + 8px original)
    
    // Operations histogram
    if (ecosystem.operationsHistory.length > 1) {
        const graphX = statsDisplay.x + 12;
        const graphY = currentY; // Use calculated Y position
        const graphW = statsDisplay.w - 24;
        const graphH = 30;
        
        // Graph background
        fill(245);
        noStroke();
        rect(graphX, graphY, graphW, graphH);
        
        // Graph line
        stroke(100);
        strokeWeight(1.5);
        noFill();
        
        beginShape();
        const maxOps = max(ecosystem.maxOperations, 1);
        const startIdx = max(0, ecosystem.operationsHistory.length - 100);
        
        for (let i = startIdx; i < ecosystem.operationsHistory.length; i++) {
            const h = ecosystem.operationsHistory[i];
            const x = graphX + map(i - startIdx, 0, ecosystem.operationsHistory.length - startIdx, 0, graphW);
            const y = graphY + graphH - map(h.operations, 0, maxOps, 0, graphH);
            vertex(x, y);
        }
        endShape();
        
        // Graph label
        fill(80); // Darker for better clarity
        textSize(10); // Larger font (was 8)
        textStyle(NORMAL); // Simple, not bold
        text('Operations over time', graphX, graphY - 5);
    }
}

function keyPressed() {
    if (key === ' ') {
        isPaused = !isPaused;
        ecosystem.isRunning = !isPaused;
    }
    if (key === 's' || key === 'S') {
        soundEnabled = !soundEnabled;
    }
    if (keyCode === UP_ARROW) {
        ecosystem.speed = min(ecosystem.speed * 2, 50);
    }
    if (keyCode === DOWN_ARROW) {
        ecosystem.speed = max(ecosystem.speed / 2, 1);
    }
    if (key === 'r' || key === 'R') {
        ecosystem = new BFFEcosystem(250); // Reset with 250 organisms
        ecosystem.isRunning = true;
        isPaused = false;
    }
}

function mousePressed() {
    if (ecosystem) {
        ecosystem.isRunning = true;
        isPaused = false;
    }
}
