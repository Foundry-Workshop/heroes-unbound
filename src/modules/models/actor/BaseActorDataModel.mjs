const fields = foundry.data.fields;

export class BaseActorDataModel extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const schema = {};

    return schema;
  }

  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    let preCreateData = {};
    let defaultToken = game.settings.get("core", "defaultToken");

    defaultToken = foundry.utils.mergeObject({
      "prototypeToken.bar1": {"attribute": "combat.endurance"},
      "prototypeToken.bar2": {"attribute": "combat.knockout"},
      "prototypeToken.displayName": defaultToken?.displayName || CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      "prototypeToken.displayBars": defaultToken?.displayBars || CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      "prototypeToken.disposition": defaultToken?.disposition || CONST.TOKEN_DISPOSITIONS.NEUTRAL,
      "prototypeToken.name": data.name,
    }, defaultToken);

    // Set wounds, advantage, and display name visibility
    if (!data.prototypeToken) {
      foundry.utils.mergeObject(preCreateData, defaultToken);
    }

    this.parent.updateSource(preCreateData);
  }


  toEmbed(config, options) {
    return null;
  }
}