import { GameEngine, GameOutcome } from '../../../shared/types';
import { GAME_CONFIG } from '../../../shared/constants/games';

interface RouletteBet {
  type: 'red' | 'black' | 'odd' | 'even' | 'single' | 'dozen' | 'column';
  amount: number;
  value?: number; // For single number bets
}

interface RouletteInput {
  bets: RouletteBet[];
}

interface RouletteDisplay {
  winningNumber: number;
  winningColor: 'red' | 'black' | 'green';
  ballAnimation: number[];
  winningBets: RouletteBet[];
  losingBets: RouletteBet[];
}

export class RouletteEngine implements GameEngine<RouletteInput, RouletteDisplay> {
  config = GAME_CONFIG.roulette;

  private readonly RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  private readonly BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

  validateInput(input: RouletteInput): boolean {
    if (input.bets.length === 0) return false;
    
    const totalBet = input.bets.reduce((sum, bet) => sum + bet.amount, 0);
    return (
      totalBet >= this.config.minScreenTimeDelta &&
      totalBet <= this.config.maxScreenTimeDelta &&
      input.bets.every(bet => 
        bet.amount > 0 && 
        (bet.type !== 'single' || (bet.value !== undefined && bet.value >= 0 && bet.value <= 36))
      )
    );
  }

  play(input: RouletteInput, seed: number): GameOutcome & { display: RouletteDisplay } {
    if (!this.validateInput(input)) {
      throw new Error('Invalid bets');
    }

    const random = this.seededRandom(seed);
    
    // Spin the wheel (0-36, European roulette)
    const winningNumber = Math.floor(random() * 37);
    const winningColor = this.getNumberColor(winningNumber);
    
    // Generate ball animation path
    const ballAnimation = this.generateBallAnimation(winningNumber, random);
    
    // Evaluate bets
    const winningBets: RouletteBet[] = [];
    const losingBets: RouletteBet[] = [];
    let totalPayout = 0;
    let totalLoss = 0;

    for (const bet of input.bets) {
      if (this.isBetWinner(bet, winningNumber)) {
        winningBets.push(bet);
        totalPayout += bet.amount * this.getPayoutMultiplier(bet.type);
      } else {
        losingBets.push(bet);
        totalLoss += bet.amount;
      }
    }

    const netResult = totalPayout - totalLoss;
    let result: 'win' | 'loss' | 'push';
    
    if (netResult > 0) {
      result = 'win';
    } else if (netResult < 0) {
      result = 'loss';
    } else {
      result = 'push';
    }

    const display: RouletteDisplay = {
      winningNumber,
      winningColor,
      ballAnimation,
      winningBets,
      losingBets
    };

    return {
      result,
      screenTimeDelta: netResult,
      displayData: display,
      display
    };
  }

  private seededRandom(seed: number) {
    let value = seed;
    return () => {
      value = (value * 16807) % 2147483647;
      return (value - 1) / 2147483646;
    };
  }

  private getNumberColor(number: number): 'red' | 'black' | 'green' {
    if (number === 0) return 'green';
    if (this.RED_NUMBERS.includes(number)) return 'red';
    return 'black';
  }

  private generateBallAnimation(winningNumber: number, random: () => number): number[] {
    // Generate a realistic ball path animation
    const path: number[] = [];
    const spins = 3 + Math.floor(random() * 2); // 3-4 full spins
    
    for (let spin = 0; spin < spins; spin++) {
      for (let i = 0; i <= 36; i++) {
        if (spin === spins - 1) {
          // Slow down on final spin
          if (i <= winningNumber) {
            path.push(i);
          }
        } else {
          path.push(i);
        }
      }
    }
    
    return path;
  }

  private isBetWinner(bet: RouletteBet, winningNumber: number): boolean {
    switch (bet.type) {
      case 'red':
        return this.getNumberColor(winningNumber) === 'red';
      case 'black':
        return this.getNumberColor(winningNumber) === 'black';
      case 'odd':
        return winningNumber !== 0 && winningNumber % 2 === 1;
      case 'even':
        return winningNumber !== 0 && winningNumber % 2 === 0;
      case 'single':
        return winningNumber === bet.value;
      case 'dozen':
        if (bet.value === 1) return winningNumber >= 1 && winningNumber <= 12;
        if (bet.value === 2) return winningNumber >= 13 && winningNumber <= 24;
        if (bet.value === 3) return winningNumber >= 25 && winningNumber <= 36;
        return false;
      case 'column':
        if (bet.value === 1) return winningNumber % 3 === 1;
        if (bet.value === 2) return winningNumber % 3 === 2;
        if (bet.value === 3) return winningNumber % 3 === 0 && winningNumber !== 0;
        return false;
      default:
        return false;
    }
  }

  private getPayoutMultiplier(betType: RouletteBet['type']): number {
    switch (betType) {
      case 'red':
      case 'black':
      case 'odd':
      case 'even':
        return 2; // 1:1 payout
      case 'dozen':
      case 'column':
        return 3; // 2:1 payout
      case 'single':
        return 36; // 35:1 payout
      default:
        return 1;
    }
  }
}