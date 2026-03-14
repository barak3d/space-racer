// AIOpponent.js — לוגיקת חלליות מחשב (יריבות)

import { AI_OPPONENTS, GAME_SETTINGS, DIFFICULTY_LEVELS } from '../config.js';

export default class AIOpponent {
  constructor(config) {
    this.name = config.name;
    this.color = config.color;
    this.baseSpeed = config.speed;
    this.accuracy = config.accuracy;
    this.description = config.description;

    this.station = 0; // 0 = start, 1-5 = stations
    this.progress = 0; // 0-1 progress within current segment
    this.stationTimer = 0;
    this.solvingStation = false;
    this.puzzlesSolved = 0;
    this.finished = false;
    this.totalProgress = 0; // 0-1 overall race progress
  }

  reset() {
    this.station = 0;
    this.progress = 0;
    this.stationTimer = 0;
    this.solvingStation = false;
    this.puzzlesSolved = 0;
    this.finished = false;
    this.totalProgress = 0;
  }

  /**
   * Advance the AI by a given number of seconds (simulate catch-up while player was at station).
   */
  advanceByTime(seconds, playerStation, difficultyLevel) {
    if (this.finished) return;
    const step = 0.25;
    let remaining = seconds;
    while (remaining > 0) {
      const dt = Math.min(step, remaining);
      this.update(dt, playerStation, difficultyLevel);
      remaining -= dt;
      if (this.finished) break;
    }
  }

  update(dt, playerStation, difficultyLevel) {
    if (this.finished) return;

    const totalStations = GAME_SETTINGS.totalStations;
    const puzzlesPerStation = GAME_SETTINGS.puzzlesPerStation;
    const lvlCfg = DIFFICULTY_LEVELS[difficultyLevel] || DIFFICULTY_LEVELS[1];

    if (this.solvingStation) {
      // AI is "solving" puzzles at a station
      this.stationTimer += dt;

      // Time per puzzle — faster than before so AI is a real competitor
      const baseSolveTime = lvlCfg.timePerPuzzle * 0.25;
      const solveTime = baseSolveTime / this.baseSpeed + (Math.random() - 0.5) * 2;

      if (this.stationTimer >= solveTime) {
        this.puzzlesSolved++;
        this.stationTimer = 0;

        // Did AI get it right?
        const gotRight = Math.random() < this.accuracy;

        if (this.puzzlesSolved >= puzzlesPerStation) {
          // Done with station
          this.solvingStation = false;
          this.puzzlesSolved = 0;
          this.station++;
          this.progress = 0;

          if (this.station >= totalStations + 1) {
            this.finished = true;
          }
        }
      }
    } else {
      // AI is traveling toward next station — faster travel (removed old * 0.5)
      const travelSpeed = this.baseSpeed * (0.8 + Math.random() * 0.4) * dt * 1.2;
      this.progress += travelSpeed;

      // Stronger rubber-banding: if AI is far behind player, speed up significantly
      if (this.station < playerStation - 1) {
        this.progress += dt * 0.4;
      }
      // If AI is far ahead, slow down more noticeably
      if (this.station > playerStation + 1) {
        this.progress -= dt * 0.1;
      }

      if (this.progress >= 1) {
        this.progress = 1;
        this.solvingStation = true;
        this.stationTimer = 0;
        this.puzzlesSolved = 0;
      }
    }

    // Calculate total progress — clear, segment-based formula
    const stationProgress = this.solvingStation
      ? this.puzzlesSolved / puzzlesPerStation
      : 0;

    const segmentSize = 1 / (totalStations + 1);
    const completedProgress = this.station * segmentSize;
    const currentSegment = this.solvingStation
      ? stationProgress * segmentSize * 0.5
      : this.progress * segmentSize;

    this.totalProgress = Math.min(1, completedProgress + currentSegment);
  }

  getProgress() {
    return this.totalProgress;
  }

  getStation() {
    return this.station;
  }

  isFinished() {
    return this.finished;
  }

  // Get effective X position on track
  getTrackPosition(trackStartX, trackEndX) {
    return trackStartX + this.totalProgress * (trackEndX - trackStartX);
  }
}

// Create default opponents from config
export function createOpponents() {
  return AI_OPPONENTS.map(cfg => new AIOpponent(cfg));
}
