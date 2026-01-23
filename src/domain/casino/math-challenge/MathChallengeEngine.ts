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
    let problemData: { question: string; answer: number };
    let timeLimit: number;

    switch (difficulty) {
      case 'easy':
        problemData = this.generateEasyProblem(random);
        timeLimit = 10; // Updated time limits
        break;
      case 'medium':
        problemData = this.generateMediumProblem(random);
        timeLimit = 8;
        break;
      case 'hard':
        problemData = this.generateHardProblem(random);
        timeLimit = 5;
        break;
      default:
        problemData = { question: 'Error', answer: 0 };
        timeLimit = 10;
    }

    // Generate multiple choice options
    const options = this.generateOptions(problemData.answer, random);

    return {
      id,
      question: problemData.question,
      answer: problemData.answer,
      options,
      difficulty,
      timeLimit,
    };
  }

  private generateEasyProblem(random: SeededRandom): { question: string; answer: number } {
    const operations = ['+', '-'];
    const operation = operations[random.nextInt(0, operations.length - 1)];
    
    let a: number, b: number, c: number, answer: number, question: string;
    
    if (operation === '+') {
      // Three number addition: a + b + c
      a = random.nextInt(10, 50);
      b = random.nextInt(10, 50);
      c = random.nextInt(10, 50);
      answer = a + b + c;
      question = `${a} + ${b} + ${c} = ?`;
    } else {
      // Three number subtraction: a - b - c
      c = random.nextInt(5, 20);
      b = random.nextInt(10, 30);
      a = random.nextInt(b + c + 10, b + c + 80); // Ensure positive result
      answer = a - b - c;
      question = `${a} - ${b} - ${c} = ?`;
    }

    return { question, answer };
  }

  private generateMediumProblem(random: SeededRandom): { question: string; answer: number } {
    const operations = ['*', '/'];
    const operation = operations[random.nextInt(0, operations.length - 1)];
    
    let a: number, b: number, answer: number, question: string;
    
    if (operation === '*') {
      // Two-digit multiplication
      a = random.nextInt(12, 25);
      b = random.nextInt(11, 20);
      answer = a * b;
      question = `${a} × ${b} = ?`;
    } else {
      // Division with whole number results
      b = random.nextInt(6, 15);
      const quotient = random.nextInt(8, 25);
      a = b * quotient; // Ensure clean division
      answer = quotient;
      question = `${a} ÷ ${b} = ?`;
    }

    return { question, answer };
  }

  private generateHardProblem(random: SeededRandom): { question: string; answer: number } {
    // Exponent problems
    const base = random.nextInt(2, 9);
    const exponent = random.nextInt(2, 4); // Keep exponents reasonable
    const answer = Math.pow(base, exponent);
    const question = `${base}^${exponent} = ?`;

    return { question, answer };
  }

  // No longer needed - questions are generated with problems
  private getQuestionFromAnswer(answer: number, difficulty: 'easy' | 'medium' | 'hard', random: SeededRandom): string {
    return 'Generated with problem';
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