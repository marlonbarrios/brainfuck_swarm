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

class Food {
    constructor(x, y, tape = null) {
        // Use provided coordinates or random position (handle case where width/height might not be defined)
        const w = typeof width !== 'undefined' ? width : 800;
        const h = typeof height !== 'undefined' ? height : 600;
        this.x = x !== undefined ? x : random(50, w - 50);
        this.y = y !== undefined ? y : random(50, h - 50);
        this.size = 12; // Increased from 4 to 12 for visibility
        this.collisionRadius = 8; // Physical collision radius (slightly smaller than visual size)
        this.energy = 1.0;
        this.pulsePhase = random(TWO_PI);
        this.age = 0;
        this.maxAge = 3000; // Food expires after 3000 frames
        
        // FOOD HAS CODE: Food starts with simple code that can evolve
        // Generate simple random code if none provided
        if (tape === null) {
            const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
            tape = '';
            // Start with very simple code (2-5 instructions)
            const codeLength = floor(random(2, 6));
            for (let i = 0; i < codeLength; i++) {
                tape += validOps[floor(random(validOps.length))];
            }
            // Fill rest with random bytes
            while (tape.length < 8) {
                tape += String.fromCharCode(Math.floor(Math.random() * 256));
            }
        }
        this.tape = tape;
        
        // Code execution for food (simpler than organisms)
        this.interpreter = new BrainfuckInterpreter();
        this.executionCounter = 0;
        this.lastExecutionResult = {
            operations: 0,
            memorySum: 0,
            memoryPattern: [0, 0, 0, 0, 0, 0, 0, 0],
            output: []
        };
        
        // Complexity tracking (food evolves into organisms when complexity reaches threshold)
        this.complexity = 0;
        this.complexityThreshold = 10; // When food reaches complexity 10, it becomes an organism
        
        // FREE ENERGY PRINCIPLE FROM THE START: Food uses Free Energy Principle
        this.generativeModel = {
            expectedHunger: 50,
            expectedFoodDistance: 200,
        };
        this.predictionError = {
            hungerError: 0,
            totalError: 0
        };
        this.freeEnergy = 0;
        this.precision = {
            hungerPrecision: 1.0
        };
        this.modelUpdateRate = 0.1;
        
        // Initialize complexity
        this.calculateComplexity();
        this.executeCode();
    }
    
    calculateComplexity() {
        // Calculate complexity from code (same as organisms)
        const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
        let count = 0;
        for (let c of this.tape) {
            if (validOps.includes(c)) count++;
        }
        this.complexity = count;
        return this.complexity;
    }
    
    executeCode() {
        // Execute food's code (simpler execution)
        this.executionCounter++;
        if (this.executionCounter % 10 === 0) { // Less frequent execution for food
            this.interpreter.reset();
            this.interpreter.setCode(this.tape);
            const operations = this.interpreter.run(50); // Fewer steps for food
            
            const memorySum = this.interpreter.memory.reduce((a, b) => a + b, 0);
            const memoryPattern = [...this.interpreter.memory].slice(0, 8);
            
            this.lastExecutionResult = {
                operations: operations,
                memorySum: memorySum,
                memoryPattern: memoryPattern,
                output: [...this.interpreter.output]
            };
        }
    }
    
    updateFreeEnergy() {
        // FREE ENERGY PRINCIPLE: Food uses Free Energy Principle from the start
        // Generate predictions
        this.generativeModel.expectedHunger = lerp(
            this.generativeModel.expectedHunger,
            50, // Food doesn't have hunger, but tracks expected state
            this.modelUpdateRate
        );
        
        // Compute prediction errors (simplified for food)
        this.predictionError.hungerError = 0; // Food doesn't have hunger
        this.predictionError.totalError = this.predictionError.hungerError * this.precision.hungerPrecision;
        
        // Calculate free energy
        this.freeEnergy = this.predictionError.totalError + (this.complexity * 0.1);
    }
    
    update() {
        this.age++;
        this.pulsePhase += 0.15; // Slightly faster pulse
        
        // Execute code
        this.executeCode();
        
        // Update complexity
        this.calculateComplexity();
        
        // Update Free Energy Principle
        this.updateFreeEnergy();
        
        // Self-organize: Food can move slightly based on code execution
        if (this.lastExecutionResult.memoryPattern.length >= 2) {
            const dirX = map(this.lastExecutionResult.memoryPattern[0] % 256, 0, 255, -0.1, 0.1);
            const dirY = map(this.lastExecutionResult.memoryPattern[1] % 256, 0, 255, -0.1, 0.1);
            this.x += dirX;
            this.y += dirY;
            this.x = constrain(this.x, 50, width - 50);
            this.y = constrain(this.y, 50, height - 50);
        }
    }
    
    draw() {
        push();
        
        // Outer glow effect
        const pulse = sin(this.pulsePhase) * 0.4 + 0.6;
        const sizeVariation = this.size * pulse;
        
        // Food uses color from current palette (last color in palette)
        const palette = getCurrentPalette();
        const foodColor = colorPaletteMode === 0 ? [200, 200, 200] : palette[palette.length - 1]; // Last color or gray
        
        // Outer glow ring
        noFill();
        strokeWeight(2);
        stroke(foodColor[0], foodColor[1], foodColor[2], 150 * pulse);
        ellipse(this.x, this.y, sizeVariation * 1.8, sizeVariation * 1.8);
        
        // Middle ring
        stroke(foodColor[0], foodColor[1], foodColor[2], 180 * pulse);
        strokeWeight(1.5);
        ellipse(this.x, this.y, sizeVariation * 1.4, sizeVariation * 1.4);
        
        // Main food body
        noStroke();
        fill(foodColor[0], foodColor[1], foodColor[2], 255 * pulse);
        ellipse(this.x, this.y, sizeVariation, sizeVariation);
        
        // Inner highlight for depth (lighter)
        fill(255, 255, 255, 200 * pulse);
        ellipse(this.x - sizeVariation * 0.2, this.y - sizeVariation * 0.2, sizeVariation * 0.4, sizeVariation * 0.4);
        
        pop();
    }
    
    isExpired() {
        return this.age >= this.maxAge;
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
        
        // Symbiogenesis tracking
        this.symbiontPartner = null; // Reference to symbiont partner organism
        this.symbiosisTimer = 0; // Time spent in proximity for potential symbiosis
        this.symbiosisThreshold = 60; // Frames needed for symbiogenesis (1 second at 60fps) - very easy to trigger
        this.isSymbiont = false; // Whether this organism is in a symbiont relationship
        this.symbiosisStrength = 0; // Strength of symbiont bond (0-1)
        this.membraneTimer = 0; // Timer for elastic membrane animation when symbiont is created
        this.hasMembrane = false; // Whether this symbiont has an active membrane
        
        // Super organism tracking
        this.isInSuperOrganism = false; // Whether this organism is part of a super organism
        this.superOrganismGroup = null; // Reference to super organism group
        this.collectiveMemory = []; // Shared memory pool for super organisms
        
        // Sound generation - continuous sound based on code
        this.soundOscillator = null;
        this.soundGain = null;
        this.soundModulator = null; // LFO for procedural modulation
        this.soundModGain = null; // Gain node for modulation depth control
        this.soundFilter = null; // Low-pass filter for musical warmth
        this.isPlayingSound = false;
        
        // Explosion tracking
        this.explosionTimer = 0;
        this.isExploding = false;
        
        // Phagocytosis tracking - visual engulfment process
        this.isEngulfing = false; // Whether this organism is engulfing another
        this.isBeingEngulfed = false; // Whether this organism is being engulfed
        this.engulfTarget = null; // Reference to organism being engulfed (if isEngulfing)
        this.engulfProgress = 0; // Progress of engulfment (0-100)
        this.engulfTimer = 0; // Timer for engulfment animation
        
        // Most complex tracking (can be one of the two most complex)
        this.isMostComplex = false;
        this.isSecondMostComplex = false;
        
        // Lifespan tracking
        this.age = 0; // Age in frames
        this.lifespan = floor(random(3000, 8000));
        
        // Hunger/starvation tracking
        this.hunger = 100; // Start with full hunger (100 = full, 0 = starved)
        this.lastFoodEaten = 0; // Frames since last food eaten
        this.starvationThreshold = 2000; // Die if no food eaten for 2000 frames (~33 seconds)
        this.foodEatenTotal = 0; // Total food eaten in lifetime
        
        // Phase system - organisms go through developmental phases
        this.phase = 'juvenile'; // Start as juvenile
        this.previousPhase = 'juvenile';
        this.phaseTransitionTimer = 0; // Visual transition effect timer
        
        // Phase thresholds
        this.phaseThresholds = {
            juvenile: { complexity: 0, age: 0, food: 0 },
            adult: { complexity: 15, age: 1000, food: 3 },
            mature: { complexity: 30, age: 3000, food: 10 },
            elder: { complexity: 45, age: 5000, food: 20 }
        };
        
        // Self-replication mechanism - organisms can replicate themselves by reading their own code
        this.selfReplicationTimer = 0; // Timer tracking replication readiness
        this.selfReplicationThreshold = 2000; // Frames needed before self-replication can occur
        this.selfReplicationEnergy = 0; // Energy accumulated for replication (0-100)
        this.hasReplicated = false; // Track if organism has already self-replicated
        this.replicationReadiness = 0; // Readiness score (0-1) based on complexity, age, food
        
        // FREE ENERGY PRINCIPLE & ACTIVE INFERENCE
        // Generative Model: Internal predictions about the environment
        this.generativeModel = {
            // Predicted food locations (beliefs about where food should be)
            predictedFoodLocations: [], // Array of {x, y, confidence}
            // Predicted organism positions (beliefs about where other organisms are)
            predictedOrganismPositions: [], // Array of {x, y, complexity, confidence}
            // Predicted fitness landscape values
            predictedFitness: {}, // Map of {x, y} -> predicted fitness value
            // Expected sensory states
            expectedHunger: 50, // Expected hunger level
            expectedFoodDistance: 200, // Expected distance to nearest food
            expectedOrganismDensity: 0.1, // Expected local organism density
            // Expected sound states (FREE ENERGY PRINCIPLE FOR SOUND)
            expectedFrequency: 261.63, // Expected frequency (Hz)
            expectedVolume: 0.003, // Expected volume (gain)
            expectedModulationRate: 1.0, // Expected modulation rate (Hz)
            expectedModulationDepth: 5.0, // Expected modulation depth
            expectedFilterCutoff: 3000, // Expected filter cutoff (Hz)
        };
        
        // Prediction Error: Difference between predicted and actual states
        this.predictionError = {
            foodLocationError: 0, // Error in food location predictions
            organismPositionError: 0, // Error in organism position predictions
            hungerError: 0, // Error in hunger prediction
            fitnessError: 0, // Error in fitness predictions
            // Sound prediction errors (FREE ENERGY PRINCIPLE FOR SOUND)
            frequencyError: 0, // Error in frequency prediction
            volumeError: 0, // Error in volume prediction
            modulationError: 0, // Error in modulation prediction
            totalError: 0 // Total prediction error
        };
        
        // Free Energy: Measure of prediction error (to be minimized)
        this.freeEnergy = 0;
        this.freeEnergyHistory = []; // Track free energy over time
        
        // Precision Weighting: How much to weight different predictions
        this.precision = {
            foodPrecision: 1.0, // Precision of food predictions
            organismPrecision: 0.8, // Precision of organism predictions
            hungerPrecision: 1.2, // Precision of hunger predictions (high priority)
            fitnessPrecision: 0.6, // Precision of fitness predictions
            // Sound precision (FREE ENERGY PRINCIPLE FOR SOUND)
            soundPrecision: 0.7 // Precision of sound predictions
        };
        
        // Active Inference: Actions that minimize free energy
        this.activeInference = {
            actionPlan: { vx: 0, vy: 0 }, // Planned action to minimize free energy
            explorationBonus: 0.1, // Bonus for exploring uncertain areas
            exploitationStrength: 0.8 // Strength of exploiting known good locations
        };
        
        // Model update rate (how quickly beliefs change)
        this.modelUpdateRate = 0.1; // Learning rate for updating generative model
        
        // Phenotype multipliers based on phase
        this.phasePhenotype = {
            juvenile: { sizeMultiplier: 0.7, colorBrightness: 1.2, shapeComplexity: 0.8 },
            adult: { sizeMultiplier: 1.0, colorBrightness: 1.0, shapeComplexity: 1.0 },
            mature: { sizeMultiplier: 1.3, colorBrightness: 0.8, shapeComplexity: 1.2 },
            elder: { sizeMultiplier: 1.5, colorBrightness: 0.6, shapeComplexity: 1.5 }
        };
        
        // Execute code once to initialize execution results
        this.executeCode();
        
        // Now calculate complexity
        this.complexity = this.calculateComplexity();
        
        // GENOTYPE AND PHENOTYPE: Only assigned when organism is created (not for food)
        // Food evolves into organisms, and only then get genotype/phenotype
        this.genotype = null; // Will be set when organism is created
        this.grayValue = 150; // Default gray value
        
        // Execute code once more to initialize execution results
        this.executeCode();
    }
    
    initializeAsOrganism() {
        // Called when food evolves into organism or when organism is created directly
        // This is when genotype and phenotype are assigned
        this.genotype = this.analyzeGenotype();
        this.grayValue = this.getGrayValue();
        this.executeCode(); // Re-execute to update behavior with genotype
    }
    
    checkPhaseTransition() {
        // Determine current phase based on complexity, age, and food eaten
        let newPhase = 'juvenile';
        
        // Check phase progression: juvenile -> adult -> mature -> elder
        if (this.complexity >= this.phaseThresholds.elder.complexity && 
            this.age >= this.phaseThresholds.elder.age && 
            this.foodEatenTotal >= this.phaseThresholds.elder.food) {
            newPhase = 'elder';
        } else if (this.complexity >= this.phaseThresholds.mature.complexity && 
                   this.age >= this.phaseThresholds.mature.age && 
                   this.foodEatenTotal >= this.phaseThresholds.mature.food) {
            newPhase = 'mature';
        } else if (this.complexity >= this.phaseThresholds.adult.complexity && 
                   this.age >= this.phaseThresholds.adult.age && 
                   this.foodEatenTotal >= this.phaseThresholds.adult.food) {
            newPhase = 'adult';
        }
        
        // Phase transition detected
        if (newPhase !== this.phase) {
            this.previousPhase = this.phase;
            this.phase = newPhase;
            this.phaseTransitionTimer = 30; // Visual transition effect (30 frames)
            
            // Phenotype changes on phase transition
            this.updatePhenotypeForPhase();
        }
        
        // Update membrane timer for symbiont visual effect
        // -1 means persistent membrane (doesn't expire)
        if (this.membraneTimer > 0) {
            this.membraneTimer--;
            if (this.membraneTimer <= 0) {
                this.hasMembrane = false;
            }
        }
        // If membraneTimer is -1, keep membrane active (persistent symbiont membrane)
        if (this.membraneTimer === -1 && !this.isSymbiont) {
            // If symbiont relationship ends, remove membrane
            this.hasMembrane = false;
            this.membraneTimer = 0;
        }
    }
    
    updatePhenotypeForPhase() {
        // Phenotype changes are applied during drawing, but we can trigger visual updates here
        // The actual phenotype multipliers are used in the draw() method
    }

    calculateComplexity() {
        const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
        let count = 0;
        for (let c of this.tape) {
            if (validOps.includes(c)) count++;
        }
        return count;
    }
    
    analyzeGenotype() {
        // Comprehensive genotype analysis - maps code patterns to phenotype characteristics
        const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
        
        // Extract valid code
        let code = '';
        for (let c of this.tape) {
            if (validOps.includes(c)) code += c;
        }
        
        if (code.length === 0) {
            return {
                movementPattern: 0.5,
                operationPattern: 0.5,
                loopPattern: 0,
                ioPattern: 0,
                structurePattern: 0.5,
                rhythmPattern: 0.5,
                complexityPattern: 0,
                signature: 0
            };
        }
        
        // Count instruction types
        const counts = {
            '>': (code.match(/>/g) || []).length,
            '<': (code.match(/</g) || []).length,
            '+': (code.match(/\+/g) || []).length,
            '-': (code.match(/-/g) || []).length,
            '.': (code.match(/\./g) || []).length,
            ',': (code.match(/,/g) || []).length,
            '[': (code.match(/\[/g) || []).length,
            ']': (code.match(/\]/g) || []).length
        };
        
        const total = code.length;
        
        // Genotype patterns (0-1 scale)
        const genotype = {
            // Movement pattern: preference for > vs <
            movementPattern: total > 0 ? map(counts['>'] - counts['<'], -total, total, 0, 1) : 0.5,
            
            // Operation pattern: preference for + vs -
            operationPattern: total > 0 ? map(counts['+'] - counts['-'], -total, total, 0, 1) : 0.5,
            
            // Loop pattern: density of loops
            loopPattern: total > 0 ? map(counts['['] + counts[']'], 0, total, 0, 1) : 0,
            
            // I/O pattern: preference for output vs input
            ioPattern: (counts['.'] + counts[',']) > 0 
                ? map(counts['.'] - counts[','], -(counts['.'] + counts[',']), counts['.'] + counts[','], 0, 1)
                : 0.5,
            
            // Structure pattern: how organized/chaotic the code is
            structurePattern: this.calculateStructurePattern(code),
            
            // Rhythm pattern: repetition patterns
            rhythmPattern: this.calculateRhythmPattern(code),
            
            // Complexity pattern: normalized complexity
            complexityPattern: map(this.complexity, 0, 100, 0, 1),
            
            // Unique signature: hash-like value from code
            signature: this.calculateCodeSignature(code)
        };
        
        return genotype;
    }
    
    calculateStructurePattern(code) {
        // Analyze how structured/organized the code is
        let structureScore = 0;
        
        // Balanced brackets indicate structure
        const openBrackets = (code.match(/\[/g) || []).length;
        const closeBrackets = (code.match(/\]/g) || []).length;
        if (openBrackets > 0 && openBrackets === closeBrackets) {
            structureScore += 0.3;
        }
        
        // Repeated patterns indicate structure
        let patternCount = 0;
        for (let i = 0; i < code.length - 2; i++) {
            const pattern = code.substring(i, i + 3);
            if (code.indexOf(pattern, i + 1) !== -1) {
                patternCount++;
            }
        }
        structureScore += min(patternCount / code.length, 0.7);
        
        return constrain(structureScore, 0, 1);
    }
    
    calculateRhythmPattern(code) {
        // Analyze repetition and rhythm in code
        if (code.length < 3) return 0.5;
        
        let rhythmScore = 0;
        const patterns = {};
        
        // Find repeated 2-3 character patterns
        for (let len = 2; len <= 3; len++) {
            for (let i = 0; i <= code.length - len; i++) {
                const pattern = code.substring(i, i + len);
                patterns[pattern] = (patterns[pattern] || 0) + 1;
            }
        }
        
        // Count how many patterns repeat
        let repeatCount = 0;
        for (let pattern in patterns) {
            if (patterns[pattern] > 1) {
                repeatCount += patterns[pattern];
            }
        }
        
        rhythmScore = map(repeatCount, 0, code.length, 0, 1);
        return constrain(rhythmScore, 0, 1);
    }
    
    calculateCodeSignature(code) {
        // Create a unique signature from code (0-1)
        let hash = 0;
        for (let i = 0; i < code.length; i++) {
            hash = ((hash << 5) - hash) + code.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
        }
        return map(abs(hash) % 10000, 0, 10000, 0, 1);
    }
    
    getGenotypeCompatibility(otherOrg) {
        // Calculate compatibility between two genotypes (0-1)
        // If genotypes don't exist, return default compatibility
        if (!this.genotype || !otherOrg.genotype) {
            return 0.5; // Default compatibility if genotypes don't exist
        }
        
        const gen1 = this.genotype;
        const gen2 = otherOrg.genotype;
        
        // Complementary patterns increase compatibility
        let compatibility = 0;
        
        // Movement complementarity (opposite preferences)
        const movementDiff = abs(gen1.movementPattern - gen2.movementPattern);
        compatibility += movementDiff * 0.2; // More different = more compatible
        
        // Operation complementarity
        const operationDiff = abs(gen1.operationPattern - gen2.operationPattern);
        compatibility += operationDiff * 0.2;
        
        // Similar structure patterns (both organized or both chaotic)
        const structureSimilarity = 1 - abs(gen1.structurePattern - gen2.structurePattern);
        compatibility += structureSimilarity * 0.2;
        
        // Similar rhythm patterns
        const rhythmSimilarity = 1 - abs(gen1.rhythmPattern - gen2.rhythmPattern);
        compatibility += rhythmSimilarity * 0.15;
        
        // Similar complexity (not too different)
        const complexitySimilarity = 1 - abs(gen1.complexityPattern - gen2.complexityPattern);
        compatibility += complexitySimilarity * 0.15;
        
        // Signature similarity (very similar codes)
        if (gen1.signature !== undefined && gen2.signature !== undefined) {
            const signatureSimilarity = 1 - abs(gen1.signature - gen2.signature);
            compatibility += signatureSimilarity * 0.1;
        }
        
        return constrain(compatibility, 0, 1);
    }

