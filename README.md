# BrainFuck Swarm Evolution

An interactive evolutionary ecosystem where Brainfuck code programs evolve, reproduce, form symbiotic relationships, and create emergent behaviors through self-organization and active inference.

## What is Brainfuck?

**Brainfuck** is an esoteric programming language created by Urban Müller in 1993. It is designed to be extremely minimal, with only 8 commands, yet it is Turing-complete (capable of computing anything that any other programming language can compute).

### The 8 Commands

- `>` - Move pointer right (increment data pointer)
- `<` - Move pointer left (decrement data pointer)
- `+` - Increment byte at pointer
- `-` - Decrement byte at pointer
- `.` - Output byte at pointer
- `,` - Input byte and store at pointer
- `[` - Jump forward if byte at pointer is zero
- `]` - Jump backward if byte at pointer is non-zero

### How It Works

Brainfuck operates on an array of memory cells (typically 30,000 cells), each initialized to zero. A data pointer starts at the first cell. The program executes commands sequentially, manipulating the memory cells and pointer position. Loops (`[` and `]`) allow for conditional repetition.

**Example**: `+++[>+++<-]` increments the first cell to 3, then loops 3 times, each time incrementing the second cell by 3 and decrementing the first cell by 1, resulting in the second cell containing 9.

### Why Brainfuck in This Project?

In BrainFuck Swarm, each organism's "genotype" is a Brainfuck program. The execution of this code determines:
- The organism's behavior and movement patterns
- Its visual appearance (phenotype)
- Its interactions with other organisms
- Its sound generation
- Its memory patterns

This creates a direct mapping between code and life: simple programs create simple organisms, while complex programs create complex, sophisticated behaviors.

