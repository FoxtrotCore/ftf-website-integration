import {ProductionCode} from './ProductionCode';

export class Metadata {
  episode_number: Number;
  title: String;
  us_airdate: String;
  fr_airdate: String;
  production_code: ProductionCode;
  description: String;

  constructor(data: Object){
    this.episode_number = data['number'];
    this.title = data['eng_name'];
    this.us_airdate = data['us_airdate'];
    this.fr_airdate = data['fr_airdate'];
    this.production_code = new ProductionCode(data['prod_code']);
    this.description = data ['description'];
  }
}
