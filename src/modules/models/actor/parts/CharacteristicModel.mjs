const fields = foundry.data.fields;

export class CharacteristicModel extends foundry.abstract.DataModel {

  static defineSchema() {
    return {
      value: new fields.NumberField(),
      details: new fields.HTMLField()
    };
  }

  async getPartialData(key, path) {
    return {
      label: game.i18n.localize(`Champions.Models.Actor.Characteristics.${key}`),
      name: `${path}.${key}.value`,
      key,
      value: this.value,
      details: this.details,
      enriched: await TextEditor.enrichHTML(this.details, {})
    }
  }

  getRollData() {
    return this.value;
  }
}