/**
 * Plinko Game Engine
 * Drop chips down a pegboard to hit multiplier slots at the bottom
 */

import { GameEngine, GameOutcome } from '../../../shared/types';
import { GAME_CONFIG } from '../../../shared/constants/games';

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
}

interface PlinkoInput {
  bet: number;
}

interface PlinkoDisplay {
  path: number[]; // Path the chip took (left/right decisions)
  finalSlot: number; // Which slot chip landed in
  multiplier: number; // Multiplier value of final slot
  chipPosition: { row: number; position: number }[]; // Full path coordinates
}

export class PlinkoEngine implements GameEngine<PlinkoInput, PlinkoDisplay> {
  config = GAME_CONFIG.plinko;

  private readonly pegs = 12; // 12 rows of pegs
  private readonly multipliers = [0.1, 0.3, 0.5, 1.0, 1.5, 2.0, 1.5, 1.0, 0.5, 0.3, 0.1]; // 11 slots

  validateInput(input: PlinkoInput): boolean {
    return (
      input.bet >= this.config.minScreenTimeDelta &&
      input.bet <= this.config.maxScreenTimeDelta &&
      typeof input.bet === 'number' &&
      !isNaN(input.bet)
    );
  }

  play(input: PlinkoInput, seed: number): GameOutcome & { display: PlinkoDisplay } {
    const random = new SeededRandom(seed);
    const { bet: betAmount } = input;

    // Generate chip path through pegs
    const path = this.generateChipPath(random);
    const finalSlot = this.calculateFinalSlot(path);
    const multiplier = this.multipliers[finalSlot];
    
    // Calculate payout
    const rawPayout = betAmount * multiplier;
    let screenTimeDelta = 0;
    let result: 'win' | 'loss' | 'push';

    if (multiplier >= 1.0) {
      // Win: gain screen time
      screenTimeDelta = Math.round(rawPayout - betAmount);
      result = screenTimeDelta > 0 ? 'win' : 'push';
    } else {
      // Loss: lose screen time
      screenTimeDelta = -Math.round(betAmount * (1 - multiplier));
      result = 'loss';
    }

    // Generate chip position coordinates for animation
    const chipPosition = this.generateChipPositions(path);

    return {
      result,
      screenTimeDelta,
      displayData: {
        path,
        finalSlot,
        multiplier,
        chipPosition,
      },
      display: {
        path,
        finalSlot,
        multiplier,
        chipPosition,
      },
    };
  }

  private generateChipPath(random: SeededRandom): number[] {
    const path: number[] = [];
    
    // Each row, chip can go left (0) or right (1)
    for (let row = 0; row < this.pegs; row++) {
      path.push(random.next() < 0.5 ? 0 : 1);
    }
    
    return path;
  }

  private calculateFinalSlot(path: number[]): number {
    // Start at center position (0)
    let position = 0;
    
    // Each decision moves left (-1) or right (+1) 
    for (const direction of path) {
      position += direction === 0 ? -1 : 1;
    }
    
    // Convert to slot index (0 to multipliers.length-1)
    const centerSlot = Math.floor(this.multipliers.length / 2);
    const slot = centerSlot + position;
    
    // Clamp to valid range
    return Math.max(0, Math.min(this.multipliers.length - 1, slot));
  }

  private generateChipPositions(path: number[]): { row: number; position: number }[] {
    const positions: { row: number; position: number }[] = [];
    let currentPosition = 0; // Start at center (position 0)
    
    positions.push({ row: 0, position: currentPosition });
    
    for (let row = 0; row < path.length; row++) {
      const direction = path[row];
      // Move left (-1) or right (+1) based on direction
      currentPosition += direction === 0 ? -1 : 1;
      positions.push({ row: row + 1, position: currentPosition });
    }
    
    return positions;
  }
}