export interface HighFrequencyConfigs {
  basePx: number;
  maxPendingBooks: number;
}
export class HighFrequency {
  private _instId: InstId;
  private _configs: HighFrequencyConfigs;
  constructor(instId: InstId, configs: HighFrequencyConfigs) {
    this._instId = instId;
    this._configs = configs;
  }
}
