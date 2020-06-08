export class ProductionCode {
  season: Number;
  episode: Number;

  constructor(prod_code: number) {
    this.season = new Number((prod_code / 100).toFixed());
    this.episode = prod_code % 100;
  }

  toShortString(){
    return 'S' + this.season + ' E' + this.episode;
  }

  toString(){
    return 'Season ' + this.season + ', Episode ' + this.episode;
  }
}
