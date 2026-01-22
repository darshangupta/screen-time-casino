import { GameEngine, GameOutcome } from '../../../shared/types';
import { GAME_CONFIG } from '../../../shared/constants/games';

interface SlotsInput {
  bet: number;
}

interface SlotsDisplay {
  reels: [string, string, string];
  isWin: boolean;
  payline: string;
}

const SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '💎', '⭐', '🔔'];
const WINNING_COMBINATIONS = [
  ['🍒', '🍒', '🍒'],
  ['🍋', '🍋', '🍋'],
  ['🍊', '🍊', '🍊'],
  ['🍇', '🍇', '🍇'],
  ['💎', '💎', '💎'],
  ['⭐', '⭐', '⭐'],
  ['🔔', '🔔', '🔔']
];

export class SlotsEngine implements GameEngine<SlotsInput, SlotsDisplay> {
  config = GAME_CONFIG.slots;

  validateInput(input: SlotsInput): boolean {
    return (
      input.bet >= this.config.minScreenTimeDelta &&
      input.bet <= this.config.maxScreenTimeDelta
    );
  }

  play(input: SlotsInput, seed: number): GameOutcome & { display: SlotsDisplay } {
    if (!this.validateInput(input)) {
      throw new Error('Invalid bet amount');
    }

    const random = this.seededRandom(seed);
    const outcome = random() < this.config.winProbability ? 'win' : 
                   random() < (this.config.winProbability + this.config.lossProbability) ? 'loss' : 'push';

    let reels: [string, string, string];
    
    if (outcome === 'win') {
      const winningCombo = WINNING_COMBINATIONS[Math.floor(random() * WINNING_COMBINATIONS.length)];
      reels = [...winningCombo] as [string, string, string];
    } else if (outcome === 'push') {
      reels = [
        SLOT_SYMBOLS[Math.floor(random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(random() * SLOT_SYMBOLS.length)]
      ];
      if (this.isWinningCombination(reels)) {
        reels[2] = SLOT_SYMBOLS.find(s => s !== reels[0]) || '🍒';
      }
    } else {
      reels = [
        SLOT_SYMBOLS[Math.floor(random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(random() * SLOT_SYMBOLS.length)]
      ];
      if (this.isWinningCombination(reels)) {
        reels[2] = SLOT_SYMBOLS.find(s => s !== reels[0]) || '🍒';
      }
    }

    let screenTimeDelta: number;
    switch (outcome) {
      case 'win':
        screenTimeDelta = Math.floor(input.bet * (1.5 + random() * 0.5));
        break;
      case 'loss':
        screenTimeDelta = -input.bet;
        break;
      case 'push':
        screenTimeDelta = 0;
        break;
    }

    const display: SlotsDisplay = {
      reels,
      isWin: outcome === 'win',
      payline: this.getPaylineDescription(reels, outcome === 'win')
    };

    return {
      result: outcome,
      screenTimeDelta,
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

  private isWinningCombination(reels: [string, string, string]): boolean {
    return WINNING_COMBINATIONS.some(combo => 
      combo[0] === reels[0] && combo[1] === reels[1] && combo[2] === reels[2]
    );
  }

  private getPaylineDescription(reels: [string, string, string], isWin: boolean): string {
    if (isWin) {
      return `Three ${reels[0]}s!`;
    }
    return 'No match';
  }
}