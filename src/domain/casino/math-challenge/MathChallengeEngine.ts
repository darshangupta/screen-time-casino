/**
 * Math Challenge Game Engine
 * Solve math problems to win screen time
 */

import { GameEngine, GameOutcome } from '../../../shared/types';
import { GAME_CONFIG } from '../../../shared/constants/games';

interface MathChallengeInput {
  bet: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // seconds
}

export interface MathProblem {
  id: string;
  question: string;
  answer: number;
  options: number[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
}

interface MathChallengeDisplay {
  problems: MathProblem[];
  userAnswers: number[];
  correctAnswers: number[];
  timeSpent: number[];
  totalCorrect: number;
  totalProblems: number;
  accuracy: number;
  bonusMultiplier: number;
}

// Simple seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

export class MathChallengeEngine implements GameEngine<MathChallengeInput, MathChallengeDisplay> {
  config = GAME_CONFIG['math-problems'];

  validateInput(input: MathChallengeInput): boolean {
    return (
      input.bet >= this.config.minScreenTimeDelta &&
      input.bet <= this.config.maxScreenTimeDelta &&
      typeof input.bet === 'number' &&
      !isNaN(input.bet) &&
      ['easy', 'medium', 'hard'].includes(input.difficulty) &&
      input.timeLimit > 0 &&
      input.timeLimit <= 300 // Max 5 minutes
    );
  }

  // This method is used for generating problems in the UI
  generateProblems(difficulty: 'easy' | 'medium' | 'hard', count: number, seed: number): MathProblem[] {
    const random = new SeededRandom(seed);
    const problems: MathProblem[] = [];

    for (let i = 0; i < count; i++) {
      problems.push(this.generateProblem(difficulty, random, i.toString()));
    }

    return problems;
  }

  play(input: MathChallengeInput, seed: number, userAnswers: number[], timeSpent: number[]): GameOutcome & { display: MathChallengeDisplay } {
    const random = new SeededRandom(seed);
    const { bet: betAmount, difficulty } = input;

    // Generate the same problems that were shown to the user
    const problemCount = this.getProblemCount(difficulty);
    const problems = this.generateProblems(difficulty, problemCount, seed);
    const correctAnswers = problems.map(p => p.answer);

    // Calculate results
    let totalCorrect = 0;
    for (let i = 0; i < userAnswers.length && i < correctAnswers.length; i++) {
      if (userAnswers[i] === correctAnswers[i]) {
        totalCorrect++;
      }
    }

    const accuracy = totalCorrect / problems.length;
    const averageTime = timeSpent.reduce((sum, time) => sum + time, 0) / timeSpent.length;

    // Calculate bonus multiplier based on speed and accuracy
    const speedBonus = this.calculateSpeedBonus(averageTime, difficulty);
    const accuracyBonus = accuracy;
    const bonusMultiplier = Math.max(0.1, accuracyBonus * speedBonus);

    // Determine result
    let result: 'win' | 'loss' | 'push';
    let screenTimeDelta: number;

    const requiredAccuracy = this.getRequiredAccuracy(difficulty);
    
    if (accuracy >= requiredAccuracy) {
      // Win - gain screen time based on performance
      result = 'win';
      screenTimeDelta = Math.round(betAmount * bonusMultiplier);
    } else if (accuracy >= requiredAccuracy * 0.5) {
      // Partial credit - push
      result = 'push';
      screenTimeDelta = 0;
    } else {
      // Loss - lose screen time
      result = 'loss';
      screenTimeDelta = -Math.round(betAmount * 0.5); // Lose half on poor performance
    }

    const display: MathChallengeDisplay = {
      problems,
      userAnswers,
      correctAnswers,
      timeSpent,
      totalCorrect,
      totalProblems: problems.length,
      accuracy,
      bonusMultiplier,
    };

    return {
      result,
      screenTimeDelta,
      displayData: display,
      display,
    };
  }

  private generateProblem(difficulty: 'easy' | 'medium' | 'hard', random: SeededRandom, id: string): MathProblem {
    let question: string;
    let answer: number;
    let timeLimit: number;

    switch (difficulty) {
      case 'easy':
        answer = this.generateEasyProblem(random);
        timeLimit = 30;
        break;
      case 'medium':
        answer = this.generateMediumProblem(random);
        timeLimit = 45;
        break;
      case 'hard':
        answer = this.generateHardProblem(random);
        timeLimit = 60;
        break;
    }

    // Extract question from the generated problem
    question = this.getQuestionFromAnswer(answer, difficulty, random);

    // Generate multiple choice options
    const options = this.generateOptions(answer, random);

    return {
      id,
      question,
      answer,
      options,
      difficulty,
      timeLimit,
    };
  }

  private generateEasyProblem(random: SeededRandom): number {
    const operations = ['+', '-', '*'];
    const operation = operations[random.nextInt(0, operations.length - 1)];
    
    let a: number, b: number, answer: number;
    
    switch (operation) {
      case '+':
        a = random.nextInt(1, 50);
        b = random.nextInt(1, 50);
        answer = a + b;
        break;
      case '-':
        a = random.nextInt(10, 100);
        b = random.nextInt(1, a);
        answer = a - b;
        break;
      case '*':
        a = random.nextInt(2, 12);
        b = random.nextInt(2, 12);
        answer = a * b;
        break;
      default:
        answer = 0;
    }

    return answer;
  }

