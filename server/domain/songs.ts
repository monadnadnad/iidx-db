export class SongNotFoundError extends Error {
  constructor(message = "Song not found") {
    super(message);
    this.name = "SongNotFoundError";
  }
}

export class ChartNotFoundError extends Error {
  constructor(message = "Chart not found") {
    super(message);
    this.name = "ChartNotFoundError";
  }
}

export class UnknownChartSlugError extends Error {
  constructor(message = "Chart slug not recognized") {
    super(message);
    this.name = "UnknownChartSlugError";
  }
}