    // Color palette system: grayscale, original palette, or new palette
    getColorFromPalette() {
        // If grayscale mode, convert to grayscale
        if (colorPaletteMode === 0) {
            // Map complexity to grayscale (0-255)
            const grayValue = map(this.complexity || 0, 0, 64, 50, 255);
            let finalGray = grayValue;
            
            // Add genotype variation
            if (this.genotype) {
                const genotypeVariation = map(this.genotype.signature, 0, 1, -30, 30);
                finalGray += genotypeVariation;
            }
            
            // Add memory variation
            if (this.lastExecutionResult.memorySum > 0) {
                const memoryVariation = map(this.lastExecutionResult.memorySum % 256, 0, 255, -20, 20);
                finalGray += memoryVariation;
            }
            
            finalGray = constrain(finalGray, 0, 255);
            return [finalGray, finalGray, finalGray];
        }
        
        // Get current palette based on global selection
        const palette = getCurrentPalette();
        
        // Map complexity to palette index (0-4)
        let paletteIndex = floor(map(this.complexity, 0, 64, 0, palette.length));
        paletteIndex = constrain(paletteIndex, 0, palette.length - 1);
        
        // Modify palette selection based on genotype patterns
        if (this.genotype) {
            // Movement pattern shifts palette selection
            const movementShift = floor(map(this.genotype.movementPattern, 0, 1, -1, 1));
            paletteIndex += movementShift;
            
            // Structure pattern affects which end of palette (organized = cooler colors)
            const structureShift = floor(map(this.genotype.structurePattern, 0, 1, -1, 1));
            paletteIndex += structureShift;
            
            paletteIndex = constrain(paletteIndex, 0, palette.length - 1);
        }
        
        // Memory patterns add variation to color
        let colorVariation = 0;
        if (this.lastExecutionResult.memorySum > 0) {
            colorVariation = map(this.lastExecutionResult.memorySum % 256, 0, 255, -20, 20);
        }
        
        // Get base color from palette
        const baseColor = palette[paletteIndex];
        
        // Apply variation (brightness adjustment)
        return [
            constrain(baseColor[0] + colorVariation, 0, 255),
            constrain(baseColor[1] + colorVariation, 0, 255),
            constrain(baseColor[2] + colorVariation, 0, 255)
        ];
    }
    
    // Keep getGrayValue for backward compatibility, but map to palette
    getGrayValue() {
        const color = this.getColorFromPalette();
        // Convert RGB to grayscale for any remaining grayscale uses
        return (color[0] + color[1] + color[2]) / 3;
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
    
    updateSelfReplication() {
        // SELF-REPLICATION MECHANISM: Organisms replicate themselves by reading their own code
        // Increment replication timer
        this.selfReplicationTimer++;
        
        // Calculate replication readiness based on:
        // 1. Age (older = more ready)
        // 2. Complexity (more complex = more ready)
        // 3. Food eaten (well-fed = more ready)
        // 4. Hunger level (not starving = more ready)
        const ageReadiness = map(this.age, 0, this.selfReplicationThreshold, 0, 0.3);
        const complexityReadiness = map(this.complexity, 0, 64, 0, 0.3);
        const foodReadiness = map(this.foodEatenTotal, 0, 20, 0, 0.2);
        const hungerReadiness = map(this.hunger, 0, 100, 0, 0.2);
        
        this.replicationReadiness = ageReadiness + complexityReadiness + foodReadiness + hungerReadiness;
        this.replicationReadiness = constrain(this.replicationReadiness, 0, 1);
        
        // Accumulate energy for replication (increases with readiness)
        if (this.replicationReadiness > 0.5 && !this.hasReplicated) {
            this.selfReplicationEnergy += this.replicationReadiness * 0.5;
            this.selfReplicationEnergy = constrain(this.selfReplicationEnergy, 0, 100);
        }
        
        // Attempt self-replication if conditions are met
        if (this.selfReplicationTimer >= this.selfReplicationThreshold &&
            this.replicationReadiness >= 0.6 &&
            this.selfReplicationEnergy >= 80 &&
            !this.hasReplicated &&
            this.ecosystem &&
            this.ecosystem.organisms.length < this.ecosystem.maxPopulation) {
            
            this.attemptSelfReplication();
        }
    }
    
    attemptSelfReplication() {
        // SELF-REPLICATION: Read own code and create a copy
        // This is the core mechanism - the organism reads its own tape/code
        // and creates a new organism with a copy of that code
        
        if (!this.ecosystem) return;
        
        // Read own code (the tape is the organism's genetic code)
        const selfCode = this.tape;
        
        // Create a replication entity that processes the code
        // This entity "reads" through the code and replicates it
        const replicatedCode = this.readAndReplicateCode(selfCode);
        
        // Create new organism at nearby location (offspring spawns near parent)
        const spawnDistance = 30 + random(20);
        const spawnAngle = random(TWO_PI);
        const x = constrain(this.x + cos(spawnAngle) * spawnDistance, 50, width - 50);
        const y = constrain(this.y + sin(spawnAngle) * spawnDistance, 50, height - 50);
        
        // Create offspring with replicated code
        const offspring = new Organism(x, y, replicatedCode, this.ecosystem.nextId++);
        offspring.ecosystem = this.ecosystem;
        
        // Offspring inherits some traits from parent
        offspring.vx = this.vx * 0.8 + random(-0.5, 0.5);
        offspring.vy = this.vy * 0.8 + random(-0.5, 0.5);
        offspring.hunger = this.hunger * 0.7; // Offspring starts with less hunger
        
        // Small mutation chance during replication (evolution)
        if (random() < 0.1) {
            this.ecosystem.mutateCode(offspring);
        }
        
        // Initialize as organism (gets genotype and phenotype)
        offspring.initializeAsOrganism();
        
        this.ecosystem.organisms.push(offspring);
        this.ecosystem.offspringCount++;
        this.ecosystem.selfReplicationCount++;
        
        // Mark as having replicated (can only replicate once)
        this.hasReplicated = true;
        this.selfReplicationEnergy = 0; // Reset energy
        
        // Visual feedback: pulse effect
        this.pulsePhase += PI; // Visual pulse on replication
    }
    
    readAndReplicateCode(code) {
        // REPLICATION ENTITY: Goes through code and replicates it
        // This simulates a replication mechanism that reads genetic code
        
        let replicatedCode = '';
        const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
        
        // Read through the code character by character
        // The replication entity processes each character
        for (let i = 0; i < code.length; i++) {
            const char = code[i];
            
            // Replication entity recognizes valid instructions
            if (validOps.includes(char)) {
                // Copy valid instruction
                replicatedCode += char;
            } else {
                // For non-instruction bytes, preserve structure but allow small variation
                const charCode = code.charCodeAt(i);
                // 95% chance to copy exactly, 5% chance for small mutation
                if (random() < 0.95) {
                    replicatedCode += char;
                } else {
                    // Small mutation during replication
                    const mutatedCode = (charCode + floor(random(-2, 3)) + 256) % 256;
                    replicatedCode += String.fromCharCode(mutatedCode);
                }
            }
        }
        
        // Ensure minimum length (replication entity ensures viability)
        while (replicatedCode.length < 8) {
            // Add random valid instruction if code is too short
            replicatedCode += validOps[floor(random(validOps.length))];
        }
        
        // Trim to maximum length if needed
        if (replicatedCode.length > 64) {
            replicatedCode = replicatedCode.substring(0, 64);
        }
        
        return replicatedCode;
    }
    
    // FREE ENERGY PRINCIPLE & ACTIVE INFERENCE METHODS
    
    generatePredictions() {
        // GENERATIVE MODEL: Generate predictions about the environment
        // Predictions are based on past observations and internal model
        
        const ecosystem = this.ecosystem || (typeof window !== 'undefined' && window.ecosystem);
        if (!ecosystem) return;
        
        // Predict food locations based on past observations and patterns
        // Use memory pattern from code execution to influence predictions
        const memPattern = this.lastExecutionResult.memoryPattern || [0, 0, 0, 0, 0, 0, 0, 0];
        
        // Predict food locations (extrapolate from known food positions)
        this.generativeModel.predictedFoodLocations = [];
        for (let food of ecosystem.food) {
            // Predict future position based on current position and organism's movement
            const predictedX = food.x + (this.vx * 10); // Predict 10 frames ahead
            const predictedY = food.y + (this.vy * 10);
            const confidence = map(dist(this.x, this.y, food.x, food.y), 0, 500, 1.0, 0.3);
            this.generativeModel.predictedFoodLocations.push({
                x: predictedX,
                y: predictedY,
                confidence: constrain(confidence, 0, 1)
            });
        }
        
        // Predict organism positions (extrapolate from known positions)
        this.generativeModel.predictedOrganismPositions = [];
        for (let org of ecosystem.organisms) {
            if (org.id === this.id) continue; // Don't predict self
            
            const d = dist(this.x, this.y, org.x, org.y);
            if (d < 300) { // Only predict nearby organisms
                const predictedX = org.x + (org.vx * 5); // Predict 5 frames ahead
                const predictedY = org.y + (org.vy * 5);
                const confidence = map(d, 0, 300, 0.9, 0.2);
                this.generativeModel.predictedOrganismPositions.push({
                    x: predictedX,
                    y: predictedY,
                    complexity: org.complexity,
                    confidence: constrain(confidence, 0, 1)
                });
            }
        }
        
        // Predict expected hunger (based on current hunger and food availability)
        const nearestFoodDist = this.findNearestFoodDistance();
        const foodAvailability = map(nearestFoodDist, 0, 500, 1.0, 0.0);
        this.generativeModel.expectedHunger = lerp(
            this.generativeModel.expectedHunger,
            this.hunger + (foodAvailability * 10 - 5), // Predict hunger change
            this.modelUpdateRate
        );
        
        // Predict expected food distance
        this.generativeModel.expectedFoodDistance = lerp(
            this.generativeModel.expectedFoodDistance,
            nearestFoodDist,
            this.modelUpdateRate * 2 // Update faster for food distance
        );
        
        // Predict fitness landscape values (cache predictions)
        const gridSize = 50;
        for (let x = this.x - 200; x <= this.x + 200; x += gridSize) {
            for (let y = this.y - 200; y <= this.y + 200; y += gridSize) {
                const key = `${floor(x/gridSize)},${floor(y/gridSize)}`;
                if (!this.generativeModel.predictedFitness[key] && ecosystem.getFitness) {
                    this.generativeModel.predictedFitness[key] = ecosystem.getFitness(x, y);
                }
            }
        }
    }
    
    computePredictionErrors() {
        // PREDICTION ERROR: Compare predictions to actual observations
        
        const ecosystem = this.ecosystem || (typeof window !== 'undefined' && window.ecosystem);
        if (!ecosystem) return;
        
        // Food location prediction error
        let foodErrorSum = 0;
        let foodErrorCount = 0;
        for (let pred of this.generativeModel.predictedFoodLocations) {
            // Find actual food closest to prediction
            let minActualDist = Infinity;
            for (let food of ecosystem.food) {
                const actualDist = dist(pred.x, pred.y, food.x, food.y);
                minActualDist = min(minActualDist, actualDist);
            }
            // Error weighted by confidence
            foodErrorSum += minActualDist * pred.confidence;
            foodErrorCount++;
        }
        this.predictionError.foodLocationError = foodErrorCount > 0 ? foodErrorSum / foodErrorCount : 0;
        
        // Organism position prediction error
        let orgErrorSum = 0;
        let orgErrorCount = 0;
        for (let pred of this.generativeModel.predictedOrganismPositions) {
            let minActualDist = Infinity;
            for (let org of ecosystem.organisms) {
                if (org.id === this.id) continue;
                const actualDist = dist(pred.x, pred.y, org.x, org.y);
                minActualDist = min(minActualDist, actualDist);
            }
            orgErrorSum += minActualDist * pred.confidence;
            orgErrorCount++;
        }
        this.predictionError.organismPositionError = orgErrorCount > 0 ? orgErrorSum / orgErrorCount : 0;
        
        // Hunger prediction error
        const actualHunger = this.hunger;
        this.predictionError.hungerError = abs(actualHunger - this.generativeModel.expectedHunger);
        
        // Fitness prediction error (sample nearby locations)
        let fitnessErrorSum = 0;
        let fitnessErrorCount = 0;
        const samplePoints = 5;
        for (let i = 0; i < samplePoints; i++) {
            const sampleX = this.x + random(-100, 100);
            const sampleY = this.y + random(-100, 100);
            const key = `${floor(sampleX/50)},${floor(sampleY/50)}`;
            if (this.generativeModel.predictedFitness[key] !== undefined && ecosystem.getFitness) {
                const predictedFitness = this.generativeModel.predictedFitness[key];
                const actualFitness = ecosystem.getFitness(sampleX, sampleY);
                fitnessErrorSum += abs(predictedFitness - actualFitness);
                fitnessErrorCount++;
            }
        }
        this.predictionError.fitnessError = fitnessErrorCount > 0 ? fitnessErrorSum / fitnessErrorCount : 0;
        
        // Sound prediction errors (FREE ENERGY PRINCIPLE FOR SOUND)
        if (this.soundOscillator && this.soundGain) {
            // Frequency prediction error
            const actualFreq = this.soundOscillator.frequency.value || this.generativeModel.expectedFrequency;
            this.predictionError.frequencyError = abs(actualFreq - this.generativeModel.expectedFrequency) / max(1, this.generativeModel.expectedFrequency);
            
            // Volume prediction error
            const actualVolume = this.soundGain.gain.value || this.generativeModel.expectedVolume;
            this.predictionError.volumeError = abs(actualVolume - this.generativeModel.expectedVolume) / max(0.001, this.generativeModel.expectedVolume);
            
            // Modulation prediction error (combined rate and depth)
            const actualModRate = this.soundModulator ? (this.soundModulator.frequency.value || this.generativeModel.expectedModulationRate) : this.generativeModel.expectedModulationRate;
            const modRateError = abs(actualModRate - this.generativeModel.expectedModulationRate) / max(0.1, this.generativeModel.expectedModulationRate);
            this.predictionError.modulationError = modRateError;
        } else {
            // If not playing sound, prediction errors are based on expected states
            this.predictionError.frequencyError = 0.1; // Small error if not playing
            this.predictionError.volumeError = 0.1;
            this.predictionError.modulationError = 0.1;
        }
        
        // Total prediction error (weighted sum) - includes sound errors
        this.predictionError.totalError = 
            this.predictionError.foodLocationError * this.precision.foodPrecision +
            this.predictionError.organismPositionError * this.precision.organismPrecision +
            this.predictionError.hungerError * this.precision.hungerPrecision +
            this.predictionError.fitnessError * this.precision.fitnessPrecision +
            (this.predictionError.frequencyError * 50 + // Scale sound errors (they're normalized)
             this.predictionError.volumeError * 30 +
             this.predictionError.modulationError * 20) * this.precision.soundPrecision;
    }
    
    calculateFreeEnergy() {
        // FREE ENERGY: Measure of prediction error (to be minimized)
        // Free Energy = Prediction Error + Complexity Penalty
        
        // Base free energy from prediction errors
        const predictionErrorComponent = this.predictionError.totalError;
        
        // Complexity penalty: More complex models have higher free energy
        // (simpler models are preferred - Occam's razor)
        const complexityPenalty = this.complexity * 0.1;
        
        // Surprise component: Unexpected states increase free energy
        const surpriseComponent = map(this.hunger, 0, 100, 0, 20); // Low hunger = high surprise
        
        // Calculate free energy
        this.freeEnergy = predictionErrorComponent + complexityPenalty + surpriseComponent;
        
        // Track free energy history (keep last 100 values)
        this.freeEnergyHistory.push(this.freeEnergy);
        if (this.freeEnergyHistory.length > 100) {
            this.freeEnergyHistory.shift();
        }
    }
    
    updateGenerativeModel() {
        // PERCEPTION: Update generative model based on observations
        // This is the "perception" part of active inference
        
        // Update expected hunger based on actual hunger
        this.generativeModel.expectedHunger = lerp(
            this.generativeModel.expectedHunger,
            this.hunger,
            this.modelUpdateRate * 2 // Update hunger predictions faster
        );
        
        // Update expected food distance
        const actualFoodDist = this.findNearestFoodDistance();
        this.generativeModel.expectedFoodDistance = lerp(
            this.generativeModel.expectedFoodDistance,
            actualFoodDist,
            this.modelUpdateRate * 3 // Update food distance very quickly
        );
        
        // Update fitness predictions based on observations
        const ecosystem = this.ecosystem || (typeof window !== 'undefined' && window.ecosystem);
        if (ecosystem && ecosystem.getFitness) {
            const gridSize = 50;
            const currentKey = `${floor(this.x/gridSize)},${floor(this.y/gridSize)}`;
            const actualFitness = ecosystem.getFitness(this.x, this.y);
            if (this.generativeModel.predictedFitness[currentKey] !== undefined) {
                // Update prediction based on observation
                this.generativeModel.predictedFitness[currentKey] = lerp(
                    this.generativeModel.predictedFitness[currentKey],
                    actualFitness,
                    this.modelUpdateRate
                );
            }
        }
        
        // Adjust precision based on prediction errors (adaptive precision)
        // If errors are high, reduce precision (less confident)
        // If errors are low, increase precision (more confident)
        const errorRatio = this.predictionError.totalError / max(1, this.freeEnergy);
        this.precision.foodPrecision = lerp(this.precision.foodPrecision, 1.0 / max(0.1, errorRatio), 0.05);
        this.precision.organismPrecision = lerp(this.precision.organismPrecision, 0.8 / max(0.1, errorRatio), 0.05);
    }
    
    planActionsToMinimizeFreeEnergy() {
        // ACTIVE INFERENCE: Plan actions to minimize free energy
        // This is the "action" part of active inference
        
        const ecosystem = this.ecosystem || (typeof window !== 'undefined' && window.ecosystem);
        if (!ecosystem) return;
        
        // Initialize action plan
        let actionVx = 0;
        let actionVy = 0;
        
        // 1. EXPLOITATION: Move toward predicted food locations (reduce hunger error)
        if (this.generativeModel.predictedFoodLocations.length > 0) {
            // Find best predicted food location (highest confidence, closest)
            let bestFood = null;
            let bestScore = -Infinity;
            for (let pred of this.generativeModel.predictedFoodLocations) {
                const distToPred = dist(this.x, this.y, pred.x, pred.y);
                const score = pred.confidence / max(1, distToPred);
                if (score > bestScore) {
                    bestScore = score;
                    bestFood = pred;
                }
            }
            
            if (bestFood) {
                const dx = bestFood.x - this.x;
                const dy = bestFood.y - this.y;
                const distToFood = sqrt(dx * dx + dy * dy);
                if (distToFood > 0) {
                    const strength = this.activeInference.exploitationStrength * 
                                    map(this.hunger, 0, 100, 0.5, 1.5); // Stronger when hungry
                    actionVx += (dx / distToFood) * strength;
                    actionVy += (dy / distToFood) * strength;
                }
            }
        }
        
        // 2. EXPLORATION: Move toward areas with high prediction uncertainty
        // (explore to reduce prediction errors)
        const explorationStrength = this.activeInference.explorationBonus * 
                                   map(this.freeEnergy, 0, 100, 0.1, 0.5); // More exploration when free energy is high
        
        // Sample nearby locations and find most uncertain
        let mostUncertainX = this.x;
        let mostUncertainY = this.y;
        let maxUncertainty = 0;
        
        for (let i = 0; i < 8; i++) {
            const angle = (TWO_PI / 8) * i;
            const sampleX = this.x + cos(angle) * 100;
            const sampleY = this.y + sin(angle) * 100;
            
            // Calculate uncertainty (inverse of confidence in predictions)
            const key = `${floor(sampleX/50)},${floor(sampleY/50)}`;
            const hasPrediction = this.generativeModel.predictedFitness[key] !== undefined;
            const uncertainty = hasPrediction ? 0.3 : 1.0; // High uncertainty if no prediction
            
            if (uncertainty > maxUncertainty) {
                maxUncertainty = uncertainty;
                mostUncertainX = sampleX;
                mostUncertainY = sampleY;
            }
        }
        
        if (maxUncertainty > 0.5) {
            const dx = mostUncertainX - this.x;
            const dy = mostUncertainY - this.y;
            const distToUncertain = sqrt(dx * dx + dy * dy);
            if (distToUncertain > 0) {
                actionVx += (dx / distToUncertain) * explorationStrength;
                actionVy += (dy / distToUncertain) * explorationStrength;
            }
        }
        
        // 3. AVOIDANCE: Move away from predicted organism positions if they're threats
        // (reduce organism position error by avoiding collisions)
        for (let pred of this.generativeModel.predictedOrganismPositions) {
            const d = dist(this.x, this.y, pred.x, pred.y);
            if (d < 50 && pred.complexity > this.complexity + 5) {
                // Avoid more complex organisms (potential predators)
                const dx = this.x - pred.x;
                const dy = this.y - pred.y;
                const distToOrg = sqrt(dx * dx + dy * dy);
                if (distToOrg > 0) {
                    const avoidanceStrength = map(d, 0, 50, 0.5, 0.1);
                    actionVx += (dx / distToOrg) * avoidanceStrength;
                    actionVy += (dy / distToOrg) * avoidanceStrength;
                }
            }
        }
        
        // Normalize action plan
        const actionMagnitude = sqrt(actionVx * actionVx + actionVy * actionVy);
        if (actionMagnitude > 0) {
            this.activeInference.actionPlan.vx = (actionVx / actionMagnitude) * 0.3; // Limit action strength
            this.activeInference.actionPlan.vy = (actionVy / actionMagnitude) * 0.3;
        } else {
            this.activeInference.actionPlan.vx = 0;
            this.activeInference.actionPlan.vy = 0;
        }
    }
    
    findNearestFoodDistance() {
        // Helper: Find distance to nearest food
        const ecosystem = this.ecosystem || (typeof window !== 'undefined' && window.ecosystem);
        if (!ecosystem || ecosystem.food.length === 0) return 500; // Default if no food
        
        let minDist = Infinity;
        for (let food of ecosystem.food) {
            const d = dist(this.x, this.y, food.x, food.y);
            minDist = min(minDist, d);
        }
        return minDist;
    }
    
    minimizeFreeEnergyThroughSound() {
        // ACTIVE INFERENCE IN SOUND DOMAIN: Adjust sound to minimize free energy
        // This implements the "action" part of active inference for sound
        
        if (!this.soundOscillator || !this.soundGain) return;
        
        // Sound can be used to:
        // 1. Communicate prediction errors to other organisms (social active inference)
        // 2. Reduce internal prediction errors through acoustic feedback
        // 3. Express free energy state (higher free energy = more "uncertain" sound)
        
        // Calculate desired sound adjustments to minimize free energy
        const freeEnergyTarget = 20; // Target free energy level (low = stable)
        const freeEnergyError = this.freeEnergy - freeEnergyTarget;
        
        // Adjust sound parameters to reduce free energy
        // If free energy is high, sound becomes more "exploratory" (varies more)
        // If free energy is low, sound becomes more "exploitative" (stable)
        
        // Frequency stability: Lower free energy = more stable frequency
        const frequencyStability = map(this.freeEnergy, 0, 100, 0.95, 0.7);
        this.generativeModel.expectedFrequency = lerp(
            this.generativeModel.expectedFrequency,
            this.generativeModel.expectedFrequency,
            frequencyStability
        );
        
        // Volume stability: Lower free energy = more stable volume
        const volumeStability = map(this.freeEnergy, 0, 100, 0.98, 0.85);
        this.generativeModel.expectedVolume = lerp(
            this.generativeModel.expectedVolume,
            this.generativeModel.expectedVolume,
            volumeStability
        );
        
        // Modulation reflects prediction errors: Higher errors = more modulation
        const modulationFromErrors = map(this.predictionError.totalError, 0, 100, 0.5, 2.0);
        this.generativeModel.expectedModulationRate *= modulationFromErrors;
        this.generativeModel.expectedModulationRate = constrain(this.generativeModel.expectedModulationRate, 0.1, 10);
        
        // Sound as communication: Use sound to signal prediction errors to nearby organisms
        // This enables "social active inference" - organisms can learn from each other's sounds
        const ecosystem = this.ecosystem || (typeof window !== 'undefined' && window.ecosystem);
        if (ecosystem) {
            // Nearby organisms can "hear" prediction errors through sound
            // This creates a form of acoustic communication about environmental uncertainty
            for (let org of ecosystem.organisms) {
                if (org.id === this.id || !org.isPlayingSound) continue;
                
                const d = dist(this.x, this.y, org.x, org.y);
                if (d < 200) {
                    // Close organisms can influence each other's sound predictions
                    // This creates acoustic coupling - organisms synchronize when nearby
                    const couplingStrength = map(d, 0, 200, 0.1, 0.0);
                    if (org.generativeModel) {
                        // Influence each other's expected frequencies (acoustic resonance)
                        this.generativeModel.expectedFrequency = lerp(
                            this.generativeModel.expectedFrequency,
                            org.generativeModel.expectedFrequency,
                            couplingStrength
                        );
                    }
                }
            }
        }
    }

    generateSoundFromCode() {
        // ULTRA-SIMPLE: Only top 2 most complex organisms have sound
        if (!soundEnabled) {
            if (this.isPlayingSound) {
                this.stopSound();
            }
            return;
        }
        
        if (!audioContext) {
            if (this.isPlayingSound) {
                this.stopSound();
            }
            return;
        }
        
        // SIMPLE RULE: Only most complex or second most complex can have sound
        // But don't stop sound here - let updateSoundManagement handle it
        // This prevents sounds from stopping mid-frame
        if (!this.isMostComplex && !this.isSecondMostComplex) {
            // Not in top 2 - just return, don't stop (updateSoundManagement will handle stopping)
            return;
        }
        
        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume().catch(() => {});
        }
        
        // Update sound if already playing
        if (this.isPlayingSound && this.soundOscillator && this.soundGain) {
            try {
                // Simple frequency based on complexity
                const baseFreq = map(this.complexity || 0, 0, 64, 200, 400);
                this.soundOscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
                
                // Simple volume
                const baseVolume = 0.002;
                this.soundGain.gain.setValueAtTime(baseVolume, audioContext.currentTime);
            } catch (e) {
                // Ignore errors - don't stop sound
            }
        } else if (!this.isPlayingSound) {
            // Start sound if not playing
            this.startSound();
        }
    }
    