**Learn more**: [Brainfuck on Wikipedia](https://en.wikipedia.org/wiki/Brainfuck)

## Overview

BrainFuck Swarm is a living simulation where simple code fragments evolve into complex organisms. Each organism is a Brainfuck program that executes its code to determine its behavior, appearance, and interactions. The system implements principles from evolutionary biology, autopoiesis, the Free Energy Principle, and active inference to create a self-organizing, evolving ecosystem.

## Core Concepts

### Organisms
- **Genotype**: The Brainfuck code (`tape`) that defines an organism's program
- **Phenotype**: Visual appearance and behavior derived from code execution
- **Complexity**: Measured by valid Brainfuck instructions (max 64)
- **Lifecycle**: Birth → Growth → Reproduction → Death (starvation, lifespan, or low fitness)

### Food
- Starts as simple code fragments with minimal complexity
- Executes code to self-organize and evolve
- When complexity reaches threshold (10), food evolves into an organism
- Implements Free Energy Principle from the beginning

### Code Execution
- Each organism executes its Brainfuck code every frame
- Code execution determines:
  - Movement patterns
  - Visual appearance (size, color, shape)
  - Social behaviors
  - Sound generation
  - Memory patterns

## Evolutionary Mechanisms

### 1. Developmental Progression
```
Food (simple code) → Self-organization → Complexity threshold → Organism
```
- Food items start with 2-5 random Brainfuck instructions
- They execute code, increasing complexity through self-organization
- When complexity ≥ 10, food transforms into a full organism with genotype and phenotype

### 2. Self-Replication
- Organisms replicate their own code when conditions are met:
  - Age threshold reached
  - Sufficient complexity
  - Adequate food consumed
  - Low hunger level
- Replication includes:
  - Code copying with 95% fidelity
  - Small mutations (5% chance)
  - Trait inheritance
  - Visual pulse effect

### 3. Code Evolution Through Interactions
- When organisms interact (collide), their codes combine
- Combined code execution creates new behaviors
- Successful interactions strengthen relationships
- Code evolves based on:
  - Fitness landscape values
  - Relationship affinity
  - Environmental conditions

### 4. Natural Selection
- **Starvation**: Organisms die if hunger reaches 100
- **Lifespan**: Organisms expire after 3000-8000 frames
- **Fitness**: Low fitness organisms are removed
- **Predation**: More complex organisms can consume less complex ones (phagocytosis)

### 5. Phagocytosis
- Visual engulfment process where one organism slowly wraps around and consumes another
- Requires complexity difference > 4
- Creates membrane wrapping animation
- Absorbs code from consumed organism

## Symbiosis and Superorganisms

### Symbiont Relationships
- Two organisms form symbiotic bonds when:
  - Genotype compatibility > 0.7
  - Proximity maintained for 60 frames
  - Compatible movement patterns
- Benefits:
  - Shared resources
  - Coordinated movement
  - Enhanced food sensing
  - Visual membrane connection

### Superorganisms
- Clusters of 3+ symbionts with compatible genotypes
- Form hierarchical structures:
  - Individual organisms
  - Symbiont pairs (with membranes)
  - Superorganisms (clusters of symbionts)
- Superorganisms have:
  - Organic, amoeba-like membranes (Markov blankets)
  - Shared collective memory
  - Coordinated behaviors
  - Pseudopod extensions

### Membranes (Markov Blankets)
- Visual boundaries separating internal states from external environment
- Implement Free Energy Principle's boundary conditions
- Three types:
  1. **Symbiont membranes**: Wrap around pairs, fluid and organic
  2. **Superorganism membranes**: Enclose clusters, amoeba-like with pseudopods
  3. **Cluster boundaries**: Organic boundaries around organism groups
- All membranes feature:
  - Pseudopod extensions (3-10 per membrane)
  - Fluid, unpredictable movement
  - Multiple noise layers for organic deformation
  - Wave motion for fluid feel

## Free Energy Principle & Active Inference

The system implements the Free Energy Principle, where organisms maintain generative models and act to minimize prediction error.

### Generative Model
Organisms predict:
- Food locations
- Other organism positions
- Fitness landscape values
- Expected hunger levels
- Sound states (frequency, volume)

### Prediction Errors
Computed differences between predicted and actual states:
- Food location error
- Organism position error
- Hunger error
- Fitness error
- Sound frequency/volume errors

### Free Energy
Measure of prediction error to be minimized:
```
Free Energy = Prediction Error + Complexity Penalty + Surprise
```

### Active Inference
Organisms plan actions to minimize free energy:
- **Exploitation**: Move toward predicted food
- **Exploration**: Move toward areas with high uncertainty
- **Avoidance**: Move away from predicted threats

### Sound as Active Inference
- Sound parameters evolve to minimize free energy
- Frequency and volume reflect organism state
- Acoustic coupling: nearby organisms influence each other
- Only top 2 most complex organisms generate sound

## Sound System

### Sound Generation
- Only the 2 most complex organisms produce sound
- Frequency based on:
  - Complexity
  - Genotype signature
  - Free energy
- Volume based on:
  - Complexity
  - Free energy
- Frequency range: 150-600 Hz
- Volume range: 0.0008-0.003

### Sound Management
- Strict limits to prevent audio overload
- Maximum 2 active oscillators
- Automatic cleanup when organisms lose top-2 status
- Sound stops when:
  - Organism dies
  - Organism falls out of top 2
  - User disables sound ('S' key)

## Visual Features

### Color Palettes
Three selectable palettes (press 'C' to cycle):
1. **Grayscale**: Complexity-based grayscale mapping
2. **Original**: Cyan/blue/pink palette (`["32cbff","00a5e0","89a1ef","ef9cda","fecef1"]`)
3. **Earth Tones**: Dark red/orange/sage/olive (`["4c061d","d17a22","b4c292","736f4e","3b3923"]`)

### Organism Appearance
- Size varies with complexity
- Color from palette based on:
  - Complexity
  - Genotype patterns
  - Memory patterns
- Shape: Organic blob with noise-based deformation
- Pulsing glow for complex organisms

### Membranes
- **Symbiont membranes**: Fluid, wrap around pairs organically
- **Superorganism membranes**: Amoeba-like with pseudopods
- **Cluster boundaries**: Organic shapes with extensions
- All membranes feature:
  - Pseudopod extensions (animated)
  - Multiple noise layers
  - Wave motion
  - Unpredictable organic deformation

### Fitness Landscape
- Subtle background visualization
- Shows environmental fitness values
- Affects organism survival and behavior

### Phagocytosis Visualization
- Predator wraps membrane around prey
- Multiple layers of engulfment
- Pressure rings on prey
- Shrinking effect as prey is consumed

## Controls

- **Space**: Pause/Resume simulation
- **S**: Toggle sound on/off
- **H**: Toggle stats panel visibility
- **C**: Cycle color palettes (Grayscale → Original → Earth Tones)
- **R**: Reset ecosystem (starts with 250 organisms)
- **↑/↓**: Adjust simulation speed (multiply/divide by 2)
- **Mouse Click**: Start/resume simulation

## Statistics Panel

Displays real-time information:
- Population count
- Food count
- Average complexity
- Symbiont pairs
- Superorganisms
- Self-replication count
- Active sounds
- **Free Energy Principle indicators**:
  - Average free energy
  - Average prediction error
  - Sound frequency/volume errors
  - Free energy trend
  - Minimizing FE progress bar

## Autopoiesis (Self-Maintenance)

The system self-regulates:
- **Population homeostasis**: Maintains target population (~50)
- **Food regulation**: Spawns food based on population needs
- **System health**: Monitors and adjusts based on:
  - Population stability
  - Food availability
  - Organism health
- **Adaptive targets**: Adjusts based on system complexity and health

## Technical Details

### Brainfuck Interpreter
- Standard Brainfuck instruction set: `> < + - . , [ ]`
- 30,000 memory cells
- Operation counting
- Bracket matching
- Output tracking

### Performance
- Maximum population: 400 organisms
- Maximum food: 30-60 (adaptive)
- Sound limit: 2 active oscillators
- Frame-based updates (60fps target)

### Code Structure
- `BrainfuckInterpreter`: Executes Brainfuck code
- `Food`: Simple code fragments that evolve
- `Organism`: Full organisms with genotype/phenotype
- `BFFEcosystem`: Manages ecosystem, evolution, and interactions

## Evolutionary Emergence

The system exhibits emergent behaviors:
- **Self-organization**: Food organizes into organisms
- **Symbiosis**: Organisms form cooperative relationships
- **Superorganisms**: Hierarchical structures emerge
- **Adaptive behaviors**: Organisms learn from interactions
- **Sound evolution**: Acoustic communication develops
- **Membrane formation**: Organic boundaries self-organize

## Philosophical Framework

BrainFuck Swarm explores:
- **Autopoiesis**: Self-maintaining systems
- **Free Energy Principle**: Minimizing prediction error
- **Active Inference**: Action through perception
- **Markov Blankets**: Boundaries between system and environment
- **Symbiogenesis**: Evolution through cooperation
- **Emergence**: Complex behaviors from simple rules

## Live Demo

🌐 **Try it live**: [https://marlonbarrios.github.io/brainfuck_swarm/](https://marlonbarrios.github.io/brainfuck_swarm/)

Experience the evolving ecosystem in your browser. Watch as simple code fragments evolve into complex organisms, form symbiotic relationships, and create emergent behaviors.

## Screenshots

![BrainFuck Swarm Evolution - Ecosystem View](Screenshot%202026-02-19%20at%205.32.22%20PM.png)

*The evolving ecosystem showing organisms, symbiont pairs with organic membranes, and superorganisms forming hierarchical structures.*

![BrainFuck Swarm Evolution - Detailed View](Screenshot%202026-02-19%20at%205.35.43%20PM.png)

*Close-up view of organisms with pseudopod membranes, phagocytosis in action, and the stats panel showing Free Energy Principle indicators.*

---

**BrainFuck Swarm Evolution** - Where code becomes life, and life evolves through computation.
