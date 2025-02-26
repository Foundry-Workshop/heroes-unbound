import BaseHeroesDocument from "./BaseHeroesDocument.mjs";

export default class HeroesActor extends BaseHeroesDocument(Actor) {
  getRollData() {
    return this._parseModelForRollData(this.system);
  }

  _parseModelForRollData(model) {
    let rollData = {};

    if (model instanceof foundry.abstract.DataModel) {
      if (model.getRollData instanceof Function)
        return model.getRollData();

      for (const field in model)
        rollData[field] = this._parseModelForRollData(model[field]);
    } else {
      return model;
    }

    return rollData;
  }
}