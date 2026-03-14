// AIOpponent.js — לוגיקת חלליות מחשב (יריבות)

import { AI_OPPONENTS, GAME_SETTINGS, DIFFICULTY_LEVELS } from '../config.js';

const AI_TRAVEL_BASE_PACE = 0.34;
const AI_LAUNCH_BOOST = 0.08;

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
    this.currentTravelSpeed = AI_TRAVEL_BASE_PACE * this.baseSpeed * 0.9;
    this.launchBoostTime = 1.1 + Math.random() * 0.5;
    this.nextSolveTime = 0;
    this.raceTime = Math.random() * Math.PI * 2;
    this.boosting = true;
  }

  reset() {
    this.station = 0;
    this.progress = 0;
    this.stationTimer = 0;
    this.solvingStation = false;
    this.puzzlesSolved = 0;
    this.finished = false;
    this.totalProgress = 0;
    this.currentTravelSpeed = AI_TRAVEL_BASE_PACE * this.baseSpeed * 0.9;
    this.launchBoostTime = 1.1 + Math.random() * 0.5;
    this.nextSolveTime = 0;
    this.raceTime = Math.random() * Math.PI * 2;
    this.boosting = true;
  }

  /**
   * Advance the AI by a given number of seconds (simulate catch-up while player was at station).
   */
  advanceByTime(seconds, playerProgress, difficultyLevel) {
    if (this.finished) return;
    const step = 0.25;
    let remaining = seconds;
    while (remaining > 0) {
      const dt = Math.min(step, remaining);
      this.update(dt, playerProgress, difficultyLevel);
      remaining -= dt;
      if (this.finished) break;
    }
  }

  update(dt, playerProgress, difficultyLevel) {
    if (this.finished) return;

    const totalStations = GAME_SETTINGS.totalStations;
    const puzzlesPerStation = GAME_SETTINGS.puzzlesPerStation;
    const lvlCfg = DIFFICULTY_LEVELS[difficultyLevel] || DIFFICULTY_LEVELS[1];
    const rivalProgress = Math.max(0, Math.min(1, playerProgress || 0));
    const progressGap = rivalProgress - this.totalProgress;
    this.raceTime += dt;

    if (this.solvingStation) {
      // AI is "solving" puzzles at a station
      this.stationTimer += dt;
      this.boosting = false;

      if (!this.nextSolveTime) {
        this.nextSolveTime = this._createSolveTime(lvlCfg, progressGap);
      }

      if (this.stationTimer >= this.nextSolveTime) {
        this.stationTimer = 0;

        // Did AI get it right?
        const gotRight = Math.random() < this.accuracy;
        if (gotRight) {
          this.puzzlesSolved++;
        }

        if (this.puzzlesSolved >= puzzlesPerStation) {
          // Done with station
          this.solvingStation = false;
          this.puzzlesSolved = 0;
          this.station++;
          this.progress = 0;
          this.nextSolveTime = 0;
          this.launchBoostTime = 0.3 + Math.random() * 0.35;
          this.currentTravelSpeed = Math.max(this.currentTravelSpeed, AI_TRAVEL_BASE_PACE * this.baseSpeed * 0.95);

          if (this.station >= totalStations + 1) {
            this.finished = true;
          }
        } else {
          this.nextSolveTime = this._createSolveTime(lvlCfg, progressGap) * 0.6;
        }

        if (!this.solvingStation) {
          this.boosting = this.launchBoostTime > 0;
        } else if (gotRight) {
          this.nextSolveTime = this._createSolveTime(lvlCfg, progressGap);
        }
      }
    } else {
      const cadence = 0.94 + Math.sin(this.raceTime * 1.7 + this.baseSpeed) * 0.08;
      let desiredSpeed = AI_TRAVEL_BASE_PACE * this.baseSpeed * cadence;

      if (progressGap > 0.03) {
        desiredSpeed += Math.min(0.12, progressGap * 0.55);
      } else if (progressGap < -0.08) {
        desiredSpeed -= Math.min(0.06, Math.abs(progressGap) * 0.2);
      }

      if (this.launchBoostTime > 0) {
        desiredSpeed += AI_LAUNCH_BOOST;
        this.launchBoostTime = Math.max(0, this.launchBoostTime - dt);
      }

      this.currentTravelSpeed += (desiredSpeed - this.currentTravelSpeed) * Math.min(1, dt * 4);
      this.currentTravelSpeed = Math.max(0.18, this.currentTravelSpeed);
      this.progress = Math.min(1, this.progress + this.currentTravelSpeed * dt);
      this.boosting = this.launchBoostTime > 0.05 || progressGap > 0.05;

      if (this.progress >= 1) {
        this.progress = 1;
        this.solvingStation = true;
        this.stationTimer = 0;
        this.puzzlesSolved = 0;
        this.nextSolveTime = this._createSolveTime(lvlCfg, progressGap);
        this.boosting = false;
      }
    }

    const segmentSize = 1 / (totalStations + 1);
    const computedProgress = this.solvingStation
      ? (this.station + 1) * segmentSize
      : this.station * segmentSize + this.progress * segmentSize;

    this.totalProgress = Math.min(1, Math.max(this.totalProgress, computedProgress));
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

  isBoosting() {
    return this.boosting;
  }

  // Get effective X position on track
  getTrackPosition(trackStartX, trackEndX) {
    return trackStartX + this.totalProgress * (trackEndX - trackStartX);
  }

  _createSolveTime(levelConfig, progressGap) {
    const pressureBonus = progressGap > 0
      ? Math.min(0.18, progressGap * 0.9)
      : 0;
    const baseSolveTime = (levelConfig.timePerPuzzle * (0.2 - pressureBonus)) / this.baseSpeed;
    const accuracyFactor = 1 + Math.max(0, 0.85 - this.accuracy) * 0.35;
    const jitter = 0.88 + Math.random() * 0.24;
    return Math.max(2.2, baseSolveTime * accuracyFactor * jitter);
  }
}

// Create default opponents from config
export function createOpponents() {
  return AI_OPPONENTS.map(cfg => new AIOpponent(cfg));
}
