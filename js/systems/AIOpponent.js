// AIOpponent.js — לוגיקת חלליות מחשב (יריבות)

import { AI_OPPONENTS, AI_DIFFICULTY_SCALING, GAME_SETTINGS, DIFFICULTY_LEVELS } from '../config.js';

const AI_TRAVEL_BASE_PACE = 0.34;
const AI_LAUNCH_BOOST = 0.08;
const AI_INITIAL_TRAVEL_MULTIPLIER = 0.9;
const AI_POST_STATION_TRAVEL_MULTIPLIER = 0.95;
const AI_RETRY_TIME_MULTIPLIER = 0.6;
const AI_CADENCE_BASE = 0.94;
const AI_CADENCE_FREQUENCY = 1.7;
const AI_CADENCE_AMPLITUDE = 0.08;
const AI_CATCHUP_THRESHOLD = 0.03;
const AI_MAX_CATCHUP_BOOST = 0.04;
const AI_CATCHUP_FACTOR = 0.2;
const AI_SLOWDOWN_THRESHOLD = -0.08;
const AI_MAX_SLOWDOWN = 0.02;
const AI_SLOWDOWN_FACTOR = 0.08;
const AI_MIN_TRAVEL_SPEED = 0.18;
const AI_BOOSTING_GAP_THRESHOLD = 0.05;
const AI_BOOSTING_TIME_THRESHOLD = 0.05;
const AI_MIN_SOLVE_TIME = 2.2;
const AI_MIN_SOLVE_PACE = 0.05;
const AI_MAX_PRESSURE_BONUS = 0.18;
const AI_PRESSURE_BONUS_FACTOR = 0.9;
const AI_ACCURACY_BASELINE = 0.85;
const AI_ACCURACY_PENALTY = 0.35;
const AI_JITTER_BASE = 0.88;
const AI_JITTER_RANGE = 0.24;
const AI_INITIAL_BOOST_BASE = 1.1;
const AI_INITIAL_BOOST_VARIANCE = 0.5;
const AI_CADENCE_PHASE_RANGE = Math.PI * 2;
const AI_BASE_SOLVE_PACE = 0.2;
const AI_MAX_PUZZLE_ATTEMPTS = 3;
const AI_MAX_ACCURACY = 0.95;
const AI_MIN_ACCURACY = 0.4;

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
    this.puzzleAttempts = 0;
    this.finished = false;
    this.totalProgress = 0; // 0-1 overall race progress
    this._initializeRaceMotion();
  }

  reset() {
    this.station = 0;
    this.progress = 0;
    this.stationTimer = 0;
    this.solvingStation = false;
    this.puzzlesSolved = 0;
    this.puzzleAttempts = 0;
    this.finished = false;
    this.totalProgress = 0;
    this._initializeRaceMotion();
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
    const normalizedPlayerProgress = Math.max(0, Math.min(1, playerProgress || 0));
    const progressGap = normalizedPlayerProgress - this.totalProgress;
    this.travelTimer += dt;

    if (this.solvingStation) {
      // AI is "solving" puzzles at a station
      this.stationTimer += dt;
      this.boosting = false;

      if (!this.nextSolveTime) {
        this.nextSolveTime = this._createSolveTime(lvlCfg, progressGap);
      }

      if (this.stationTimer >= this.nextSolveTime) {
        this.stationTimer = 0;
        this.puzzleAttempts++;

        // Did AI get it right?
        const gotRight = Math.random() < this.accuracy;
        const solvedCurrentPuzzle = gotRight || this.puzzleAttempts >= AI_MAX_PUZZLE_ATTEMPTS;

        if (solvedCurrentPuzzle) {
          this.puzzlesSolved++;
          this.puzzleAttempts = 0;
        }

        if (this.puzzlesSolved >= puzzlesPerStation) {
          // Done with station
          this.solvingStation = false;
          this.puzzlesSolved = 0;
          this.puzzleAttempts = 0;
          this.station++;
          this.progress = 0;
          this.nextSolveTime = 0;
          this.launchBoostTime = 0.3 + Math.random() * 0.35;
          this.currentTravelSpeed = Math.max(
            this.currentTravelSpeed,
            AI_TRAVEL_BASE_PACE * this.baseSpeed * AI_POST_STATION_TRAVEL_MULTIPLIER,
          );

          if (this.station >= totalStations + 1) {
            this.finished = true;
          }
        } else if (!solvedCurrentPuzzle) {
          this.nextSolveTime = this._createRetrySolveTime(lvlCfg, progressGap);
        }

        if (!this.solvingStation) {
          this.boosting = this.launchBoostTime > 0;
        } else if (solvedCurrentPuzzle) {
          this.nextSolveTime = this._createSolveTime(lvlCfg, progressGap);
        }
      }
    } else {
      const cadence = AI_CADENCE_BASE
        + Math.sin(this.travelTimer * AI_CADENCE_FREQUENCY + this.cadencePhase) * AI_CADENCE_AMPLITUDE;
      let desiredSpeed = AI_TRAVEL_BASE_PACE * this.baseSpeed * cadence;

      if (progressGap > AI_CATCHUP_THRESHOLD) {
        desiredSpeed += Math.min(AI_MAX_CATCHUP_BOOST, progressGap * AI_CATCHUP_FACTOR);
      } else if (progressGap < AI_SLOWDOWN_THRESHOLD) {
        desiredSpeed -= Math.min(AI_MAX_SLOWDOWN, Math.abs(progressGap) * AI_SLOWDOWN_FACTOR);
      }

      if (this.launchBoostTime > 0) {
        desiredSpeed += AI_LAUNCH_BOOST;
        this.launchBoostTime = Math.max(0, this.launchBoostTime - dt);
      }

      this.currentTravelSpeed += (desiredSpeed - this.currentTravelSpeed) * Math.min(1, dt * 4);
      this.currentTravelSpeed = Math.max(AI_MIN_TRAVEL_SPEED, this.currentTravelSpeed);
      this.progress = Math.min(1, this.progress + this.currentTravelSpeed * dt);
      this.boosting = this.launchBoostTime > AI_BOOSTING_TIME_THRESHOLD
        || progressGap > AI_BOOSTING_GAP_THRESHOLD;

      if (this.progress >= 1) {
        this.progress = 1;
        this.solvingStation = true;
        this.stationTimer = 0;
        this.puzzlesSolved = 0;
        this.puzzleAttempts = 0;
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
      ? Math.min(AI_MAX_PRESSURE_BONUS, progressGap * AI_PRESSURE_BONUS_FACTOR)
      : 0;
    const solvePace = Math.max(AI_MIN_SOLVE_PACE, AI_BASE_SOLVE_PACE - pressureBonus);
    const baseSolveTime = (levelConfig.timePerPuzzle * solvePace) / this.baseSpeed;
    const accuracyFactor = 1 + Math.max(0, AI_ACCURACY_BASELINE - this.accuracy) * AI_ACCURACY_PENALTY;
    const jitter = AI_JITTER_BASE + Math.random() * AI_JITTER_RANGE;
    return Math.max(AI_MIN_SOLVE_TIME, baseSolveTime * accuracyFactor * jitter);
  }

  _createRetrySolveTime(levelConfig, progressGap) {
    return this._createSolveTime(levelConfig, progressGap) * AI_RETRY_TIME_MULTIPLIER;
  }

  _initializeRaceMotion() {
    this.currentTravelSpeed = AI_TRAVEL_BASE_PACE * this.baseSpeed * AI_INITIAL_TRAVEL_MULTIPLIER;
    this.launchBoostTime = AI_INITIAL_BOOST_BASE + Math.random() * AI_INITIAL_BOOST_VARIANCE;
    this.nextSolveTime = 0;
    this.travelTimer = Math.random() * AI_CADENCE_PHASE_RANGE;
    this.cadencePhase = Math.random() * AI_CADENCE_PHASE_RANGE;
    this.boosting = true;
  }
}

// Create opponents scaled by difficulty level
export function createOpponents(difficultyLevel = 1) {
  const scaling = AI_DIFFICULTY_SCALING[difficultyLevel] || AI_DIFFICULTY_SCALING[1];
  return AI_OPPONENTS.map(cfg => new AIOpponent({
    ...cfg,
    speed: cfg.speed * scaling.speedMultiplier,
    accuracy: Math.min(AI_MAX_ACCURACY, Math.max(AI_MIN_ACCURACY, cfg.accuracy + scaling.accuracyBonus)),
  }));
}
