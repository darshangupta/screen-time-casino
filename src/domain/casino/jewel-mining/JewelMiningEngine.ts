import { GameEngine, GameOutcome } from '../../../shared/types';
import { GAME_CONFIG } from '../../../shared/constants/games';

interface JewelMiningInput {
  bet: number;
  clickedPositions: number[];
}

interface JewelMiningDisplay {
  grid: Array<'gem' | 'bomb' | 'hidden'>;
  revealed: number[];
  finalState: 'continue' | 'won' | 'lost';
  accumulatedWinnings: number;
  bombPosition?: number;
}

export class JewelMiningEngine implements GameEngine<JewelMiningInput, JewelMiningDisplay> {
  config = GAME_CONFIG['jewel-mining'];
  
  private readonly GRID_SIZE = 16; // 4x4 grid
  private readonly BOMB_COUNT = 4; // 4 bombs in 16 positions

  validateInput(input: JewelMiningInput): boolean {
    return (
      input.bet >= this.config.minScreenTimeDelta &&
      input.bet <= this.config.maxScreenTimeDelta &&
      input.clickedPositions.every(pos => pos >= 0 && pos < this.GRID_SIZE) &&
      new Set(input.clickedPositions).size === input.clickedPositions.length
    );
  }

  play(input: JewelMiningInput, seed: number): GameOutcome & { display: JewelMiningDisplay } {
    if (!this.validateInput(input)) {
      throw new Error('Invalid input');
    }

    const random = this.seededRandom(seed);
    
    // Generate bomb positions
    const bombPositions = this.generateBombPositions(random);
    
    // Create grid
    const grid: Array<'gem' | 'bomb' | 'hidden'> = new Array(this.GRID_SIZE).fill('hidden');
    bombPositions.forEach(pos => grid[pos] = 'bomb');
    for (let i = 0; i < this.GRID_SIZE; i++) {
      if (grid[i] === 'hidden') grid[i] = 'gem';
    }

    // Process clicks
    let accumulatedWinnings = 0;
    let hitBomb = false;
    let bombPosition: number | undefined;
    
    for (const position of input.clickedPositions) {
      if (grid[position] === 'bomb') {
        hitBomb = true;
        bombPosition = position;
        break;
      } else {
        // Each gem found adds a portion of the bet
        const gemValue = Math.floor(input.bet * 0.2); // 20% of bet per gem
        accumulatedWinnings += gemValue;
        
        // Cap at the original bet amount
        if (accumulatedWinnings >= input.bet) {
          accumulatedWinnings = input.bet;
          break;
        }
      }
    }

    let result: 'win' | 'loss' | 'push';
    let screenTimeDelta: number;

    if (hitBomb) {
      result = 'loss';
      screenTimeDelta = -input.bet;
      accumulatedWinnings = 0;
    } else if (accumulatedWinnings > 0) {
      result = 'win';
      screenTimeDelta = accumulatedWinnings;
    } else {
      result = 'push';
      screenTimeDelta = 0;
    }

    const finalState: 'continue' | 'won' | 'lost' = 
      hitBomb ? 'lost' : 
      accumulatedWinnings >= input.bet ? 'won' : 
      'continue';

    const display: JewelMiningDisplay = {
      grid,
      revealed: input.clickedPositions,
      finalState,
      accumulatedWinnings,
      bombPosition
    };

    return {
      result,
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

  private generateBombPositions(random: () => number): number[] {
    const positions: number[] = [];
    while (positions.length < this.BOMB_COUNT) {
      const pos = Math.floor(random() * this.GRID_SIZE);
      if (!positions.includes(pos)) {
        positions.push(pos);
      }
    }
    return positions;
  }
}