    shouldHaveSound(soundMgr) {
        // SIMPLIFIED: Always return true - no restrictions
        // Let the browser handle limits naturally
        return true;
    }
    
    startSound() {
        // ULTRA-SIMPLE: Only top 2 organisms can start sound
        if (!soundEnabled) {
            return;
        }
        
        if (!audioContext) {
            return;
        }
        
        // Only allow if most complex or second most complex
        if (!this.isMostComplex && !this.isSecondMostComplex) {
            return;
        }
        
        // If already playing, don't recreate
        if (this.isPlayingSound && this.soundOscillator) {
            return;
        }
        
        // Clean up any existing sound
        if (this.soundOscillator) {
            this.stopSound();
        }
        
        try {
            // Resume if suspended
            if (audioContext.state === 'suspended') {
                audioContext.resume().catch(() => {});
            }
            
            // Create simple oscillator
            this.soundOscillator = audioContext.createOscillator();
            this.soundGain = audioContext.createGain();
            
            // Simple frequency based on complexity
            const baseFreq = map(this.complexity || 0, 0, 64, 200, 400);
            this.soundOscillator.type = 'sine';
            this.soundOscillator.frequency.value = baseFreq;
            
            // Simple volume
            this.soundGain.gain.value = 0.002;
            
            // Connect and start
            this.soundOscillator.connect(this.soundGain);
            this.soundGain.connect(audioContext.destination);
            this.soundOscillator.start();
            this.isPlayingSound = true;
        } catch (e) {
            // Silently fail - don't log errors
            this.isPlayingSound = false;
        }
    }
    
    stopSound() {
        // SIMPLIFIED: Aggressive cleanup - stop everything immediately
        this.isPlayingSound = false;
        
        // Stop and disconnect oscillator
        if (this.soundOscillator) {
            try {
                if (this.soundOscillator.state !== 'finished' && this.soundOscillator.state !== 'closed') {
                    this.soundOscillator.stop();
                }
            } catch (e) {}
            try {
                this.soundOscillator.disconnect();
            } catch (e) {}
            this.soundOscillator = null;
        }
        
        // Clean up modulator if it exists
        if (this.soundModulator) {
            try {
                if (this.soundModulator.state !== 'finished' && this.soundModulator.state !== 'closed') {
                    this.soundModulator.stop();
                }
            } catch (e) {}
            try {
                this.soundModulator.disconnect();
            } catch (e) {}
            this.soundModulator = null;
        }
        
        // Clean up mod gain if it exists
        if (this.soundModGain) {
            try {
                this.soundModGain.disconnect();
            } catch (e) {}
            this.soundModGain = null;
        }
        
        // Clean up filter if it exists
        if (this.soundFilter) {
            try {
                this.soundFilter.disconnect();
            } catch (e) {}
            this.soundFilter = null;
        }
        
        // Disconnect gain
        if (this.soundGain) {
            try {
                this.soundGain.disconnect();
            } catch (e) {}
            this.soundGain = null;
        }
    }