  private generateMediumProblem(random: SeededRandom): number {
    const problemTypes = ['arithmetic', 'fractions', 'percentages'];
    const type = problemTypes[random.nextInt(0, problemTypes.length - 1)];
    
    switch (type) {
      case 'arithmetic':
        // Two-step problems
        const a = random.nextInt(10, 50);
        const b = random.nextInt(5, 20);
        const c = random.nextInt(2, 10);
        return (a + b) * c;
        
      case 'fractions':
        // Simple fraction to decimal
        const numerator = random.nextInt(1, 9);
        const denominator = random.nextInt(2, 10);
        return Math.round((numerator / denominator) * 100) / 100;
        
      case 'percentages':
        // Percentage of a number
        const base = random.nextInt(20, 200);
        const percent = random.nextInt(10, 90);
        return Math.round((base * percent) / 100);
        
      default:
        return 0;
    }
  }

  private generateHardProblem(random: SeededRandom): number {
    const problemTypes = ['algebra', 'geometry', 'complex'];
    const type = problemTypes[random.nextInt(0, problemTypes.length - 1)];
    
    switch (type) {
      case 'algebra':
        // Simple quadratic: x^2 + bx + c = 0, find x
        const b = random.nextInt(-10, 10);
        const c = random.nextInt(-20, 20);
        // Return discriminant for now (simplified)
        return b * b - 4 * c;
        
      case 'geometry':
        // Area of shapes
        const radius = random.nextInt(3, 15);
        return Math.round(Math.PI * radius * radius);
        
      case 'complex':
        // Multi-step arithmetic
        const x = random.nextInt(5, 25);
        const y = random.nextInt(3, 15);
        const z = random.nextInt(2, 8);
        return Math.round((x * y) / z + (x - y) * 2);
        
      default:
        return 0;
    }
  }

  private getQuestionFromAnswer(answer: number, difficulty: 'easy' | 'medium' | 'hard', random: SeededRandom): string {
    // This is a simplified approach - in a real implementation, we'd store the question during generation
    switch (difficulty) {
      case 'easy':
        if (answer < 100) {
          const a = random.nextInt(1, 50);
          const b = answer - a;
          return `${a} + ${b} = ?`;
        } else {
          const a = random.nextInt(2, 12);
          const b = Math.round(answer / a);
          return `${a} × ${b} = ?`;
        }
      
      case 'medium':
        if (answer < 1) {
          return `Convert 1/2 to decimal = ?`;
        } else if (answer < 100) {
          return `25% of ${answer * 4} = ?`;
        } else {
          return `(20 + 30) × ${Math.round(answer / 50)} = ?`;
        }
      
      case 'hard':
        if (answer > 1000) {
          return `What is b² - 4ac if b=5, a=1, c=-10?`;
        } else if (answer > 100) {
          const r = Math.round(Math.sqrt(answer / Math.PI));
          return `Area of circle with radius ${r} = ?`;
        } else {
          return `(15 × 6) ÷ 3 + (15 - 6) × 2 = ?`;
        }
      
      default:
        return 'Unknown problem';
    }
  }

  private generateOptions(correctAnswer: number, random: SeededRandom): number[] {
    const options: number[] = [correctAnswer];
    
    // Generate 3 wrong answers
    for (let i = 0; i < 3; i++) {
      let wrongAnswer: number;
      do {
        const variance = Math.max(1, Math.abs(correctAnswer) * 0.3);
        const offset = random.nextInt(-Math.round(variance), Math.round(variance));
        wrongAnswer = Math.round((correctAnswer + offset) * 100) / 100;
      } while (options.includes(wrongAnswer));
      
      options.push(wrongAnswer);
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = random.nextInt(0, i);
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return options;
  }

  private getProblemCount(difficulty: 'easy' | 'medium' | 'hard'): number {
    switch (difficulty) {
      case 'easy': return 5;
      case 'medium': return 4;
      case 'hard': return 3;
    }
  }

  private getRequiredAccuracy(difficulty: 'easy' | 'medium' | 'hard'): number {
    switch (difficulty) {
      case 'easy': return 0.8;   // 80% accuracy required
      case 'medium': return 0.75; // 75% accuracy required
      case 'hard': return 0.67;   // 67% accuracy required (2 out of 3)
    }
  }

  private calculateSpeedBonus(averageTime: number, difficulty: 'easy' | 'medium' | 'hard'): number {
    const targetTime = this.getTargetTime(difficulty);
    const speedRatio = targetTime / averageTime;
    return Math.min(2.0, Math.max(0.5, speedRatio)); // Bonus between 0.5x and 2.0x
  }

  private getTargetTime(difficulty: 'easy' | 'medium' | 'hard'): number {
    switch (difficulty) {
      case 'easy': return 15;   // 15 seconds target
      case 'medium': return 25; // 25 seconds target
      case 'hard': return 40;   // 40 seconds target
    }
  }
}