/**
 * Plinko Game Engine
 * Drop chips down a pegboard to hit multiplier slots at the bottom
 */

import { GameEngine, GameOutcome, GameConfig, SeededRandom } from '../types';

export interface PlinkoConfig extends GameConfig {
  pegs: number; // Number of peg rows
  multipliers: number[]; // Multiplier values for each slot
}

export interface PlinkoOutcome extends GameOutcome {
  display: {
    path: number[]; // Path the chip took (left/right decisions)
    finalSlot: number; // Which slot chip landed in
    multiplier: number; // Multiplier value of final slot
    chipPosition: { row: number; position: number }[]; // Full path coordinates
  };
}

export class PlinkoEngine implements GameEngine<PlinkoConfig, PlinkoOutcome> {
  readonly config: PlinkoConfig = {
    winProbability: 0.35,
    lossProbability: 0.65,
    minScreenTimeDelta: 10,
    maxScreenTimeDelta: 80,
    dailyCap: 150,
    pegs: 12, // 12 rows of pegs
    multipliers: [0.1, 0.3, 0.5, 1.0, 1.5, 2.0, 1.5, 1.0, 0.5, 0.3, 0.1], // 11 slots
  };

  play(bet: { bet: number }, seed: number): PlinkoOutcome {
    const random = new SeededRandom(seed);
    const { bet: betAmount } = bet;

    // Generate chip path through pegs
    const path = this.generateChipPath(random);
    const finalSlot = this.calculateFinalSlot(path);
    const multiplier = this.config.multipliers[finalSlot];
    
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
    for (let row = 0; row < this.config.pegs; row++) {
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
    const centerSlot = Math.floor(this.config.multipliers.length / 2);
    const slot = centerSlot + position;
    
    // Clamp to valid range
    return Math.max(0, Math.min(this.config.multipliers.length - 1, slot));
  }

  private generateChipPositions(path: number[]): { row: number; position: number }[] {
    const positions: { row: number; position: number }[] = [];
    let currentPosition = 0; // Start at center
    
    positions.push({ row: 0, position: currentPosition });
    
    for (let row = 0; row < path.length; row++) {
      const direction = path[row];
      currentPosition += direction === 0 ? -1 : 1;
      positions.push({ row: row + 1, position: currentPosition });
    }
    
    return positions;
  }
}