    update() {
        // Age the organism
        this.age++;
        
        // Update hunger - decrease over time
        // Symbionts need to eat MORE due to maintaining symbiotic relationship
        this.lastFoodEaten++;
        const hungerDecreaseRate = this.isSymbiont ? 0.12 : 0.05; // Symbionts lose hunger 2.4x faster
        this.hunger = max(0, this.hunger - hungerDecreaseRate);
        
        // Update genotype analysis periodically (genotype can change as code evolves)
        if (this.executionCounter % 30 === 0) {
            this.genotype = this.analyzeGenotype();
        }
        
        // SELF-REPLICATION MECHANISM: Update replication readiness
        this.updateSelfReplication();
        
        // FREE ENERGY PRINCIPLE & ACTIVE INFERENCE
        // 1. Generate predictions (generative model)
        this.generatePredictions();
        
        // 2. Compute prediction errors
        this.computePredictionErrors();
        
        // 3. Calculate free energy
        this.calculateFreeEnergy();
        
        // 4. Update generative model based on observations (perception)
        this.updateGenerativeModel();
        
        // 5. Plan actions to minimize free energy (active inference)
        this.planActionsToMinimizeFreeEnergy();
        
        // Execute code to update behavior and phenotype
        this.executeCode();
        
        // Update phagocytosis process
        this.updatePhagocytosis();
        
        // Generate sound from code
        this.generateSoundFromCode();
        
        // SYMBIONT BEHAVIOR: Coordinated movement with partner
        if (this.isSymbiont && this.symbiontPartner) {
            const partnerDist = dist(this.x, this.y, this.symbiontPartner.x, this.symbiontPartner.y);
            
            // Maintain optimal distance from partner (coordination)
            const optimalDistance = 80 + (this.symbiosisStrength * 40); // Closer when stronger bond
            if (partnerDist > optimalDistance * 1.5) {
                // Move toward partner if too far
                const angleToPartner = atan2(this.symbiontPartner.y - this.y, this.symbiontPartner.x - this.x);
                const attractionStrength = map(partnerDist, optimalDistance * 1.5, 500, 0.3, 0.1);
                this.vx += cos(angleToPartner) * attractionStrength * this.symbiosisStrength;
                this.vy += sin(angleToPartner) * attractionStrength * this.symbiosisStrength;
            } else if (partnerDist < optimalDistance * 0.7) {
                // Move away if too close (maintain space)
                const angleAway = atan2(this.y - this.symbiontPartner.y, this.x - this.symbiontPartner.x);
                const repulsionStrength = map(partnerDist, optimalDistance * 0.7, 0, 0.2, 0.05);
                this.vx += cos(angleAway) * repulsionStrength;
                this.vy += sin(angleAway) * repulsionStrength;
            }
            
            // Synchronize pulse phase with partner (visual coordination)
            const phaseDiff = abs(this.pulsePhase - this.symbiontPartner.pulsePhase);
            if (phaseDiff > PI) {
                // Sync pulses when close
                this.pulsePhase = lerp(this.pulsePhase, this.symbiontPartner.pulsePhase, 0.05 * this.symbiosisStrength);
            }
            
            // Share movement direction (coordinated exploration)
            const sharedDirection = (this.behaviorState.preferredDirection + this.symbiontPartner.behaviorState.preferredDirection) / 2;
            this.behaviorState.preferredDirection = lerp(this.behaviorState.preferredDirection, sharedDirection, 0.1 * this.symbiosisStrength);
        }
        
        // SUPER ORGANISM BEHAVIOR: Collective movement and intelligence
        if (this.isInSuperOrganism && this.superOrganismGroup) {
            // Calculate group center
            let groupCenterX = 0, groupCenterY = 0;
            let groupSize = 0;
            for (let member of this.superOrganismGroup) {
                groupCenterX += member.x;
                groupCenterY += member.y;
                groupSize++;
            }
            groupCenterX /= groupSize;
            groupCenterY /= groupSize;
            
            // Move toward group center (cohesion)
            const distToCenter = dist(this.x, this.y, groupCenterX, groupCenterY);
            if (distToCenter > 150) {
                const angleToCenter = atan2(groupCenterY - this.y, groupCenterX - this.x);
                this.vx += cos(angleToCenter) * 0.15;
                this.vy += sin(angleToCenter) * 0.15;
            }
            
            // Collective alignment - average direction of group
            let avgVx = 0, avgVy = 0;
            for (let member of this.superOrganismGroup) {
                avgVx += member.vx;
                avgVy += member.vy;
            }
            avgVx /= groupSize;
            avgVy /= groupSize;
            
            // Align with group movement
            const alignmentStrength = 0.1;
            this.vx = lerp(this.vx, avgVx, alignmentStrength);
            this.vy = lerp(this.vy, avgVy, alignmentStrength);
            
            // Shared collective memory influences behavior
            if (this.collectiveMemory.length > 0) {
                const memoryInfluence = this.collectiveMemory[this.collectiveMemory.length - 1] % 256;
                const memoryAngle = map(memoryInfluence, 0, 255, 0, TWO_PI);
                this.vx += cos(memoryAngle) * 0.05;
                this.vy += sin(memoryAngle) * 0.05;
            }
        }
        
        // Movement based on code execution results (behavior) + ACTIVE INFERENCE
        const activityLevel = this.behaviorState.activityLevel;
        const movementChance = activityLevel * activityLevel; // Square it
        
        if (this.codeChanged || random() < movementChance) {
            // ACTIVE INFERENCE: Combine code-based movement with free energy minimization
            const activeInferenceWeight = map(this.freeEnergy, 0, 100, 0.3, 0.7); // More free energy = more active inference
            const codeInfluenceWeight = 1.0 - activeInferenceWeight;
            
            // Movement speed directly from code execution (speedPreference from memory pattern[5])
            // SYMBIONT: Enhanced speed when symbiotic
            const baseSpeedMultiplier = map(activityLevel, 0, 1, 0.1, 1.5) * this.behaviorState.speedPreference;
            const speedMultiplier = this.isSymbiont ? baseSpeedMultiplier * 1.3 : baseSpeedMultiplier;
            
            // Direction from code execution
            const preferredDir = this.behaviorState.preferredDirection;
            const codeInfluence = (0.4 + (this.behaviorState.aggressiveness * 0.2)) * codeInfluenceWeight;
            this.vx += cos(preferredDir) * codeInfluence * activityLevel;
            this.vy += sin(preferredDir) * codeInfluence * activityLevel;
            
            // ACTIVE INFERENCE: Add action plan to minimize free energy
            const activeInferenceStrength = activeInferenceWeight * activityLevel * speedMultiplier;
            this.vx += this.activeInference.actionPlan.vx * activeInferenceStrength;
            this.vy += this.activeInference.actionPlan.vy * activeInferenceStrength;
            
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
    
    updatePhagocytosis() {
        // Update phagocytosis (engulfment) process
        if (this.isEngulfing && this.engulfTarget) {
            // Check if target still exists and is valid
            if (!this.engulfTarget || this.engulfTarget.isBeingEngulfed === false) {
                // Target was eaten or escaped, stop engulfing
                this.isEngulfing = false;
                this.engulfTarget = null;
                this.engulfProgress = 0;
                return;
            }
            
            // Move predator towards prey (slowly engulfing)
            const dx = this.engulfTarget.x - this.x;
            const dy = this.engulfTarget.y - this.y;
            const distance = dist(this.x, this.y, this.engulfTarget.x, this.engulfTarget.y);
            
            // Slow movement towards prey (engulfment motion)
            if (distance > this.size + this.engulfTarget.size) {
                const engulfSpeed = 0.3; // Slow engulfment speed
                this.vx += (dx / distance) * engulfSpeed * 0.1;
                this.vy += (dy / distance) * engulfSpeed * 0.1;
            }
            
            // Increase engulfment progress
            this.engulfTimer++;
            const engulfDuration = 120; // Frames to complete engulfment (~2 seconds)
            this.engulfProgress = min(100, (this.engulfTimer / engulfDuration) * 100);
            
            // When engulfment is complete, trigger eating
            if (this.engulfProgress >= 100) {
                const ecosystem = this.ecosystem || (typeof window !== 'undefined' && window.ecosystem);
                if (ecosystem && this.engulfTarget) {
                    // Reset prey's engulfment state before eating
                    this.engulfTarget.isBeingEngulfed = false;
                    this.engulfTarget.engulfProgress = 0;
                    
                    ecosystem.eatOrganism(this, this.engulfTarget);
                }
                // Reset phagocytosis state
                this.isEngulfing = false;
                this.engulfTarget = null;
                this.engulfProgress = 0;
                this.engulfTimer = 0;
            }
        }
        
        // Reset if not engulfing
        if (!this.isEngulfing) {
            this.engulfProgress = 0;
            this.engulfTimer = 0;
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
        
        // PHAGOCYTOSIS VISUAL: Draw engulfment membrane if engulfing another organism
        if (this.isEngulfing && this.engulfTarget) {
            // Draw from predator's position to prey's position
            const preyX = this.engulfTarget.x - this.x;
            const preyY = this.engulfTarget.y - this.y;
            const preyDistance = dist(0, 0, preyX, preyY);
            const preySize = this.engulfTarget.size + this.engulfTarget.complexity * 0.8;
            
            // Calculate engulfment progress (0-1)
            const progress = this.engulfProgress / 100;
            
            // Draw wrapping membrane around prey
            // The membrane wraps around the prey more as progress increases
            const membraneAlpha = map(progress, 0, 1, 100, 200);
            const membraneColor = this.getColorFromPalette();
            
            // Draw multiple layers of membrane wrapping around prey
            for (let layer = 0; layer < 3; layer++) {
                const layerProgress = max(0, progress - layer * 0.2);
                if (layerProgress <= 0) continue;
                
                const wrapAmount = layerProgress * (1 + layer * 0.3); // More wrapping for outer layers
                const membraneRadius = preySize * (0.5 + wrapAmount * 0.5);
                
                // Draw partial circle wrapping around prey
                push();
                translate(preyX, preyY);
                noFill();
                stroke(membraneColor[0], membraneColor[1], membraneColor[2], membraneAlpha / (layer + 1));
                strokeWeight(2 - layer * 0.5);
                
                // Draw wrapping arc (starts from top and wraps around)
                const startAngle = -HALF_PI;
                const endAngle = startAngle + TWO_PI * wrapAmount;
                arc(0, 0, membraneRadius * 2, membraneRadius * 2, startAngle, endAngle);
                
                // Draw connecting lines from predator to prey membrane
                if (layer === 0) {
                    const connectionPoints = 8;
                    for (let i = 0; i < connectionPoints; i++) {
                        const angle = (TWO_PI / connectionPoints) * i;
                        const connectionProgress = (sin(angle * wrapAmount * 2) + 1) / 2;
                        if (connectionProgress > 0.3) {
                            const px = cos(angle) * membraneRadius;
                            const py = sin(angle) * membraneRadius;
                            stroke(membraneColor[0], membraneColor[1], membraneColor[2], membraneAlpha * 0.3);
                            strokeWeight(1);
                            line(-preyX, -preyY, px, py);
                        }
                    }
                }
                pop();
            }
        }
        
        // PHAGOCYTOSIS VISUAL: Draw being engulfed effect
        if (this.isBeingEngulfed) {
            // Draw shrinking effect and membrane pressure
            const shrinkFactor = map(this.engulfProgress || 0, 0, 100, 1.0, 0.7);
            const pressureAlpha = map(this.engulfProgress || 0, 0, 100, 0, 150);
            
            // Draw pressure rings around organism being engulfed
            for (let i = 0; i < 2; i++) {
                const ringSize = (this.size + this.complexity * 0.8) * (1 + i * 0.3) * shrinkFactor;
                noFill();
                stroke(255, 100, 100, pressureAlpha / (i + 1));
                strokeWeight(1.5 - i * 0.5);
                circle(0, 0, ringSize);
            }
        }
        
        // Phase-based phenotype multipliers
        const phaseMultipliers = this.phasePhenotype[this.phase];
        
        // Phase transition visual effect (pulsing during transition)
        const transitionEffect = this.phaseTransitionTimer > 0 
            ? map(this.phaseTransitionTimer, 30, 0, 1.3, 1.0) 
            : 1.0;
        
        // Phenotype: Size directly from code execution (operations count) + phase multiplier
        const executionSizeBonus = map(this.lastExecutionResult.operations, 0, 100, 0, 3);
        const pulse = sin(this.pulsePhase) * 0.2 + 1;
        const baseSize = this.size + this.complexity * 0.8;
        const currentSize = (baseSize + executionSizeBonus) * pulse * phaseMultipliers.sizeMultiplier * transitionEffect;
        
        // Phenotype: Color directly from palette based on genotype and code execution
        let baseColor = this.getColorFromPalette();
        
        // Apply phase brightness multiplier
        baseColor = baseColor.map(c => constrain(c * phaseMultipliers.colorBrightness, 0, 255));
        
        // If symbiont, adjust color based on symbiosis strength (darker = stronger bond)
        if (this.isSymbiont) {
            // Stronger symbiosis = darker color (more defined)
            const symbiontAdjustment = map(this.symbiosisStrength, 0, 1, 0, -30);
            baseColor = baseColor.map(c => constrain(c + symbiontAdjustment, 0, 255));
        }
        
        // Phenotype: Shape variation directly from code execution (memory pattern[0])
        const shapeVariation = this.lastExecutionResult.memoryPattern.length > 0 
            ? map(this.lastExecutionResult.memoryPattern[0] % 256, 0, 255, 0.7, 1.3)
            : 1.0;
        
        // Phenotype: Shape complexity directly from code execution (memory pattern[6]) + phase multiplier
        const baseShapeComplexity = this.lastExecutionResult.memoryPattern.length > 6
            ? map(this.lastExecutionResult.memoryPattern[6] % 256, 0, 255, 0.5, 2.0)
            : 1.0;
        const shapeComplexity = baseShapeComplexity * phaseMultipliers.shapeComplexity;
        
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
        
        // SYMBIONT DIFFERENTIATION: Coordinated visual appearance
        if (this.isSymbiont && this.symbiontPartner) {
            // Synchronized pulsing with partner (visual coordination)
            const partnerPhase = this.symbiontPartner.pulsePhase;
            const syncPulse = sin((this.pulsePhase + partnerPhase) / 2) * 0.3 + 0.7;
            
            // Color glow around symbionts (darker = stronger symbiosis)
            const symbiontBrightness = map(this.symbiosisStrength, 0, 1, 0.7, 0.4);
            const symbiontColor = baseColor.map(c => c * symbiontBrightness);
            stroke(symbiontColor[0], symbiontColor[1], symbiontColor[2], 100 * syncPulse);
            strokeWeight(2);
            noFill();
            circle(0, 0, currentSize * 1.8);
            
            // Inner symbiont marker - synchronized
            stroke(symbiontColor[0], symbiontColor[1], symbiontColor[2], 150 * syncPulse);
            strokeWeight(1);
            circle(0, 0, currentSize * 1.3);
            
            // Connection indicator - shows bond strength
            if (this.symbiosisStrength > 0.7) {
                // Strong bond - additional visual marker
                const darkerColor = symbiontColor.map(c => constrain(c - 20, 0, 255));
                stroke(darkerColor[0], darkerColor[1], darkerColor[2], 80 * syncPulse);
                strokeWeight(0.5);
                circle(0, 0, currentSize * 2.2);
            }
        }
        
        // SUPER ORGANISM DIFFERENTIATION: Unified visual appearance
        if (this.isInSuperOrganism && this.superOrganismGroup) {
            // Calculate group average pulse for synchronization
            let avgPulse = 0;
            for (let member of this.superOrganismGroup) {
                avgPulse += member.pulsePhase;
            }
            avgPulse /= this.superOrganismGroup.length;
            
            // Unified pulsing pattern
            const unifiedPulse = sin(avgPulse) * 0.4 + 0.6;
            // Use palette color for super organisms (darker version)
            const superOrgColor = baseColor.map(c => c * 0.5);
            
            // Outer ring - unified appearance
            stroke(superOrgColor[0], superOrgColor[1], superOrgColor[2], 120 * unifiedPulse);
            strokeWeight(3);
            noFill();
            circle(0, 0, currentSize * 2.0);
            
            // Inner marker - shows membership
            stroke(superOrgColor[0], superOrgColor[1], superOrgColor[2], 100 * unifiedPulse);
            strokeWeight(1.5);
            circle(0, 0, currentSize * 1.5);
        }
        
        // Amoeba-like organic blob shape
        fill(baseColor[0], baseColor[1], baseColor[2]);
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
        
        // Inner blob for depth (lighter version)
        fill(constrain(baseColor[0] + 20, 0, 255), constrain(baseColor[1] + 20, 0, 255), constrain(baseColor[2] + 20, 0, 255), 150);
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
            stroke(baseColor[0], baseColor[1], baseColor[2], 50);
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
    constructor(numOrganisms = 1) {
        this.organisms = [];
        this.food = []; // Food/seeds in the environment
        this.interpreter = new BrainfuckInterpreter();
        this.interactionCount = 0;
        this.totalOperations = 0;
        this.maxOperations = 0;
        this.operationsHistory = [];
        this.isRunning = false;
        this.speed = 1;
        this.maxPopulation = 400; // Maximum number of organisms
        this.nextId = numOrganisms;
        
        // Food spawning parameters
        this.foodSpawnTimer = 0;
        this.foodSpawnInterval = 90; // Spawn food every 90 frames (balanced spawning)
        this.maxFood = 30; // Maximum food items in environment
        
        // AUTOPOIESIS: Self-maintenance and self-regulation
        this.autopoiesisState = {
            targetPopulation: 50, // Target population for homeostasis
            targetFoodRatio: 0.6, // Target food-to-population ratio
            homeostasisStrength: 0.02, // How strongly system regulates itself
            systemHealth: 1.0, // Overall system health (0-1)
            lastHealthCheck: 0,
            healthCheckInterval: 300 // Check health every 300 frames
        };
        
        // EVOLUTIONARY SOUND SYSTEM: Evolves but with strict limits to prevent feedback
        this.soundManagement = {
            maxActiveOscillators: 3, // ULTRA-STRICT: Only 3 sounds max (top 3 organisms only)
            currentActiveOscillators: 0, // Track active oscillators for stats only
            lastSoundStartTime: 0, // Throttle sound starts
            soundStartCooldown: 500, // Longer cooldown between sound starts (500ms)
            errorCount: 0, // Track sound errors
            maxErrors: 3, // Fewer errors before disabling (more conservative)
            disabledUntil: 0, // Timestamp when sound will be re-enabled
            // Feedback prevention
            maxTotalVolume: 0.009, // Maximum total volume across all sounds (3 sounds * 0.003)
            updateRate: 0.05 // Gradual evolution rate (prevents sudden changes)
        };
        
        // Statistics tracking
        this.explosionCount = 0; // Renamed to splittingCount conceptually
        this.absorptionCount = 0;
        this.offspringCount = 0; // Total offspring created from splittings
        this.deadCount = 0; // Total organisms that have died
        this.foodEatenCount = 0; // Track food consumption
        this.foodProducedCount = 0; // Track total food produced
        this.symbiogenesisCount = 0; // Track symbiogenesis events
        this.selfReplicationCount = 0; // Track self-replication events
        
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
                // Map fitness to subtle color background (uses lightest palette color)
                const currentPalette = getCurrentPalette();
                const lightestColor = colorPaletteMode === 0 ? [240, 240, 240] : currentPalette[currentPalette.length - 1];
                const brightness = map(fitness, 0, 2, 0.95, 0.98);
                fill(lightestColor[0] * brightness, lightestColor[1] * brightness, lightestColor[2] * brightness, 30); // Very transparent
                rect(x, y, resolution, resolution);
            }
        }
        
        pop();
    }

    initializeEcosystem(numOrganisms) {
        this.organisms = [];
        const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
        
        // Start with ONE increasingly complex organism
        if (numOrganisms === 1) {
            // Create a more complex starting organism
            let tape = '';
            // Start with more valid instructions (20-30% valid ops)
            for (let j = 0; j < 64; j++) {
                if (Math.random() < 0.25) {
                    tape += validOps[Math.floor(Math.random() * validOps.length)];
                } else {
                    tape += String.fromCharCode(Math.floor(Math.random() * 256));
                }
            }
            
            const x = width / 2;
            const y = height / 2;
            const org = new Organism(x, y, tape, 0);
            org.ecosystem = this; // Give organism reference to ecosystem for sound management
            org.initializeAsOrganism(); // Initialize genotype and phenotype
            this.organisms.push(org);
        } else {
            // Fallback for multiple organisms (if needed)
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
                const org = new Organism(x, y, tape, i);
                org.ecosystem = this; // Give organism reference to ecosystem
                org.initializeAsOrganism(); // Initialize genotype and phenotype
                this.organisms.push(org);
            }
        }
        
        // Initialize some food in the environment
        this.spawnInitialFood();
    }
    
    spawnInitialFood() {
        // Spawn initial food items - enough for the starting organism to find food
        const initialFoodCount = 8; // Balanced initial food
        for (let i = 0; i < initialFoodCount; i++) {
            this.food.push(new Food());
            this.foodProducedCount++;
        }
    }
    
    updateAutopoiesis() {
        // AUTOPOIESIS: Self-maintenance and homeostasis
        // Periodically check and adjust system health
        
        // Calculate system health metrics
        const populationRatio = this.organisms.length / this.autopoiesisState.targetPopulation;
        const avgHunger = this.organisms.length > 0 ? 
            this.organisms.reduce((sum, org) => sum + (org.hunger || 50), 0) / this.organisms.length : 50;
        const foodRatio = this.food.length / max(1, this.organisms.length * 0.5);
        const avgComplexity = this.organisms.length > 0 ?
            this.organisms.reduce((sum, org) => sum + (org.complexity || 0), 0) / this.organisms.length : 0;
        
        // System health is combination of:
        // 1. Population stability (close to target)
        // 2. Food availability (adequate for population)
        // 3. Organism health (not starving)
        const populationHealth = 1 - abs(1 - populationRatio) * 0.5; // Best when ratio = 1
        const foodHealth = constrain(foodRatio, 0, 1.5) / 1.5; // Best when food ratio is 0.5-1.5
        const hungerHealth = map(avgHunger, 0, 100, 0, 1); // Better when organisms are well-fed
        
        // Combined system health
        this.autopoiesisState.systemHealth = (populationHealth * 0.4 + foodHealth * 0.4 + hungerHealth * 0.2);
        
        // AUTOPOIESIS: Adaptive target adjustment
        // If system is stable and healthy, gradually increase target population (growth)
        // If system is stressed, decrease target (contraction)
        if (this.autopoiesisState.systemHealth > 0.7 && avgComplexity > 20) {
            // System is healthy and complex - can support more organisms
            this.autopoiesisState.targetPopulation += 0.01;
            this.autopoiesisState.targetPopulation = min(this.autopoiesisState.targetPopulation, this.maxPopulation * 0.6);
        } else if (this.autopoiesisState.systemHealth < 0.4) {
            // System is stressed - reduce target population
            this.autopoiesisState.targetPopulation -= 0.02;
            this.autopoiesisState.targetPopulation = max(this.autopoiesisState.targetPopulation, 20);
        }
        
        // AUTOPOIESIS: Maintain food-to-population ratio
        // Adjust target food ratio based on system complexity
        const complexityFactor = map(avgComplexity, 0, 64, 0.4, 0.8);
        this.autopoiesisState.targetFoodRatio = 0.5 + (complexityFactor - 0.5) * 0.2;
    }
    
    updateSoundManagement() {
        // ULTRA-SIMPLE: Only ensure top 2 organisms have sound
        // Use the flags that were already set in update(), don't recalculate
        if (!soundEnabled) {
            // If sound disabled, stop all sounds
            for (let org of this.organisms) {
                if (org.isPlayingSound) {
                    org.stopSound();
                }
            }
            return;
        }
        
        // Use the flags that are already set - don't recalculate top 2 here
        // This prevents race conditions and unexpected stops
        // Stop sounds ONLY for organisms that are clearly NOT in top 2
        // Don't stop if flags are not set yet (prevents false stops)
        for (let org of this.organisms) {
            if (org.isPlayingSound) {
                // Only stop if we're CERTAIN it's not top 2
                // If flags aren't set yet, don't stop (they'll be set next frame)
                const definitelyNotTopTwo = org.isMostComplex === false && org.isSecondMostComplex === false;
                if (definitelyNotTopTwo) {
                    org.stopSound();
                }
            }
        }
        
        // Update stats only
        let activeCount = 0;
        for (let org of this.organisms) {
            if (org.isPlayingSound && org.soundOscillator) {
                activeCount++;
            }
        }
        this.soundManagement.currentActiveOscillators = activeCount;
    }
    
    spawnFood() {
        // AUTOPOIESIS: Self-regulating food spawning based on population needs
        // Calculate average hunger level of organisms
        let totalHunger = 0;
        let avgHunger = 50; // Default if no organisms
        if (this.organisms.length > 0) {
            for (let org of this.organisms) {
                totalHunger += org.hunger || 50;
            }
            avgHunger = totalHunger / this.organisms.length;
        }
        
        // Calculate food need based on population and hunger
        const populationNeed = this.organisms.length * 0.5; // Each organism needs ~0.5 food items
        const hungerNeed = map(avgHunger, 0, 100, 2.0, 0.5); // More hungry = more food needed
        const targetFood = populationNeed * hungerNeed;
        
        // Dynamic max food based on population needs (autopoietic regulation)
        const dynamicMaxFood = max(10, min(60, targetFood * 1.5)); // Adaptive food cap
        
        // Adjust spawn rate based on food deficit
        const foodDeficit = max(0, targetFood - this.food.length);
        const spawnUrgency = map(foodDeficit, 0, 20, 0.3, 1.5); // More urgent if food is low
        
        // Spawn food based on need (autopoietic response)
        if (this.food.length < dynamicMaxFood) {
            // Spawn multiple food items if there's high need
            const numToSpawn = floor(map(foodDeficit, 0, 15, 1, 3));
            for (let i = 0; i < numToSpawn && this.food.length < dynamicMaxFood; i++) {
                this.food.push(new Food());
                this.foodProducedCount++;
            }
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
        // AUTOPOIESIS: Regulated replication - maintains system balance
        // Fitness influences replication chance (fitness already calculated above)
        const populationRatio = this.organisms.length / this.autopoiesisState.targetPopulation;
        const foodRatio = this.food.length / max(1, this.organisms.length * 0.5);
        
        if (operations > 10 && this.organisms.length < this.maxPopulation) {
            const baseReplicationChance = map(operations, 10, 100, 0.02, 0.1);
            // Higher fitness = higher replication chance
            const fitnessBonus = map(avgFitness, 0, 2, 0, 0.15);
            
            // AUTOPOIESIS: Adjust replication based on population and food pressure
            const populationFactor = map(populationRatio, 0, 2, 1.4, 0.3); // Less replication if overpopulated
            const foodFactor = map(foodRatio, 0, 2, 0.5, 1.3); // More replication if food abundant
            
            const replicationChance = (baseReplicationChance + fitnessBonus) * populationFactor * foodFactor;
            
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
        offspring.ecosystem = this; // Give organism reference to ecosystem
        
        // Offspring starts with movement from code inheritance
        offspring.codeChanged = true;
        offspring.vx = (org1.vx + org2.vx) / 2 + random(-0.5, 0.5);
        offspring.vy = (org1.vy + org2.vy) / 2 + random(-0.5, 0.5);
        
        // Initialize as organism (gets genotype and phenotype)
        offspring.initializeAsOrganism();
        
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
            offspring.ecosystem = this; // Give organism reference to ecosystem
            
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
            offspring.ecosystem = this;
            offspring.initializeAsOrganism(); // Initialize genotype and phenotype
            
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
    
    eatFood(org, food) {
        // Organism eats food and gains energy/resources
        // Remove food from array
        const foodIndex = this.food.indexOf(food);
        if (foodIndex > -1) {
            this.food.splice(foodIndex, 1);
            this.foodEatenCount++;
            
            // Reset hunger when eating food
            org.hunger = min(100, org.hunger + 30); // Restore hunger
            org.lastFoodEaten = 0; // Reset starvation timer
            
            // SYMBIONT ADVANTAGE: Share food benefits with partner
            if (org.isSymbiont && org.symbiontPartner) {
                // Partner gets partial benefit from symbiont eating (shared resources)
                org.symbiontPartner.hunger = min(100, org.symbiontPartner.hunger + 10);
                // Strengthen symbiont bond when eating together
                org.symbiosisStrength = min(1.0, org.symbiosisStrength + 0.01);
                org.symbiontPartner.symbiosisStrength = min(1.0, org.symbiontPartner.symbiosisStrength + 0.01);
            }
            
            // Eating food increases complexity by adding valid Brainfuck instructions
            const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
            const currentComplexity = org.calculateComplexity();
            
            // Only increase complexity if below max (64 valid instructions)
            if (currentComplexity < 64) {
                // Add 1-3 valid instructions to the organism's code
                const instructionsToAdd = floor(random(1, 4));
                
                // Find non-functional bytes in the tape to replace with valid instructions
                let newTape = org.tape.split('');
                let addedCount = 0;
                
                for (let i = 0; i < newTape.length && addedCount < instructionsToAdd; i++) {
                    // Replace random bytes with valid instructions
                    if (!validOps.includes(newTape[i]) && random() < 0.3) {
                        newTape[i] = validOps[floor(random(validOps.length))];
                        addedCount++;
                    }
                }
                
                // If we didn't add enough, append to the end (if space allows)
                while (addedCount < instructionsToAdd && newTape.length < 64) {
                    newTape.push(validOps[floor(random(validOps.length))]);
                    addedCount++;
                }
                
                // Update organism's tape
                org.tape = newTape.join('').substring(0, 64); // Ensure max 64 bytes
                
                // Recalculate complexity and appearance
                org.complexity = org.calculateComplexity();
                org.grayValue = org.getGrayValue();
                org.codeChanged = true;
                
                // Re-execute code to update behavior with new complexity
                org.executeCode();
            }
            
            // Eating food allows organism to split/reproduce
            // AUTOPOIESIS: Regulated reproduction - maintains population homeostasis
            const populationRatio = this.organisms.length / this.autopoiesisState.targetPopulation;
            const foodRatio = this.food.length / max(1, this.organisms.length * 0.5);
            
            // Reproduction chance depends on:
            // 1. Complexity (more complex = more likely to reproduce)
            // 2. Population pressure (lower population = higher reproduction)
            // 3. Food availability (more food = higher reproduction)
            const baseSplitChance = map(org.complexity, 0, 64, 0.15, 0.4);
            const populationFactor = map(populationRatio, 0, 2, 1.5, 0.3); // Less reproduction if overpopulated
            const foodFactor = map(foodRatio, 0, 2, 0.5, 1.5); // More reproduction if food abundant
            const splitChance = baseSplitChance * populationFactor * foodFactor;
            
            // Only split if population is below autopoietic threshold
            const populationThreshold = this.autopoiesisState.targetPopulation * 1.2; // 20% above target
            if (this.organisms.length < populationThreshold && random() < splitChance) {
                this.splitFromEating(org);
            }
            
            // Eating food can also mutate code slightly (evolution from nutrition)
            if (random() < 0.1) { // Balanced mutation chance
                this.mutateCode(org);
            }
            
            return true;
        }
        return false;
    }
    
    splitFromEating(org) {
        // When organism eats food, it can split and create offspring at the edge of its code
        const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
        
        // Extract valid instructions
        let validCode = '';
        for (let c of org.tape) {
            if (validOps.includes(c)) {
                validCode += c;
            }
        }
        
        // Create 1-2 offspring from eating
        const numOffspring = floor(random(1, 3));
        const codePerOffspring = validCode.length > 0 ? floor(validCode.length / numOffspring) : 0;
        
        let actualOffspringCreated = 0;
        
        for (let i = 0; i < numOffspring && this.organisms.length < this.maxPopulation; i++) {
            // Extract code segment for this offspring
            let offspringCode = '';
            if (validCode.length > 0) {
                const startIdx = i * codePerOffspring;
                const endIdx = (i === numOffspring - 1) ? validCode.length : (i + 1) * codePerOffspring;
                offspringCode = validCode.substring(startIdx, endIdx);
            }
            
            // Fill to 64 bytes with random bytes
            while (offspringCode.length < 64) {
                if (random() < 0.1) {
                    offspringCode += validOps[floor(random(validOps.length))];
                } else {
                    offspringCode += String.fromCharCode(Math.floor(Math.random() * 256));
                }
            }
            offspringCode = offspringCode.substring(0, 64);
            
            // Create offspring at edge of parent (radial from parent position)
            const angle = random(TWO_PI);
            const distance = org.size * 2 + random(10, 30);
            const x = constrain(org.x + cos(angle) * distance, 50, width - 50);
            const y = constrain(org.y + sin(angle) * distance, 50, height - 50);
            
            const offspring = new Organism(x, y, offspringCode, this.nextId++);
            offspring.ecosystem = this;
            offspring.initializeAsOrganism(); // Initialize genotype and phenotype
            
            // Give offspring velocity away from parent
            const speed = random(1, 3);
            offspring.vx = cos(angle) * speed;
            offspring.vy = sin(angle) * speed;
            
            this.organisms.push(offspring);
            actualOffspringCreated++;
        }
        
        // Track offspring created from eating
        this.offspringCount += actualOffspringCreated;
        this.explosionCount++; // Count as a splitting event
    }
    
    eatOrganism(predator, prey) {
        // One organism eats another (cannibalism/predation)
        // Predator absorbs prey's code
        const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
        
        // Extract valid instructions from prey
        let preyCode = '';
        for (let c of prey.tape) {
            if (validOps.includes(c)) {
                preyCode += c;
            }
        }
        
        // Absorb prey's code into predator (similar to absorption mechanism)
        if (preyCode.length > 0) {
            // Replace non-functional bytes in predator's tape with absorbed code
            let newTape = predator.tape;
            let preyIndex = 0;
            
            for (let i = 0; i < newTape.length && preyIndex < preyCode.length; i++) {
                const currentByte = newTape.charCodeAt(i);
                if (!validOps.includes(newTape[i])) {
                    // Replace non-functional byte with prey's code
                    newTape = newTape.substring(0, i) + preyCode[preyIndex] + newTape.substring(i + 1);
                    preyIndex++;
                }
            }
            
            // Append remaining code if space allows
            if (preyIndex < preyCode.length && newTape.length < 64) {
                const remaining = preyCode.substring(preyIndex);
                const spaceLeft = 64 - newTape.length;
                newTape += remaining.substring(0, spaceLeft);
            }
            
            predator.tape = newTape;
            predator.complexity = predator.calculateComplexity();
            predator.grayValue = predator.getGrayValue();
            predator.codeChanged = true;
            
            // Re-execute code to update behavior
            predator.executeCode();
        }
        
        // Reset hunger when eating another organism
        predator.hunger = min(100, predator.hunger + 25); // Restore hunger from eating organism
        predator.lastFoodEaten = 0; // Reset starvation timer
        
        // Reset prey's engulfment state before removal
        if (prey.isBeingEngulfed) {
            prey.isBeingEngulfed = false;
            prey.engulfProgress = 0;
        }
        
        // Remove prey organism
        const preyIndex = this.organisms.indexOf(prey);
        if (preyIndex > -1) {
            this.organisms.splice(preyIndex, 1);
            this.absorptionCount++;
        }
        
        // AUTOPOIESIS: Regulated reproduction from predation
        // Eating another organism can trigger splitting (if well-fed and conditions allow)
        const populationRatio = this.organisms.length / this.autopoiesisState.targetPopulation;
        const foodRatio = this.food.length / max(1, this.organisms.length * 0.5);
        
        // Reproduction from predation depends on population and food availability
        const basePredationReproChance = 0.2;
        const populationFactor = map(populationRatio, 0, 2, 1.3, 0.4); // Less reproduction if overpopulated
        const foodFactor = map(foodRatio, 0, 2, 0.6, 1.4); // More reproduction if food abundant
        const predationReproChance = basePredationReproChance * populationFactor * foodFactor;
        
        const populationThreshold = this.autopoiesisState.targetPopulation * 1.2;
        if (this.organisms.length < populationThreshold && random() < predationReproChance) {
            this.splitFromEating(predator);
        }
    }
    
    checkCodeComplementarity(org1, org2) {
        // Analyze if two organisms have complementary code patterns
        const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
        
        // Extract valid instructions from both
        let code1 = '';
        let code2 = '';
        for (let c of org1.tape) {
            if (validOps.includes(c)) code1 += c;
        }
        for (let c of org2.tape) {
            if (validOps.includes(c)) code2 += c;
        }
        
        if (code1.length === 0 || code2.length === 0) return 0;
        
        // Count instruction types in each code
        const countOps = (code) => {
            return {
                '>': (code.match(/>/g) || []).length,
                '<': (code.match(/</g) || []).length,
                '+': (code.match(/\+/g) || []).length,
                '-': (code.match(/-/g) || []).length,
                '.': (code.match(/\./g) || []).length,
                ',': (code.match(/,/g) || []).length,
                '[': (code.match(/\[/g) || []).length,
                ']': (code.match(/\]/g) || []).length
            };
        };
        
        const ops1 = countOps(code1);
        const ops2 = countOps(code2);
        
        // Check for complementarity patterns:
        // 1. One has more '>' (right), other has more '<' (left) - complementary movement
        // 2. One has more '+' (increment), other has more '-' (decrement) - complementary operations
        // 3. One has loops '[', other has different operations - complementary structures
        // 4. Different instruction distributions - complementary behaviors
        
        let complementarityScore = 0;
        
        // Movement complementarity (pointer movement)
        const movementDiff1 = ops1['>'] - ops1['<'];
        const movementDiff2 = ops2['>'] - ops2['<'];
        if (movementDiff1 * movementDiff2 < 0) { // Opposite directions
            complementarityScore += 0.3;
        }
        
        // Operation complementarity (value manipulation)
        const operationDiff1 = ops1['+'] - ops1['-'];
        const operationDiff2 = ops2['+'] - ops2['-'];
        if (operationDiff1 * operationDiff2 < 0) { // Opposite operations
            complementarityScore += 0.3;
        }
        
        // Loop complementarity (one has loops, other has different structure)
        const loops1 = ops1['['] + ops1[']'];
        const loops2 = ops2['['] + ops2[']'];
        if (abs(loops1 - loops2) > 2) { // Different loop structures
            complementarityScore += 0.2;
        }
        
        // I/O complementarity (one outputs, other might input or vice versa)
        const ioDiff = abs((ops1['.'] + ops1[',']) - (ops2['.'] + ops2[',']));
        if (ioDiff > 1) { // Different I/O patterns
            complementarityScore += 0.2;
        }
        
        // Overall code diversity (different instruction distributions)
        let diversity = 0;
        for (let op of validOps) {
            const ratio1 = ops1[op] / code1.length;
            const ratio2 = ops2[op] / code2.length;
            diversity += abs(ratio1 - ratio2);
        }
        complementarityScore += min(diversity / 2, 0.3); // Max 0.3 from diversity
        
        return min(complementarityScore, 1.0); // Clamp to 0-1
    }
    
    checkSymbiogenesis() {
        // Check all pairs of organisms for symbiogenesis conditions
        for (let i = 0; i < this.organisms.length; i++) {
            for (let j = i + 1; j < this.organisms.length; j++) {
                const org1 = this.organisms[i];
                const org2 = this.organisms[j];
                
                // Skip if either is already in a symbiont relationship
                if (org1.isSymbiont || org2.isSymbiont) continue;
                
                const d = dist(org1.x, org1.y, org2.x, org2.y);
                
                // Check genotype compatibility FIRST - this determines symbiosis
                const genotypeCompatibility = org1.getGenotypeCompatibility(org2);
                const codeComplementarity = this.checkCodeComplementarity(org1, org2);
                
                // Combined compatibility score (genotype is primary)
                const compatibilityScore = (genotypeCompatibility * 0.7) + (codeComplementarity * 0.3);
                
                // Conditions for symbiogenesis:
                // 1. Close proximity (within 200 pixels)
                // 2. Genotype compatibility (PRIMARY - determines if organisms can form symbiosis)
                // 3. Compatible complexity (within reasonable range)
                // 4. Some interaction history (optional, helps but not required)
                const complexityDiff = abs(org1.complexity - org2.complexity);
                const affinity1 = org1.relationshipHistory[org2.id] ? org1.relationshipHistory[org2.id].affinity : 0.5;
                const affinity2 = org2.relationshipHistory[org1.id] ? org2.relationshipHistory[org1.id].affinity : 0.5;
                const avgAffinity = (affinity1 + affinity2) / 2;
                
                // Check if conditions are met - GENOTYPE COMPATIBILITY is primary
                // Genotype compatibility > 0.4 means they have compatible genotypes
                if (d < 200 && // Proximity
                    compatibilityScore > 0.4 && // PRIMARY: Must have compatible genotypes
                    complexityDiff <= 25 && // Reasonable complexity difference
                    avgAffinity > 0.4) { // Basic affinity (lower threshold when genotypes are compatible)
                    
                    // Increment symbiosis timer (faster if code is more complementary)
                    if (!org1.symbiosisTimer) org1.symbiosisTimer = 0;
                    if (!org2.symbiosisTimer) org2.symbiosisTimer = 0;
                    
                    // Timer increments faster with higher compatibility
                    const compatibilityBoost = map(compatibilityScore, 0.4, 1.0, 1.0, 2.5);
                    org1.symbiosisTimer += compatibilityBoost;
                    org2.symbiosisTimer += compatibilityBoost;
                    
                    // Symbiogenesis occurs when threshold is reached
                    if (org1.symbiosisTimer >= org1.symbiosisThreshold && 
                        org2.symbiosisTimer >= org2.symbiosisThreshold) {
                        this.formSymbiosis(org1, org2);
                    }
                } else {
                    // Slowly decay timer if conditions not met
                    if (org1.symbiosisTimer) org1.symbiosisTimer = max(0, org1.symbiosisTimer - 0.5);
                    if (org2.symbiosisTimer) org2.symbiosisTimer = max(0, org2.symbiosisTimer - 0.5);
                }
            }
        }
    }
    
    formSymbiosis(org1, org2) {
        // Form symbiont relationship between two organisms
        org1.isSymbiont = true;
        org2.isSymbiont = true;
        org1.symbiontPartner = org2;
        org2.symbiontPartner = org1;
        org1.symbiosisStrength = 0.5; // Start with moderate strength
        org2.symbiosisStrength = 0.5;
        
        // SYMBIONT SOUND: Modulate each other's sounds
        this.setupSymbiontSoundModulation(org1, org2);
        
        // SYMBIONT ADVANTAGES: Enhanced capabilities
        // Boost activity level (more active when symbiotic)
        org1.behaviorState.activityLevel = min(1.0, org1.behaviorState.activityLevel * 1.2);
        org2.behaviorState.activityLevel = min(1.0, org2.behaviorState.activityLevel * 1.2);
        
        // Enhanced social tendency (work together)
        org1.behaviorState.socialTendency = min(1.0, org1.behaviorState.socialTendency * 1.3);
        org2.behaviorState.socialTendency = min(1.0, org2.behaviorState.socialTendency * 1.3);
        
        // Create membrane effect around symbiont pair - persistent while symbionts exist
        org1.hasMembrane = true;
        org2.hasMembrane = true;
        org1.membraneTimer = -1; // -1 means persistent (doesn't expire)
        org2.membraneTimer = -1;
        
        // Share code - exchange complementary instructions
        const validOps = ['>', '<', '+', '-', '.', ',', '[', ']'];
        
        // Extract valid instructions from both
        let code1 = '';
        let code2 = '';
        for (let c of org1.tape) {
            if (validOps.includes(c)) code1 += c;
        }
        for (let c of org2.tape) {
            if (validOps.includes(c)) code2 += c;
        }
        
        // Exchange complementary code segments (if they have different instructions)
        if (code1.length > 0 && code2.length > 0) {
            // Each organism gets some of the other's code
            const exchangeSize = min(5, floor(code1.length / 4), floor(code2.length / 4));
            
            // Org1 gets code from org2
            if (exchangeSize > 0) {
                const startIdx2 = floor(random(code2.length - exchangeSize));
                const exchangedCode2 = code2.substring(startIdx2, startIdx2 + exchangeSize);
                
                // Insert into org1's tape at random position
                let newTape1 = org1.tape.split('');
                const insertPos1 = floor(random(newTape1.length));
                for (let i = 0; i < exchangedCode2.length && insertPos1 + i < newTape1.length; i++) {
                    if (!validOps.includes(newTape1[insertPos1 + i])) {
                        newTape1[insertPos1 + i] = exchangedCode2[i];
                    }
                }
                org1.tape = newTape1.join('').substring(0, 64);
            }
            
            // Org2 gets code from org1
            if (exchangeSize > 0) {
                const startIdx1 = floor(random(code1.length - exchangeSize));
                const exchangedCode1 = code1.substring(startIdx1, startIdx1 + exchangeSize);
                
                // Insert into org2's tape at random position
                let newTape2 = org2.tape.split('');
                const insertPos2 = floor(random(newTape2.length));
                for (let i = 0; i < exchangedCode1.length && insertPos2 + i < newTape2.length; i++) {
                    if (!validOps.includes(newTape2[insertPos2 + i])) {
                        newTape2[insertPos2 + i] = exchangedCode1[i];
                    }
                }
                org2.tape = newTape2.join('').substring(0, 64);
            }
            
            // Update complexity and re-execute code
            org1.complexity = org1.calculateComplexity();
            org2.complexity = org2.calculateComplexity();
            org1.grayValue = org1.getGrayValue();
            org2.grayValue = org2.getGrayValue();
            org1.codeChanged = true;
            org2.codeChanged = true;
            org1.executeCode();
            org2.executeCode();
        }
        
        // Track symbiogenesis event
        this.symbiogenesisCount++;
    }
    
    setupSymbiontSoundModulation(org1, org2) {
        // Create HARMONIC cross-modulation between symbiont sounds - more musical
        if (!audioContext || !soundEnabled) return;
        
        try {
            // Ensure both organisms have sound oscillators
            if (!org1.isPlayingSound) org1.startSound();
            if (!org2.isPlayingSound) org2.startSound();
            
            // Create harmonic modulators that create musical intervals
            if (org1.soundOscillator && org2.soundOscillator) {
                const org1Freq = org1.soundOscillator.frequency.value || 261.63;
                const org2Freq = org2.soundOscillator.frequency.value || 261.63;
                
                // Create harmonic intervals (perfect fifth, major third, etc.)
                // Calculate interval ratio for musical harmony
                const intervalRatio = org2Freq / org1Freq;
                const targetInterval = intervalRatio < 1.3 ? 1.5 : (intervalRatio < 1.6 ? 1.25 : 1.0); // Perfect fifth or major third
                
                // Org1 modulates Org2's frequency with harmonic relationship
                const crossMod1 = audioContext.createOscillator();
                const crossModGain1 = audioContext.createGain();
                crossMod1.frequency.value = org1Freq * 0.05; // Very slow, musical modulation
                crossModGain1.gain.value = 3; // Reduced modulation depth for subtlety
                crossMod1.connect(crossModGain1);
                crossModGain1.connect(org2.soundOscillator.frequency);
                crossMod1.start();
                org1.symbiontCrossModulator = crossMod1;
                
                // Org2 modulates Org1's frequency with harmonic relationship
                const crossMod2 = audioContext.createOscillator();
                const crossModGain2 = audioContext.createGain();
                crossMod2.frequency.value = org2Freq * 0.05; // Very slow, musical modulation
                crossModGain2.gain.value = 3; // Reduced modulation depth
                crossMod2.connect(crossModGain2);
                crossModGain2.connect(org1.soundOscillator.frequency);
                crossMod2.start();
                org2.symbiontCrossModulator = crossMod2;
                
                // Adjust frequencies to create harmonic intervals (if too dissonant)
                const currentRatio = org2Freq / org1Freq;
                if (abs(currentRatio - targetInterval) > 0.1) {
                    // Nudge frequencies toward harmonic interval
                    const newOrg2Freq = org1Freq * targetInterval;
                    org2.soundOscillator.frequency.setValueAtTime(newOrg2Freq, audioContext.currentTime);
                }
            }
        } catch (e) {
            console.log('Symbiont sound modulation error:', e);
        }
    }
    
    setupClusterSound(cluster) {
        // MUSICAL CLUSTER SYNTHESIS - create harmonic relationships in clusters
        if (!audioContext || !soundEnabled) return;
        
        // Calculate cluster chaos level
        let totalComplexity = 0;
        for (let org of cluster) {
            totalComplexity += org.complexity || 0;
        }
        const avgComplexity = totalComplexity / cluster.length;
        const chaosLevel = map(avgComplexity, 0, 64, 0, 1);
        
        // Reduce individual volumes significantly when in cluster (prevent chaos)
        // Larger clusters = lower individual volumes
        const clusterVolumeReduction = map(cluster.length, 3, 15, 0.5, 0.15);
        
        // Adjust volumes and create harmonic relationships
        for (let i = 0; i < cluster.length; i++) {
            const org = cluster[i];
            if (org.soundGain && org.soundOscillator) {
                // Reduce volume based on cluster size
                const currentVolume = org.soundGain.gain.value || 0.003;
                const newVolume = currentVolume * clusterVolumeReduction;
                org.soundGain.gain.setValueAtTime(newVolume, audioContext.currentTime);
                
                // Create harmonic relationships - space frequencies in musical intervals
                if (i > 0 && org.soundOscillator.frequency) {
                    const baseOrg = cluster[0];
                    if (baseOrg.soundOscillator && baseOrg.soundOscillator.frequency) {
                        const baseFreq = baseOrg.soundOscillator.frequency.value;
                        // Create intervals: unison, perfect fifth, major third, etc.
                        const intervals = [1.0, 1.25, 1.5, 1.75, 2.0]; // Musical intervals
                        const intervalIndex = (i - 1) % intervals.length;
                        const targetFreq = baseFreq * intervals[intervalIndex];
                        
                        // Smoothly adjust frequency toward harmonic interval
                        const currentFreq = org.soundOscillator.frequency.value;
                        const adjustedFreq = lerp(currentFreq, targetFreq, 0.1);
                        org.soundOscillator.frequency.setValueAtTime(adjustedFreq, audioContext.currentTime);
                    }
                }
            }
        }
    }
    
    setupSuperOrganismSound(superOrg) {
        // Create unified sound for super organism based on collective genotype
        if (!audioContext || !soundEnabled) return;
        
        try {
            // Calculate average genotype from all members
            let avgSignature = 0;
            let avgStructure = 0;
            let avgRhythm = 0;
            let count = 0;
            
            for (let member of superOrg) {
                if (member.genotype) {
                    avgSignature += member.genotype.signature;
                    avgStructure += member.genotype.structurePattern;
                    avgRhythm += member.genotype.rhythmPattern;
                    count++;
                }
            }
            
            if (count === 0) return;
            
            avgSignature /= count;
            avgStructure /= count;
            avgRhythm /= count;
            
            // Create unified oscillator for super organism
            // Only create once per super organism
            if (!superOrg.superOrganismOscillator) {
                const superOsc = audioContext.createOscillator();
                const superGain = audioContext.createGain();
                const superMod = audioContext.createOscillator();
                const superModGain = audioContext.createGain();
                
                // MUSICAL SUPER ORGANISM SOUND - unified harmonic frequency
                // Use musical root note from pentatonic scale
                const pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
                const rootNoteIndex = floor(map(avgSignature, 0, 1, 0, pentatonicScale.length));
                const rootFreq = pentatonicScale[rootNoteIndex];
                
                // Super organism plays root note (fundamental)
                superOsc.frequency.value = rootFreq * 0.5; // Lower octave for depth
                
                // Add harmonic overtones for richness
                const overtoneGain = audioContext.createGain();
                const overtoneOsc = audioContext.createOscillator();
                overtoneOsc.frequency.value = rootFreq; // First harmonic
                overtoneOsc.type = 'sine';
                overtoneGain.gain.value = 0.015; // Quiet overtone
                overtoneOsc.connect(overtoneGain);
                overtoneGain.connect(superGain);
                overtoneOsc.start();
                superOrg.superOrganismOvertone = overtoneOsc;
                
                // Modulation from average rhythm - slower, more musical
                const superModRate = map(avgRhythm, 0, 1, 0.3, 2); // Very slow, musical
                superMod.frequency.value = superModRate;
                superModGain.gain.value = map(avgStructure, 0, 1, 5, 15); // Reduced modulation
                
                // Always use sine wave for super organism (most musical)
                superOsc.type = 'sine';
                
                // Connect
                superMod.connect(superModGain);
                superModGain.connect(superOsc.frequency);
                superOsc.connect(superGain);
                superGain.connect(audioContext.destination);
                
                // Volume - quiet, musical drone
                superGain.gain.value = 0.02;
                
                // Start
                superOsc.start();
                superMod.start();
                
                // Store references
                superOrg.superOrganismOscillator = superOsc;
                superOrg.superOrganismGain = superGain;
                superOrg.superOrganismModulator = superMod;
            }
            
            // Update sound parameters - maintain musical relationships
            if (superOrg.superOrganismOscillator) {
                const pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
                const rootNoteIndex = floor(map(avgSignature, 0, 1, 0, pentatonicScale.length));
                const rootFreq = pentatonicScale[rootNoteIndex];
                
                superOrg.superOrganismOscillator.frequency.setValueAtTime(
                    rootFreq * 0.5, // Lower octave
                    audioContext.currentTime
                );
                
                // Update overtone if it exists
                if (superOrg.superOrganismOvertone) {
                    superOrg.superOrganismOvertone.frequency.setValueAtTime(
                        rootFreq,
                        audioContext.currentTime
                    );
                }
                
                const superModRate = map(avgRhythm, 0, 1, 0.3, 2); // Slow, musical
                superOrg.superOrganismModulator.frequency.setValueAtTime(
                    superModRate,
                    audioContext.currentTime
                );
            }
        } catch (e) {
            console.log('Super organism sound error:', e);
        }
    }

    update() {
        if (!this.isRunning) return;
        
        // AUTOPOIESIS: Self-maintenance and regulation
        if (typeof this.updateAutopoiesis === 'function') {
            this.updateAutopoiesis();
        }
        
        // SET FLAGS FIRST: Find and mark top 2 organisms BEFORE sound management
        // This ensures sound management uses current flags, not stale ones
        const topTwo = this.getTwoMostComplexOrganisms();
        for (let org of this.organisms) {
            org.isMostComplex = (org === topTwo.mostComplex);
            org.isSecondMostComplex = (org === topTwo.secondMostComplex);
        }
        
        // AUTOPOIESIS: Sound management - self-regulating audio system
        this.updateSoundManagement();
        
        // Update and spawn food (now autopoietically regulated)
        this.foodSpawnTimer++;
        // Dynamic spawn interval based on system needs
        const avgHunger = this.organisms.length > 0 ? 
            this.organisms.reduce((sum, org) => sum + (org.hunger || 50), 0) / this.organisms.length : 50;
        const dynamicInterval = map(avgHunger, 0, 100, 60, 120); // Faster spawning if organisms are hungry
        if (this.foodSpawnTimer >= dynamicInterval) {
            this.foodSpawnTimer = 0;
            this.spawnFood();
        }
        
        // Update food items, check for evolution into organisms, and remove expired ones
        for (let i = this.food.length - 1; i >= 0; i--) {
            const food = this.food[i];
            food.update();
            
            // EVOLUTION: Food becomes organism when complexity threshold is reached
            if (food.complexity >= food.complexityThreshold && this.organisms.length < this.maxPopulation) {
                // Food has evolved into an organism!
                const newOrg = new Organism(food.x, food.y, food.tape, this.nextId++);
                newOrg.ecosystem = this;
                newOrg.age = food.age; // Inherit age
                newOrg.complexity = food.complexity; // Inherit complexity
                
                // Now organism gets genotype and phenotype (only when it becomes an organism)
                newOrg.initializeAsOrganism();
                
                this.organisms.push(newOrg);
                this.food.splice(i, 1); // Remove food, it's now an organism
                continue;
            }
            
            if (food.isExpired()) {
                this.food.splice(i, 1);
            }
        }
        
        // Organisms use gradient descent to find food
        for (let i = this.organisms.length - 1; i >= 0; i--) {
            const org = this.organisms[i];
            
            // Find nearest food using gradient descent
            // SYMBIONT ADVANTAGE: Can sense food from farther away and coordinate with partner
            if (this.food.length > 0) {
                let nearestFood = null;
                let minDistance = Infinity;
                const searchRange = org.isSymbiont ? 800 : 500; // Symbionts can sense food from farther away
                
                // Find nearest food
                for (let food of this.food) {
                    const d = dist(org.x, org.y, food.x, food.y);
                    if (d < minDistance && d < searchRange) {
                        minDistance = d;
                        nearestFood = food;
                    }
                }
                
                // SYMBIONT ADVANTAGE: If partner found food, share information
                if (org.isSymbiont && org.symbiontPartner && !nearestFood) {
                    // Check if partner has found food nearby
                    for (let food of this.food) {
                        const partnerDist = dist(org.symbiontPartner.x, org.symbiontPartner.y, food.x, food.y);
                        if (partnerDist < 300) {
                            // Partner found food - move toward it too
                            const d = dist(org.x, org.y, food.x, food.y);
                            if (d < minDistance) {
                                minDistance = d;
                                nearestFood = food;
                            }
                        }
                    }
                }
                
                    // Gradient descent toward nearest food - STRONG movement toward food
                    if (nearestFood && minDistance > 0) {
                        // Calculate gradient (direction to food)
                        const dx = nearestFood.x - org.x;
                        const dy = nearestFood.y - org.y;
                        const distance = sqrt(dx * dx + dy * dy);
                        
                        // Normalize and apply STRONG gradient descent
                        // Strength increases with hunger (more desperate when hungry)
                        const hungerFactor = map(org.hunger, 0, 100, 2.0, 0.8); // Much stronger when hungry
                        // Stronger gradient - prioritize food seeking over other movements
                        const baseGradientStrength = map(distance, 0, 500, 1.2, 0.3); // Increased base strength
                        // SYMBIONT ADVANTAGE: Move faster toward food (coordination bonus)
                        const symbiontSpeedBonus = org.isSymbiont ? 1.5 : 1.0;
                        const gradientStrength = baseGradientStrength * hungerFactor * symbiontSpeedBonus;
                    
                    if (distance > 0) {
                        // Apply STRONG direct movement toward food
                        const normalizedDx = dx / distance;
                        const normalizedDy = dy / distance;
                        
                        // Strongly prioritize movement toward food (80% food-seeking, 20% existing velocity)
                        // This ensures organisms actively move toward food
                        org.vx = org.vx * 0.2 + normalizedDx * gradientStrength * 0.8;
                        org.vy = org.vy * 0.2 + normalizedDy * gradientStrength * 0.8;
                        
                        // Also directly add to position for immediate movement (small direct step)
                        const directStep = 0.5 * hungerFactor; // Direct position update
                        org.x += normalizedDx * directStep;
                        org.y += normalizedDy * directStep;
                    }
                    
                    // Eat food if physically touching
                    const orgCollisionSize = org.size + (org.complexity * 0.3);
                    const foodCollisionSize = nearestFood.collisionRadius;
                    const collisionDistance = orgCollisionSize + foodCollisionSize;
                    
                    if (minDistance < collisionDistance) {
                        this.eatFood(org, nearestFood);
                    }
                }
            }
        }
        
        // Organisms use gradient descent to find and eat less complex organisms
        for (let i = 0; i < this.organisms.length; i++) {
            const org1 = this.organisms[i];
            
            // Find nearest less complex organism
            let nearestPrey = null;
            let minPreyDistance = Infinity;
            let maxComplexityDiff = 0;
            
            for (let j = 0; j < this.organisms.length; j++) {
                if (i === j) continue;
                const org2 = this.organisms[j];
                const complexityDiff = org1.complexity - org2.complexity;
                
                // Only consider organisms that are less complex
                if (complexityDiff > 4) {
                    const d = dist(org1.x, org1.y, org2.x, org2.y);
                    
                    // Prefer closer prey with larger complexity gap
                    if (d < 400 && (nearestPrey === null || d < minPreyDistance || complexityDiff > maxComplexityDiff)) {
                        nearestPrey = org2;
                        minPreyDistance = d;
                        maxComplexityDiff = complexityDiff;
                    }
                }
            }
            
            // Gradient descent toward nearest prey
            if (nearestPrey && minPreyDistance > 0) {
                const dx = nearestPrey.x - org1.x;
                const dy = nearestPrey.y - org1.y;
                const distance = sqrt(dx * dx + dy * dy);
                
                // Strength increases with hunger and complexity gap
                const hungerFactor = map(org1.hunger, 0, 100, 1.5, 0.5);
                const complexityFactor = map(maxComplexityDiff, 4, 30, 0.5, 1.5);
                const gradientStrength = map(distance, 0, 400, 0.3, 0.05) * hungerFactor * complexityFactor;
                
                if (distance > 0) {
                    org1.vx += (dx / distance) * gradientStrength;
                    org1.vy += (dy / distance) * gradientStrength;
                }
                
                // PHAGOCYTOSIS: Start engulfment process if physically touching
                if (minPreyDistance < org1.size + nearestPrey.size + 5) {
                    const predationChance = map(maxComplexityDiff, 4, 30, 0.2, 0.6) * org1.behaviorState.aggressiveness;
                    
                    // If not already engulfing, start phagocytosis
                    if (!org1.isEngulfing && !nearestPrey.isBeingEngulfed && random() < predationChance) {
                        org1.isEngulfing = true;
                        org1.engulfTarget = nearestPrey;
                        org1.engulfProgress = 0;
                        org1.engulfTimer = 0;
                        
                        nearestPrey.isBeingEngulfed = true;
                        nearestPrey.engulfProgress = 0;
                        
                        // Slow down prey when being engulfed
                        nearestPrey.vx *= 0.5;
                        nearestPrey.vy *= 0.5;
                    }
                }
            }
        }
        
        // Find two most complex organisms for special interactions
        // NOTE: Flags are already set above, but we need the references for other logic
        const { mostComplex, secondMostComplex } = this.getTwoMostComplexOrganisms();
        
        // Flags already set above, but verify and check for explosions
        for (let org of this.organisms) {
            // Verify flags match (they should already be set)
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
        
        // Symbiogenesis: Check for symbiotic relationship formation
        this.checkSymbiogenesis();
        
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
        
        // AUTOPOIESIS: Regulated natural selection - maintains system homeostasis
        const populationPressure = this.organisms.length / this.autopoiesisState.targetPopulation;
        const foodPressure = this.food.length / max(1, this.organisms.length * 0.5);
        
        // Natural selection - organisms in low fitness areas have higher death rate
        // Also check for lifespan expiration and starvation
        for (let i = this.organisms.length - 1; i >= 0; i--) {
            const org = this.organisms[i];
            let organismDied = false;
            let deathX = org.x;
            let deathY = org.y;
            
            // AUTOPOIESIS: Adjust starvation threshold based on food availability
            const adaptiveStarvationThreshold = org.starvationThreshold * 
                (foodPressure < 0.5 ? 1.5 : (foodPressure > 1.5 ? 0.7 : 1.0)); // Longer threshold if food scarce
            
            // Check for starvation - die if haven't eaten for too long
            if (org.lastFoodEaten >= adaptiveStarvationThreshold && this.organisms.length > 1) {
                org.stopSound(); // Stop sound before removal
                this.organisms.splice(i, 1);
                this.deadCount++; // Count starvation as death
                organismDied = true;
            }
            // AUTOPOIESIS: Lifespan expiration regulated by population pressure
            // Higher population = shorter effective lifespan (density-dependent regulation)
            const effectiveLifespan = org.lifespan * (populationPressure > 1.5 ? 0.8 : 1.0);
            if (org.age >= effectiveLifespan && this.organisms.length > 30) {
                org.stopSound(); // Stop sound before removal
                this.organisms.splice(i, 1);
                this.deadCount++; // Only count lifespan expiration as "dead"
                organismDied = true;
            }
            else {
                const fitness = this.getFitness(org.x, org.y);
                
                // AUTOPOIESIS: Death chance regulated by population and food pressure
                // Higher population pressure = higher death rate (homeostasis)
                const baseDeathChance = map(fitness, 0, 2, 0.0005, 0.0001);
                const pressureMultiplier = populationPressure > 1.2 ? 1.5 : (populationPressure < 0.8 ? 0.7 : 1.0);
                const deathChance = baseDeathChance * pressureMultiplier;
                
                if (random() < deathChance && this.organisms.length > 30) {
                    org.stopSound(); // Stop sound before removal
                    this.organisms.splice(i, 1);
                    organismDied = true;
                    // Not counted as "dead" - this is natural selection, different from lifespan expiration
                }
            }
            
            // Dead organisms become food
            if (organismDied) {
                // Spawn 1-3 food items at the death location
                const numFood = floor(random(1, 4));
                for (let f = 0; f < numFood; f++) {
                    // Spread food slightly around death location
                    const angle = random(TWO_PI);
                    const spread = random(5, 20);
                    const foodX = constrain(deathX + cos(angle) * spread, 50, width - 50);
                    const foodY = constrain(deathY + sin(angle) * spread, 50, height - 50);
                    this.food.push(new Food(foodX, foodY));
                    this.foodProducedCount++;
                }
                continue;
            }
        }
        
        // Update all organisms (food-seeking happens before organism's own movement)
        for (let org of this.organisms) {
            org.update();
        }
        
        // Clean up sounds for organisms that no longer exist or lost symbiont status
        for (let org of this.organisms) {
            // Stop cross-modulation if symbiont relationship ended
            if (!org.isSymbiont && org.symbiontCrossModulator) {
                try {
                    org.symbiontCrossModulator.stop();
                    org.symbiontCrossModulator = null;
                } catch (e) {}
            }
            
            // Stop super organism sound if no longer in super organism
            if (!org.isInSuperOrganism && org.superOrganismGroup) {
                if (org.superOrganismGroup.superOrganismOscillator) {
                    try {
                        org.superOrganismGroup.superOrganismOscillator.stop();
                        org.superOrganismGroup.superOrganismOscillator = null;
                        org.superOrganismGroup.superOrganismGain = null;
                        org.superOrganismGroup.superOrganismModulator = null;
                    } catch (e) {}
                }
                org.superOrganismGroup = null;
            }
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
    
    drawClusters() {
        // Identify and visualize clusters of organisms - make clusters more obvious
        const clusterRadius = 120; // Distance threshold for cluster membership
        const minClusterSize = 3; // Minimum organisms to form a visible cluster
        
        // Find clusters
        const processed = new Set();
        const clusters = [];
        
        for (let i = 0; i < this.organisms.length; i++) {
            if (processed.has(i)) continue;
            
            const org = this.organisms[i];
            const cluster = [org];
            processed.add(i);
            
            // Find all organisms in this cluster
            let foundMore = true;
            while (foundMore) {
                foundMore = false;
                for (let j = 0; j < this.organisms.length; j++) {
                    if (processed.has(j)) continue;
                    
                    const otherOrg = this.organisms[j];
                    // Check if any organism in cluster is close to this one
                    for (let clusterOrg of cluster) {
                        const d = dist(clusterOrg.x, clusterOrg.y, otherOrg.x, otherOrg.y);
                        if (d < clusterRadius) {
                            cluster.push(otherOrg);
                            processed.add(j);
                            foundMore = true;
                            break;
                        }
                    }
                }
            }
            
            if (cluster.length >= minClusterSize) {
                clusters.push(cluster);
                // CLUSTER SOUND: Additive synthesis - combine all sounds
                if (typeof this.setupClusterSound === 'function') {
                    this.setupClusterSound(cluster);
                }
            }
        }
        
        // Draw cluster indicators - make clusters obvious
        for (let cluster of clusters) {
            // Calculate cluster center and bounds
            let centerX = 0, centerY = 0;
            let maxDist = 0;
            
            for (let org of cluster) {
                centerX += org.x;
                centerY += org.y;
            }
            centerX /= cluster.length;
            centerY /= cluster.length;
            
            // Find maximum distance from center
            for (let org of cluster) {
                const d = dist(org.x, org.y, centerX, centerY);
                maxDist = max(maxDist, d);
            }
            
            // Draw organic cluster boundary - fluid membrane wrapping around organisms
            push();
            noFill();
            const clusterPalette = getCurrentPalette();
            const clusterBoundaryColor = colorPaletteMode === 0 ? [150, 150, 150] : clusterPalette[2];
            stroke(clusterBoundaryColor[0], clusterBoundaryColor[1], clusterBoundaryColor[2], 120);
            strokeWeight(4);
            
            // Generate unpredictable pseudopods (more variation)
            const clusterId = cluster[0].id;
            const numClusterPseudopods = floor(map(clusterId % 100, 0, 100, 4, 10)); // More pseudopods: 4-9
            const clusterPseudopods = [];
            for (let p = 0; p < numClusterPseudopods; p++) {
                const seed = (clusterId * 1000 + p * 100) % 10000;
                clusterPseudopods.push({
                    angle: map(seed % 628, 0, 628, 0, TWO_PI),
                    length: map((seed * 7) % 1000, 0, 1000, maxDist * 0.3, maxDist * 0.7), // Longer pseudopods
                    width: map((seed * 11) % 1000, 0, 1000, maxDist * 0.15, maxDist * 0.35), // Wider base
                    phase: map((seed * 13) % 628, 0, 628, 0, TWO_PI),
                    speed: map((seed * 17) % 1000, 0, 1000, 0.008, 0.025), // Variable speed
                    intensity: map((seed * 19) % 1000, 0, 1000, 0.5, 1.2) // Variable intensity
                });
            }
            
            // Draw organic membrane wrapping around cluster organisms
            beginShape();
            const numPoints = 140; // More points for smoother, more organic curves
            
            for (let i = 0; i <= numPoints; i++) {
                const t = i / numPoints;
                const angle = TWO_PI * t;
                
                // FLUID APPROACH: Wrap around nearest organism, not center
                // Find nearest organism to this angle
                let nearestOrg = cluster[0];
                let minDistToOrg = Infinity;
                const testX = centerX + cos(angle) * (maxDist + 30);
                const testY = centerY + sin(angle) * (maxDist + 30);
                
                for (let org of cluster) {
                    const d = dist(testX, testY, org.x, org.y);
                    if (d < minDistToOrg) {
                        minDistToOrg = d;
                        nearestOrg = org;
                    }
                }
                
                // Start wrapping around nearest organism
                const orgSize = nearestOrg.size + nearestOrg.complexity * 0.8;
                const baseRadius = orgSize + 20;
                
                // Multiple noise layers for highly organic variation
                const noise1 = noise(
                    nearestOrg.x * 0.01 + cos(angle) * 0.5 + frameCount * 0.003,
                    nearestOrg.y * 0.01 + sin(angle) * 0.5 + frameCount * 0.003
                );
                const noise2 = noise(
                    nearestOrg.x * 0.015 + cos(angle) * 1.2 + frameCount * 0.005,
                    nearestOrg.y * 0.015 + sin(angle) * 1.2 + frameCount * 0.005
                );
                const noise3 = noise(
                    nearestOrg.x * 0.02 + cos(angle) * 2.5 + frameCount * 0.007,
                    nearestOrg.y * 0.02 + sin(angle) * 2.5 + frameCount * 0.007
                );
                const noise4 = noise(
                    nearestOrg.x * 0.008 + cos(angle) * 0.3 + frameCount * 0.002,
                    nearestOrg.y * 0.008 + sin(angle) * 0.3 + frameCount * 0.002
                );
                
                const combinedNoise = (noise1 * 0.4 + noise2 * 0.3 + noise3 * 0.2 + noise4 * 0.1);
                const radiusVariation = map(combinedNoise, 0, 1, 0.7, 1.4); // More extreme variation
                
                // Base position wrapping around nearest organism
                let x = nearestOrg.x + cos(angle) * baseRadius * radiusVariation;
                let y = nearestOrg.y + sin(angle) * baseRadius * radiusVariation;
                
                // FLUID BRIDGE: Pull toward all nearby organisms for organic connection
                let totalInfluence = 0;
                let weightedX = 0;
                let weightedY = 0;
                
                for (let org of cluster) {
                    const distToOrg = dist(x, y, org.x, org.y);
                    const influence = 1 / (distToOrg + 1);
                    totalInfluence += influence;
                    weightedX += org.x * influence;
                    weightedY += org.y * influence;
                }
                
                if (totalInfluence > 0.01) {
                    const targetX = weightedX / totalInfluence;
                    const targetY = weightedY / totalInfluence;
                    
                    // Calculate average distance to all organisms
                    let avgDist = 0;
                    for (let org of cluster) {
                        avgDist += dist(x, y, org.x, org.y);
                    }
                    avgDist /= cluster.length;
                    
                    // Pull strength based on distance (stronger when far)
                    const pullStrength = map(avgDist, maxDist * 1.2, maxDist * 2.5, 0.2, 0.6);
                    x = lerp(x, targetX, pullStrength);
                    y = lerp(y, targetY, pullStrength);
                }
                
                // Add unpredictable pseudopod extensions
                for (let pod of clusterPseudopods) {
                    const angleToPod = atan2(y - centerY, x - centerX);
                    const angleDiff = abs(angleToPod - pod.angle);
                    const normalizedDiff = min(angleDiff, TWO_PI - angleDiff) / PI;
                    
                    if (normalizedDiff < 0.35) { // Wider influence zone
                        const podInfluence = (1 - (normalizedDiff / 0.35)) * pod.intensity;
                        const podAnimation = sin(frameCount * pod.speed + pod.phase) * 0.5 + 0.5; // More variation
                        const extension = pod.length * podInfluence * podAnimation;
                        
                        // Extend in direction of pseudopod
                        const podDirX = cos(pod.angle);
                        const podDirY = sin(pod.angle);
                        x += podDirX * extension * podInfluence;
                        y += podDirY * extension * podInfluence;
                        
                        // Add width variation (wider at base, tapers)
                        const widthVar = cos(normalizedDiff * PI) * pod.width * podInfluence * 0.6;
                        const perpX = -podDirY;
                        const perpY = podDirX;
                        x += perpX * widthVar;
                        y += perpY * widthVar;
                    }
                }
                
                // Ensure membrane stays reasonably close to cluster
                const avgDistToCluster = dist(x, y, centerX, centerY);
                if (avgDistToCluster > maxDist * 2.2) {
                    // Pull back if too far
                    x = lerp(x, centerX, 0.3);
                    y = lerp(y, centerY, 0.3);
                }
                
                // Add organic wave motion for fluid feel
                const waveDistortion = sin(angle * 4 + frameCount * 0.05) * 3;
                x += cos(angle + HALF_PI) * waveDistortion;
                y += sin(angle + HALF_PI) * waveDistortion;
                
                // Add small random perturbations for unpredictability
                const perturbation = map(noise4, 0, 1, -5, 5);
                x += cos(angle + PI/4) * perturbation;
                y += sin(angle + PI/4) * perturbation;
                
                vertex(x, y);
            }
            endShape(CLOSE);
            
            // Draw organic cluster center glow (irregular, not circular)
            fill(clusterBoundaryColor[0], clusterBoundaryColor[1], clusterBoundaryColor[2], 50);
            noStroke();
            beginShape();
            const glowPoints = 50;
            for (let i = 0; i <= glowPoints; i++) {
                const glowAngle = (TWO_PI / glowPoints) * i;
                const glowNoise = noise(
                    cos(glowAngle) * 0.6 + centerX * 0.01 + frameCount * 0.001,
                    sin(glowAngle) * 0.6 + centerY * 0.01 + frameCount * 0.001
                );
                const glowRadius = maxDist * 1.2 * map(glowNoise, 0, 1, 0.85, 1.15);
                const gx = centerX + cos(glowAngle) * glowRadius;
                const gy = centerY + sin(glowAngle) * glowRadius;
                vertex(gx, gy);
            }
            endShape(CLOSE);
            
            // Draw connections between cluster members - show network
            stroke(clusterBoundaryColor[0], clusterBoundaryColor[1], clusterBoundaryColor[2], 60);
            strokeWeight(1);
            for (let i = 0; i < cluster.length; i++) {
                for (let j = i + 1; j < cluster.length; j++) {
                    const clusterDist = dist(cluster[i].x, cluster[i].y, cluster[j].x, cluster[j].y);
                    if (clusterDist < clusterRadius) {
                        line(cluster[i].x, cluster[i].y, cluster[j].x, cluster[j].y);
                    }
                }
            }
            
            pop();
        }
    }
    
    drawRelationshipNetwork() {
        // Draw visual network showing relationships and progressive formation
        // 1. Show potential symbiont connections (organisms approaching symbiosis)
        // 2. Show cluster relationships
        // 3. Show symbiont pairs
        // 4. Show super organism connections
        
        push();
        
        // Draw potential symbiont connections (symbiosis forming)
        for (let i = 0; i < this.organisms.length; i++) {
            for (let j = i + 1; j < this.organisms.length; j++) {
                const org1 = this.organisms[i];
                const org2 = this.organisms[j];
                
                // Skip if already symbionts
                if (org1.isSymbiont && org1.symbiontPartner === org2) continue;
                if (org2.isSymbiont && org2.symbiontPartner === org1) continue;
                
                const d = dist(org1.x, org1.y, org2.x, org2.y);
                
                // Show potential symbionts (close and compatible)
                if (d < 200) {
                    const genotypeCompat = org1.getGenotypeCompatibility(org2);
                    const codeComplementarity = this.checkCodeComplementarity(org1, org2);
                    const compatibilityScore = (genotypeCompat * 0.7) + (codeComplementarity * 0.3);
                    
                    // Draw connection if compatibility is building
                    if (compatibilityScore > 0.2) {
                        const alpha = map(compatibilityScore, 0.2, 0.4, 30, 100);
                        const lineGray = map(compatibilityScore, 0.2, 0.4, 180, 160);
                        
                        // Dashed line for potential symbionts
                        stroke(lineGray, alpha);
                        strokeWeight(1);
                        drawingContext.setLineDash([5, 5]);
                        line(org1.x, org1.y, org2.x, org2.y);
                        drawingContext.setLineDash([]);
                    }
                }
            }
        }
        
        // Draw super organism internal connections (between symbionts in super organism)
        for (let org of this.organisms) {
            if (org.isInSuperOrganism && org.superOrganismGroup) {
                for (let otherOrg of org.superOrganismGroup) {
                    if (otherOrg !== org && otherOrg !== org.symbiontPartner) {
                        const d = dist(org.x, org.y, otherOrg.x, otherOrg.y);
                        if (d < 300) {
                            // Connection within super organism
                            stroke(100, 80);
                            strokeWeight(2);
                            line(org.x, org.y, otherOrg.x, otherOrg.y);
                        }
                    }
                }
            }
        }
        
        pop();
    }
    
    drawSuperOrganisms() {
        // Detect SUPER ORGANISMS - clusters of multiple symbionts with compatible genotypes
        // Guard clause - ensure function exists
        if (typeof this.setupSuperOrganismSound !== 'function') {
            return;
        }
        
        const superOrganismRadius = 200; // Distance threshold for super organism
        const minSymbionts = 2; // Minimum symbiont pairs to form super organism
        const genotypeCompatibilityThreshold = 0.5; // Genotype compatibility threshold
        
        // Find all symbionts
        const symbionts = [];
        for (let org of this.organisms) {
            if (org.isSymbiont && org.symbiontPartner) {
                symbionts.push(org);
            }
        }
        
        if (symbionts.length < minSymbionts * 2) {
            // Clear super organism status if not enough symbionts
            for (let org of this.organisms) {
                org.isInSuperOrganism = false;
                org.superOrganismGroup = null;
            }
            return;
        }
        
        // Find clusters of symbionts with compatible genotypes
        const processed = new Set();
        const superOrganisms = [];
        
        // Clear previous super organism assignments
        for (let org of this.organisms) {
            org.isInSuperOrganism = false;
            org.superOrganismGroup = null;
        }
        
        for (let i = 0; i < symbionts.length; i++) {
            if (processed.has(i)) continue;
            
            const org = symbionts[i];
            const superOrg = [org, org.symbiontPartner];
            processed.add(i);
            
            // Find all symbionts in this super organism cluster (based on genotype compatibility)
            let foundMore = true;
            while (foundMore) {
                foundMore = false;
                for (let j = 0; j < symbionts.length; j++) {
                    if (processed.has(j)) continue;
                    
                    const otherOrg = symbionts[j];
                    // Check proximity AND genotype compatibility
                    for (let superOrgMember of superOrg) {
                        const d = dist(superOrgMember.x, superOrgMember.y, otherOrg.x, otherOrg.y);
                        const genotypeCompat = superOrgMember.getGenotypeCompatibility(otherOrg);
                        
                        if (d < superOrganismRadius && genotypeCompat >= genotypeCompatibilityThreshold) {
                            superOrg.push(otherOrg);
                            superOrg.push(otherOrg.symbiontPartner);
                            processed.add(j);
                            foundMore = true;
                            break;
                        }
                    }
                }
            }
            
            // Count unique symbiont pairs
            const uniquePairs = new Set();
            for (let member of superOrg) {
                if (member.isSymbiont && member.symbiontPartner) {
                    const pairId = `${min(member.id, member.symbiontPartner.id)}-${max(member.id, member.symbiontPartner.id)}`;
                    uniquePairs.add(pairId);
                }
            }
            
            if (uniquePairs.size >= minSymbionts) {
                superOrganisms.push(superOrg);
                
                // Mark all members as part of super organism
                for (let member of superOrg) {
                    member.isInSuperOrganism = true;
                    member.superOrganismGroup = superOrg;
                    
                    // Initialize collective memory if empty
                    if (member.collectiveMemory.length === 0) {
                        // Share code execution results as collective memory
                        for (let otherMember of superOrg) {
                            if (otherMember.lastExecutionResult.memoryPattern) {
                                member.collectiveMemory.push(...otherMember.lastExecutionResult.memoryPattern);
                            }
                        }
                        // Limit collective memory size
                        if (member.collectiveMemory.length > 20) {
                            member.collectiveMemory = member.collectiveMemory.slice(-20);
                        }
                    }
                }
                
                // SUPER ORGANISM SOUND: Unified sound from collective genotype
                try {
                    if (this.setupSuperOrganismSound && typeof this.setupSuperOrganismSound === 'function') {
                        this.setupSuperOrganismSound(superOrg);
                    }
                } catch (e) {
                    console.log('Error setting up super organism sound:', e);
                }
            }
        }
        
        // Draw super organism membranes - GREEN color (different from internal blue)
        for (let superOrg of superOrganisms) {
            // Calculate super organism center and bounds
            let centerX = 0, centerY = 0;
            let maxDist = 0;
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            
            for (let org of superOrg) {
                centerX += org.x;
                centerY += org.y;
                minX = min(minX, org.x);
                maxX = max(maxX, org.x);
                minY = min(minY, org.y);
                maxY = max(maxY, org.y);
            }
            centerX /= superOrg.length;
            centerY /= superOrg.length;
            
            // Find maximum distance from center
            for (let org of superOrg) {
                const d = dist(org.x, org.y, centerX, centerY);
                maxDist = max(maxDist, d);
            }
            
            // MARKOV BLANKET: Super organism membrane as boundary condition
            // A Markov blanket separates internal states (organisms inside) from external states (environment)
            // It defines conditional independence: internal states are independent of external states given the blanket
            // This membrane implements the Free Energy Principle's boundary - organisms minimize free energy across it
            push();
            noFill();
            
            // Calculate average genotype signature for membrane appearance
            let avgSignature = 0;
            let avgStructure = 0;
            for (let org of superOrg) {
                if (org.genotype) {
                    avgSignature += org.genotype.signature;
                    avgStructure += org.genotype.structurePattern;
                }
            }
            avgSignature /= superOrg.length;
            avgStructure /= superOrg.length;
            
            // Membrane color reflects genotype - uses palette
            const palette = getCurrentPalette();
            const paletteIndex = floor(map(avgSignature, 0, 1, 0, palette.length - 1));
            const membraneColor = palette[paletteIndex];
            const membraneAlpha = map(avgStructure, 0, 1, 150, 220);
            stroke(membraneColor[0], membraneColor[1], membraneColor[2], membraneAlpha);
            strokeWeight(5); // Thicker and more visible
            
            // Draw amoeba-like irregular membrane with pseudopods
            // Generate pseudopod positions (seeded random for stability)
            // Use super organism signature for consistent pseudopod generation
            const superOrgId = superOrg[0].id; // Use first organism's ID as seed
            const numPseudopods = floor(map(superOrgId % 100, 0, 100, 3, 8)); // 3-7 pseudopods based on ID
            const pseudopods = [];
            for (let p = 0; p < numPseudopods; p++) {
                // Seeded random using superOrgId and pseudopod index
                const seed = (superOrgId * 1000 + p * 100) % 10000;
                const podAngle = map(seed % 628, 0, 628, 0, TWO_PI); // 628 ≈ 2π * 100
                const podLength = map((seed * 7) % 1000, 0, 1000, maxDist * 0.15, maxDist * 0.35);
                const podWidth = map((seed * 11) % 1000, 0, 1000, maxDist * 0.08, maxDist * 0.18);
                pseudopods.push({
                    angle: podAngle,
                    length: podLength,
                    width: podWidth,
                    phase: map((seed * 13) % 628, 0, 628, 0, TWO_PI) // For animation
                });
            }
            
            beginShape();
            const numPoints = 120; // More points for smoother pseudopods
            
            for (let i = 0; i <= numPoints; i++) {
                const angle = (TWO_PI / numPoints) * i;
                
                // Multiple layers of noise for organic, irregular deformation
                const noise1 = noise(
                    cos(angle) * 0.5 + centerX * 0.01 + frameCount * 0.001,
                    sin(angle) * 0.5 + centerY * 0.01 + frameCount * 0.001
                );
                const noise2 = noise(
                    cos(angle) * 1.2 + centerX * 0.015 + frameCount * 0.002,
                    sin(angle) * 1.2 + centerY * 0.015 + frameCount * 0.002
                );
                const noise3 = noise(
                    cos(angle) * 2.5 + centerX * 0.02 + frameCount * 0.003,
                    sin(angle) * 2.5 + centerY * 0.02 + frameCount * 0.003
                );
                
                // Combine noise layers for more complex variation
                const combinedNoise = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2);
                // More extreme radius variation for amoeba-like irregularity
                const radiusVariation = map(combinedNoise, 0, 1, 0.7, 1.3);
                
                // Base radius with more variation
                const baseR = (maxDist + 30) * radiusVariation;
                let x = centerX + cos(angle) * baseR;
                let y = centerY + sin(angle) * baseR;
                
                // Check for pseudopod influence - create extensions
                for (let pod of pseudopods) {
                    const angleDiff = abs(angle - pod.angle);
                    const normalizedAngleDiff = min(angleDiff, TWO_PI - angleDiff) / PI; // 0-1
                    
                    // If we're near a pseudopod angle, extend outward
                    if (normalizedAngleDiff < 0.3) {
                        const podInfluence = 1 - (normalizedAngleDiff / 0.3); // 1 at center, 0 at edge
                        const podExtension = pod.length * podInfluence;
                        
                        // Animate pseudopod (slow extension/retraction)
                        const podAnimation = sin(frameCount * 0.01 + pod.phase) * 0.3 + 0.7;
                        const animatedExtension = podExtension * podAnimation;
                        
                        // Extend in direction of pseudopod
                        x += cos(pod.angle) * animatedExtension * podInfluence;
                        y += sin(pod.angle) * animatedExtension * podInfluence;
                        
                        // Add width variation (pseudopod is wider at base)
                        const widthVariation = cos(normalizedAngleDiff * PI) * pod.width * podInfluence;
                        x += cos(angle + HALF_PI) * widthVariation;
                        y += sin(angle + HALF_PI) * widthVariation;
                    }
                }
                
                // Pull membrane toward nearest organisms (convex hull-like behavior)
                let minDistToOrg = Infinity;
                let closestOrg = null;
                let secondClosestOrg = null;
                let secondMinDist = Infinity;
                
                for (let org of superOrg) {
                    const d = dist(x, y, org.x, org.y);
                    if (d < minDistToOrg) {
                        secondMinDist = minDistToOrg;
                        secondClosestOrg = closestOrg;
                        minDistToOrg = d;
                        closestOrg = org;
                    } else if (d < secondMinDist) {
                        secondMinDist = d;
                        secondClosestOrg = org;
                    }
                }
                
                // Amoeba-like membrane behavior: pull toward organisms with varying strength
                if (closestOrg) {
                    const orgSize = closestOrg.size + closestOrg.complexity * 0.8;
                    const pullDistance = minDistToOrg - orgSize - 15; // Distance beyond organism
                    
                    if (pullDistance > 0) {
                        // Stronger pull when far, weaker when close (membrane-like)
                        const pullStrength = map(pullDistance, 0, maxDist * 0.5, 0.1, 0.6);
                        const pullAmount = pullStrength * 0.5;
                        
                        // Pull toward closest organism
                        const dx = closestOrg.x - x;
                        const dy = closestOrg.y - y;
                        const distToClosest = dist(x, y, closestOrg.x, closestOrg.y);
                        if (distToClosest > 0) {
                            x += (dx / distToClosest) * pullAmount * pullDistance;
                            y += (dy / distToClosest) * pullAmount * pullDistance;
                        }
                    }
                    
                    // Also consider second closest for more organic shape
                    if (secondClosestOrg && secondMinDist < maxDist * 0.8) {
                        const influence = map(secondMinDist, 0, maxDist * 0.8, 0.3, 0);
                        const dx2 = secondClosestOrg.x - x;
                        const dy2 = secondClosestOrg.y - y;
                        const distToSecond = dist(x, y, secondClosestOrg.x, secondClosestOrg.y);
                        if (distToSecond > 0) {
                            x += (dx2 / distToSecond) * influence * 10;
                            y += (dy2 / distToSecond) * influence * 10;
                        }
                    }
                }
                
                // Add small random perturbations for membrane-like irregularity
                const perturbation = map(noise3, 0, 1, -3, 3);
                x += cos(angle + PI/4) * perturbation;
                y += sin(angle + PI/4) * perturbation;
                
                vertex(x, y);
            }
            endShape(CLOSE);
            
            // Draw super organism center indicator - organic, irregular glow
            fill(membraneColor[0], membraneColor[1], membraneColor[2], 15);
            noStroke();
            
            // Draw irregular organic glow instead of perfect circle
            beginShape();
            const glowPoints = 40;
            for (let i = 0; i <= glowPoints; i++) {
                const angle = (TWO_PI / glowPoints) * i;
                const glowNoise = noise(
                    cos(angle) * 0.8 + centerX * 0.01 + frameCount * 0.001,
                    sin(angle) * 0.8 + centerY * 0.01 + frameCount * 0.001
                );
                const glowRadius = maxDist * 1.1 * map(glowNoise, 0, 1, 0.9, 1.1);
                const gx = centerX + cos(angle) * glowRadius;
                const gy = centerY + sin(angle) * glowRadius;
                vertex(gx, gy);
            }
            endShape(CLOSE);
            
            pop();
        }
    }
    
    getSuperOrganismCount() {
        // Count super organisms - clusters of multiple symbionts
        const superOrganismRadius = 200; // Distance threshold for super organism
        const minSymbionts = 2; // Minimum symbiont pairs to form super organism
        
        // Find all symbionts
        const symbionts = [];
        for (let org of this.organisms) {
            if (org.isSymbiont && org.symbiontPartner) {
                symbionts.push(org);
            }
        }
        
        if (symbionts.length < minSymbionts * 2) return 0; // Need at least 2 pairs
        
        // Find clusters of symbionts
        const processed = new Set();
        const superOrganisms = [];
        
        for (let i = 0; i < symbionts.length; i++) {
            if (processed.has(i)) continue;
            
            const org = symbionts[i];
            const superOrg = [org, org.symbiontPartner];
            processed.add(i);
            
            // Find all symbionts in this super organism cluster
            let foundMore = true;
            while (foundMore) {
                foundMore = false;
                for (let j = 0; j < symbionts.length; j++) {
                    if (processed.has(j)) continue;
                    
                    const otherOrg = symbionts[j];
                    // Check if any symbiont in super organism is close to this one
                    for (let superOrgMember of superOrg) {
                        const d = dist(superOrgMember.x, superOrgMember.y, otherOrg.x, otherOrg.y);
                        if (d < superOrganismRadius) {
                            superOrg.push(otherOrg);
                            superOrg.push(otherOrg.symbiontPartner);
                            processed.add(j);
                            foundMore = true;
                            break;
                        }
                    }
                }
            }
            
            // Count unique symbiont pairs
            const uniquePairs = new Set();
            for (let member of superOrg) {
                if (member.isSymbiont && member.symbiontPartner) {
                    const pairId = `${min(member.id, member.symbiontPartner.id)}-${max(member.id, member.symbiontPartner.id)}`;
                    uniquePairs.add(pairId);
                }
            }
            
            if (uniquePairs.size >= minSymbionts) {
                superOrganisms.push(superOrg);
            }
        }
        
        return superOrganisms.length;
    }

    draw() {
        // Draw fitness landscape background (subtle visualization)
        this.drawFitnessLandscape();
        
        // Draw food items
        for (let food of this.food) {
            food.draw();
        }
        
        // Find two most complex organisms first
        const { mostComplex, secondMostComplex } = this.getTwoMostComplexOrganisms();
        
        // Draw NETWORK: Show relationships and progressive formation
        this.drawRelationshipNetwork();
        
        // Draw cluster indicators - make clusters more obvious
        this.drawClusters();
        
        // Detect and draw SUPER ORGANISMS (clusters of multiple symbionts) - hierarchical level
        this.drawSuperOrganisms();
        
        // Draw symbiont connections and membranes (most prominent - drawn before other connections)
        const drawnPairs = new Set(); // Track which pairs we've already drawn to avoid duplicates
        
        for (let org of this.organisms) {
            if (org.isSymbiont && org.symbiontPartner) {
                const pairId = `${min(org.id, org.symbiontPartner.id)}-${max(org.id, org.symbiontPartner.id)}`;
                
                // Skip if we've already drawn this pair
                if (drawnPairs.has(pairId)) continue;
                drawnPairs.add(pairId);
                
                const partner = org.symbiontPartner;
                const d = dist(org.x, org.y, partner.x, partner.y);
                
                if (d < 500) { // Draw symbiont connections up to 500 pixels
                    push();
                    
                    // INTERNAL symbiont connection - GRAYSCALE based on genotype compatibility
                    const pulse = sin(frameCount * 0.15) * 0.4 + 0.6;
                    const genotypeCompat = org.getGenotypeCompatibility(partner);
                    const connectionGray = map(genotypeCompat, 0, 1, 120, 200);
                    const alpha = map(d, 0, 500, 200, 60) * pulse;
                    
                    // Internal connection - grayscale reflects genotype compatibility
                    stroke(connectionGray, alpha);
                    strokeWeight(map(d, 0, 500, 3, 1.5) * pulse);
                    line(org.x, org.y, partner.x, partner.y);
                    
                    // Outer glow for internal connection
                    stroke(connectionGray, alpha * 0.3);
                    strokeWeight(map(d, 0, 500, 5, 2.5) * pulse);
                    line(org.x, org.y, partner.x, partner.y);
                    
                    pop();
                    
                    // Draw elastic membrane around symbiont pair - ALWAYS VISIBLE
                    // Make sure membrane is drawn even if hasMembrane flag isn't set yet
                    const shouldDrawMembrane = org.hasMembrane || (org.isSymbiont && org.symbiontPartner);
                    if (shouldDrawMembrane && (org.membraneTimer > 0 || org.membraneTimer === -1 || org.isSymbiont)) {
                        push();
                        noFill();
                        
                        // ORGANIC AMOEBA-LIKE MEMBRANE: Draw fluid membrane that flows around both symbionts
                        // No geometric shapes - pure organic flow
                        
                        // Check if genotypes exist
                        if (!org.genotype || !partner.genotype) {
                            continue;
                        }
                        
                        const avgGenotype = (org.genotype.signature + partner.genotype.signature) / 2;
                        const palette = getCurrentPalette();
                        const paletteIndex = floor(map(avgGenotype, 0, 1, 0, palette.length - 1));
                        const membraneColor = palette[paletteIndex];
                        
                        // Persistent membrane alpha
                        let membraneAlpha = 180;
                        if (org.membraneTimer > 0 && org.membraneTimer !== -1) {
                            membraneAlpha = map(org.membraneTimer, 300, 0, 180, 0);
                        }
                        const finalAlpha = org.isSymbiont ? max(membraneAlpha, 160) : membraneAlpha;
                        
                        // Organism sizes
                        const orgSize = org.size + org.complexity * 0.8;
                        const partnerSize = partner.size + partner.complexity * 0.8;
                        const maxSize = max(orgSize, partnerSize);
                        
                        // Generate pseudopods (seeded for stability)
                        const symbiontId = org.id + partner.id;
                        const numPseudopods = floor(map(symbiontId % 100, 0, 100, 3, 7));
                        const pseudopods = [];
                        for (let p = 0; p < numPseudopods; p++) {
                            const seed = (symbiontId * 1000 + p * 100) % 10000;
                            pseudopods.push({
                                angle: map(seed % 628, 0, 628, 0, TWO_PI),
                                length: map((seed * 7) % 1000, 0, 1000, maxSize * 0.8, maxSize * 1.8),
                                width: map((seed * 11) % 1000, 0, 1000, maxSize * 0.4, maxSize * 0.9),
                                phase: map((seed * 13) % 628, 0, 628, 0, TWO_PI),
                                speed: map((seed * 17) % 1000, 0, 1000, 0.008, 0.02)
                            });
                        }
                        
                        // Draw organic membrane as flowing blob around both organisms
                        for (let layer = 0; layer < 2; layer++) {
                            const layerAlpha = finalAlpha * (1 - layer * 0.25);
                            const layerOffset = layer * 3;
                            
                            stroke(membraneColor[0], membraneColor[1], membraneColor[2], layerAlpha);
                            strokeWeight(4 - layer * 1.5);
                            
                            beginShape();
                            const numPoints = 120; // Many points for smooth organic flow
                            
                            for (let i = 0; i <= numPoints; i++) {
                                const t = i / numPoints; // 0 to 1
                                const angle = TWO_PI * t;
                                
                                // FLUID APPROACH: Calculate position based on wrapping around both organisms
                                // Instead of center-based, flow around each organism organically
                                
                                // Determine which organism this point is closer to
                                const testX = org.x + cos(angle) * (maxSize + 20);
                                const testY = org.y + sin(angle) * (maxSize + 20);
                                const distToOrg = dist(testX, testY, org.x, org.y);
                                const distToPartner = dist(testX, testY, partner.x, partner.y);
                                
                                // Start from wrapping around first organism
                                let baseX, baseY, baseRadius;
                                if (distToOrg < distToPartner) {
                                    // Wrapping around org
                                    baseX = org.x;
                                    baseY = org.y;
                                    baseRadius = orgSize + 15 + layerOffset;
                                } else {
                                    // Wrapping around partner
                                    baseX = partner.x;
                                    baseY = partner.y;
                                    baseRadius = partnerSize + 15 + layerOffset;
                                }
                                
                                // Multiple noise layers for organic deformation
                                const noise1 = noise(
                                    baseX * 0.01 + cos(angle) * 0.5 + frameCount * 0.003,
                                    baseY * 0.01 + sin(angle) * 0.5 + frameCount * 0.003
                                );
                                const noise2 = noise(
                                    baseX * 0.015 + cos(angle) * 1.2 + frameCount * 0.005,
                                    baseY * 0.015 + sin(angle) * 1.2 + frameCount * 0.005
                                );
                                const noise3 = noise(
                                    baseX * 0.02 + cos(angle) * 2.5 + frameCount * 0.007,
                                    baseY * 0.02 + sin(angle) * 2.5 + frameCount * 0.007
                                );
                                
                                const combinedNoise = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2);
                                const radiusVariation = map(combinedNoise, 0, 1, 0.75, 1.35);
                                
                                // Base position wrapping around organism
                                let x = baseX + cos(angle) * baseRadius * radiusVariation;
                                let y = baseY + sin(angle) * baseRadius * radiusVariation;
                                
                                // FLUID BRIDGE: Create organic connection between organisms
                                // Calculate influence from both organisms
                                const orgInfluence = 1 / (dist(x, y, org.x, org.y) + 1);
                                const partnerInfluence = 1 / (dist(x, y, partner.x, partner.y) + 1);
                                const totalInfluence = orgInfluence + partnerInfluence;
                                
                                // Pull toward both organisms to create fluid bridge
                                if (totalInfluence > 0.01) {
                                    const orgPull = orgInfluence / totalInfluence;
                                    const partnerPull = partnerInfluence / totalInfluence;
                                    
                                    // Smooth interpolation toward both organisms
                                    const targetX = org.x * orgPull + partner.x * partnerPull;
                                    const targetY = org.y * orgPull + partner.y * partnerPull;
                                    
                                    // Pull strength based on distance (stronger when far)
                                    const avgDist = (dist(x, y, org.x, org.y) + dist(x, y, partner.x, partner.y)) / 2;
                                    const pullStrength = map(avgDist, maxSize * 1.5, maxSize * 3, 0.3, 0.7);
                                    
                                    x = lerp(x, targetX, pullStrength);
                                    y = lerp(y, targetY, pullStrength);
                                }
                                
                                // Add pseudopod extensions (organic protrusions)
                                for (let pod of pseudopods) {
                                    const angleToPod = atan2(y - (org.y + partner.y) / 2, x - (org.x + partner.x) / 2);
                                    const angleDiff = abs(angleToPod - pod.angle);
                                    const normalizedDiff = min(angleDiff, TWO_PI - angleDiff) / PI;
                                    
                                    if (normalizedDiff < 0.3) {
                                        const podInfluence = 1 - (normalizedDiff / 0.3);
                                        const podAnimation = sin(frameCount * pod.speed + pod.phase) * 0.4 + 0.6;
                                        const extension = pod.length * podInfluence * podAnimation;
                                        
                                        // Extend in direction of pseudopod
                                        const podDirX = cos(pod.angle);
                                        const podDirY = sin(pod.angle);
                                        x += podDirX * extension * podInfluence;
                                        y += podDirY * extension * podInfluence;
                                        
                                        // Add width variation (wider at base)
                                        const widthVar = cos(normalizedDiff * PI) * pod.width * podInfluence * 0.5;
                                        const perpX = -podDirY;
                                        const perpY = podDirX;
                                        x += perpX * widthVar;
                                        y += perpY * widthVar;
                                    }
                                }
                                
                                // Ensure membrane stays close to organisms (but not too tight)
                                const minDistToEither = min(dist(x, y, org.x, org.y), dist(x, y, partner.x, partner.y));
                                if (minDistToEither > maxSize * 2.5) {
                                    // Pull back if too far
                                    const closestX = dist(x, y, org.x, org.y) < dist(x, y, partner.x, partner.y) ? org.x : partner.x;
                                    const closestY = dist(x, y, org.x, org.y) < dist(x, y, partner.x, partner.y) ? org.y : partner.y;
                                    x = lerp(x, closestX, 0.4);
                                    y = lerp(y, closestY, 0.4);
                                }
                                
                                // Add small random perturbations for fluid movement
                                const perturbation = map(noise3, 0, 1, -4, 4);
                                x += cos(angle + PI/3) * perturbation;
                                y += sin(angle + PI/3) * perturbation;
                                
                                // Add organic wave motion for fluid feel
                                const waveDistortion = sin(angle * 3 + frameCount * 0.04) * 2;
                                x += cos(angle + HALF_PI) * waveDistortion;
                                y += sin(angle + HALF_PI) * waveDistortion;
                                
                                vertex(x, y);
                            }
                            endShape(CLOSE);
                        }
                        
                        pop();
                    }
                }
            }
        }
        
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
let statsVisible = true; // Stats panel visibility toggle
let audioContext; // For sound generation
let colorPaletteMode = 1; // 0 = grayscale, 1 = original palette, 2 = new palette

// Make ecosystem globally accessible for sound management
if (typeof window !== 'undefined') {
    window.ecosystem = null; // Will be set when ecosystem is created
}

// Global function to get current palette
function getCurrentPalette() {
    if (colorPaletteMode === 0) {
        // Grayscale - return grayscale values (not used directly, handled in getColorFromPalette)
        return [[128, 128, 128]];
    } else if (colorPaletteMode === 1) {
        // Original palette: ["32cbff","00a5e0","89a1ef","ef9cda","fecef1"]
        return [
            [50, 203, 255],   // "32cbff" - cyan/blue
            [0, 165, 224],    // "00a5e0" - darker blue
            [137, 161, 239],  // "89a1ef" - light purple/blue
            [239, 156, 218],  // "ef9cda" - pink
            [254, 206, 241]   // "fecef1" - light pink
        ];
    } else {
        // New palette: ["4c061d","d17a22","b4c292","736f4e","3b3923"]
        return [
            [76, 6, 29],      // "4c061d" - dark red/brown
            [209, 122, 34],   // "d17a22" - orange
            [180, 194, 146],  // "b4c292" - sage green
            [115, 111, 78],   // "736f4e" - olive/brown
            [59, 57, 35]      // "3b3923" - dark olive
        ];
    }
}
let statsDisplay = {
    x: 0, // Will be set in setup based on window width
    y: 0, // Will be set in setup based on window height
    w: 280,
    h: 565 // Height increased to accommodate Free Energy Principle indicators: 42 (title/status) + 20*20 (20 stat lines) + 28 (gap) + 30 (graph) + 5 (bottom padding) = 565
};

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvasContainer');
    
    colorMode(RGB, 255, 255, 255);
    ecosystem = new BFFEcosystem(1); // Start with ONE increasingly complex organism
    ecosystem.isRunning = true;
    
    // Make ecosystem globally accessible for sound management
    if (typeof window !== 'undefined') {
        window.ecosystem = ecosystem;
    }
    
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
    
    // Ensure audio context stays active (browsers suspend it after inactivity)
    if (audioContext && soundEnabled && audioContext.state === 'suspended') {
        audioContext.resume().catch(e => {
            // Silently fail - audio might not be available
        });
    }
    
    // Clean white background
    background(255);
    
    // Update ecosystem
    if (!isPaused) {
        ecosystem.update();
    }
    
    // Draw ecosystem
    ecosystem.draw();
    
    // Draw stats overlay (only if visible)
    if (statsVisible) {
        drawStats();
    }
    
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
    
    // Sound indicator - show only ON/OFF label
    const soundY = statsDisplay.y + 22;
    const soundX = statsDisplay.x + statsDisplay.w - 25;
    
    // Sound text label - keep same textStyle as title (BOLD)
    fill(soundEnabled ? 30 : 150);
    textSize(13);
    textStyle(BOLD); // Keep same style as title
    textAlign(RIGHT);
    text(soundEnabled ? 'ON' : 'OFF', soundX, soundY);
    
    textAlign(LEFT); // Reset text alignment
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
    currentY += lineSpacing;
    text(`Food Eaten: ${ecosystem.foodEatenCount}`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    text(`Food Produced: ${ecosystem.foodProducedCount}`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    
    // AUTOPOIESIS: Display system health and regulation metrics
    const healthPercent = floor(ecosystem.autopoiesisState.systemHealth * 100);
    const healthColor = map(ecosystem.autopoiesisState.systemHealth, 0, 1, 150, 30);
    fill(healthColor);
    textStyle(BOLD);
    text(`System Health: ${healthPercent}%`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    
    textStyle(NORMAL);
    fill(60);
    text(`Target Population: ${floor(ecosystem.autopoiesisState.targetPopulation)}`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    
    // Count current symbionts (organisms currently in symbiont relationships)
    let currentSymbionts = 0;
    for (let org of ecosystem.organisms) {
        if (org.isSymbiont && org.symbiontPartner) {
            currentSymbionts++;
        }
    }
    // Divide by 2 since each symbiont pair counts as 2 organisms
    currentSymbionts = Math.floor(currentSymbionts / 2);
    
    // Make symbionts count more obvious - bold and highlighted (grayscale)
    textStyle(BOLD);
    fill(100); // Dark gray for symbionts
    textSize(12); // Slightly larger
    text(`Symbionts: ${currentSymbionts}`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    
    // Count super organisms (clusters of multiple symbionts)
    const superOrganismCount = ecosystem.getSuperOrganismCount();
    textStyle(BOLD);
    fill(80); // Darker gray for super organisms
    textSize(12);
    text(`Super Organisms: ${superOrganismCount}`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    
    // Also show total symbiogenesis events (smaller, less prominent)
    textStyle(NORMAL);
    fill(60); // Regular gray
    textSize(11); // Back to normal size
    text(`Symbiogenesis Events: ${ecosystem.symbiogenesisCount}`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    text(`Self-Replications: ${ecosystem.selfReplicationCount}`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    
    // COLOR PALETTE INDICATOR
    textStyle(BOLD);
    fill(80);
    text('COLOR PALETTE', statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    
    textStyle(NORMAL);
    const paletteNames = ['Grayscale', 'Original (Cyan/Pink)', 'New (Earth Tones)'];
    fill(60);
    text(`Mode: ${paletteNames[colorPaletteMode]}`, statsDisplay.x + 12, currentY);
    text('Press C to cycle', statsDisplay.x + 12, currentY + lineSpacing);
    currentY += lineSpacing * 2;
    
    // FREE ENERGY PRINCIPLE INDICATORS
    textStyle(BOLD);
    fill(80); // Slightly darker for section header
    text('FREE ENERGY PRINCIPLE', statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    
    textStyle(NORMAL);
    fill(60);
    
    // Calculate average free energy across all organisms
    let totalFreeEnergy = 0;
    let totalPredictionError = 0;
    let totalFrequencyError = 0;
    let totalVolumeError = 0;
    let organismsWithFreeEnergy = 0;
    
    for (let org of ecosystem.organisms) {
        if (org.freeEnergy !== undefined) {
            totalFreeEnergy += org.freeEnergy;
            totalPredictionError += org.predictionError.totalError || 0;
            totalFrequencyError += org.predictionError.frequencyError || 0;
            totalVolumeError += org.predictionError.volumeError || 0;
            organismsWithFreeEnergy++;
        }
    }
    
    const avgFreeEnergy = organismsWithFreeEnergy > 0 ? totalFreeEnergy / organismsWithFreeEnergy : 0;
    const avgPredictionError = organismsWithFreeEnergy > 0 ? totalPredictionError / organismsWithFreeEnergy : 0;
    const avgFrequencyError = organismsWithFreeEnergy > 0 ? totalFrequencyError / organismsWithFreeEnergy : 0;
    const avgVolumeError = organismsWithFreeEnergy > 0 ? totalVolumeError / organismsWithFreeEnergy : 0;
    
    // Display average free energy with color coding and visual bar
    const freeEnergyColor = map(avgFreeEnergy, 0, 100, 30, 200);
    fill(freeEnergyColor);
    text(`Avg Free Energy: ${avgFreeEnergy.toFixed(1)}`, statsDisplay.x + 12, currentY);
    
    // Visual free energy bar
    const barWidth = statsDisplay.w - 48;
    const barHeight = 4;
    const barX = statsDisplay.x + 12;
    const barY = currentY + 8;
    
    // Background bar (gray)
    fill(220);
    noStroke();
    rect(barX, barY, barWidth, barHeight);
    
    // Free energy bar (color coded: green = low, red = high)
    const freeEnergyPercent = constrain(avgFreeEnergy / 100, 0, 1);
    const barColorR = map(freeEnergyPercent, 0, 1, 50, 200);
    const barColorG = map(freeEnergyPercent, 0, 1, 200, 50);
    const barColorB = map(freeEnergyPercent, 0, 1, 50, 50);
    fill(barColorR, barColorG, barColorB);
    rect(barX, barY, barWidth * freeEnergyPercent, barHeight);
    
    currentY += lineSpacing + 4; // Extra spacing for bar
    
    // Display average prediction error
    fill(60);
    text(`Avg Prediction Error: ${avgPredictionError.toFixed(1)}`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    
    // Display sound prediction errors (if organisms are playing sound)
    if (avgFrequencyError > 0 || avgVolumeError > 0) {
        text(`Sound Freq Error: ${(avgFrequencyError * 100).toFixed(1)}%`, statsDisplay.x + 12, currentY);
        currentY += lineSpacing;
        text(`Sound Vol Error: ${(avgVolumeError * 100).toFixed(1)}%`, statsDisplay.x + 12, currentY);
        currentY += lineSpacing;
    }
    
    // Calculate free energy trend (increasing/decreasing)
    let freeEnergyTrend = 0;
    let trendSampleSize = 0;
    for (let org of ecosystem.organisms) {
        if (org.freeEnergyHistory && org.freeEnergyHistory.length >= 2) {
            const recent = org.freeEnergyHistory[org.freeEnergyHistory.length - 1];
            const previous = org.freeEnergyHistory[org.freeEnergyHistory.length - 2];
            freeEnergyTrend += (recent - previous);
            trendSampleSize++;
        }
    }
    const avgTrend = trendSampleSize > 0 ? freeEnergyTrend / trendSampleSize : 0;
    
    // Display trend indicator
    const trendSymbol = avgTrend > 0.1 ? '↑' : (avgTrend < -0.1 ? '↓' : '→');
    const trendColor = avgTrend > 0.1 ? 200 : (avgTrend < -0.1 ? 30 : 100);
    fill(trendColor);
    text(`Free Energy Trend: ${trendSymbol} ${avgTrend > 0 ? '+' : ''}${avgTrend.toFixed(2)}`, statsDisplay.x + 12, currentY);
    currentY += lineSpacing;
    
    // Count organisms effectively minimizing free energy (free energy below threshold)
    let organismsMinimizing = 0;
    const freeEnergyThreshold = 30; // Consider organisms with free energy < 30 as "minimizing"
    for (let org of ecosystem.organisms) {
        if (org.freeEnergy !== undefined && org.freeEnergy < freeEnergyThreshold) {
            organismsMinimizing++;
        }
    }
    const minimizingPercent = ecosystem.organisms.length > 0 ? 
        (organismsMinimizing / ecosystem.organisms.length * 100) : 0;
    
    fill(60);
    text(`Minimizing FE: ${organismsMinimizing}/${ecosystem.organisms.length} (${minimizingPercent.toFixed(0)}%)`, statsDisplay.x + 12, currentY);
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
        // SIMPLIFIED: Aggressively stop all sounds when disabled
        if (!soundEnabled && ecosystem) {
            // Stop all organism sounds immediately
            for (let org of ecosystem.organisms) {
                if (org.stopSound) {
                    org.stopSound();
                }
                // Force stop flags
                org.isPlayingSound = false;
            }
            // Also stop any other sounds
            if (audioContext) {
                try {
                    audioContext.suspend();
                } catch (e) {}
            }
        } else if (soundEnabled && audioContext) {
            // Resume audio context when enabling sound
            try {
                if (audioContext.state === 'suspended') {
                    audioContext.resume().catch(e => {
                        console.log('Failed to resume audio context:', e);
                    });
                }
            } catch (e) {}
        }
    }
    if (key === 'h' || key === 'H') {
        statsVisible = !statsVisible;
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
    if (key === 'c' || key === 'C') {
        // Cycle through color palettes: grayscale -> original -> new -> grayscale
        colorPaletteMode = (colorPaletteMode + 1) % 3;
    }
}

function mousePressed() {
    if (ecosystem) {
        ecosystem.isRunning = true;
        isPaused = false;
    }
}
