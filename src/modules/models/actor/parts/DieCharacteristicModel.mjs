import {CharacteristicModel} from "./CharacteristicModel.mjs";

const fields = foundry.data.fields;

export class DieCharacteristicModel extends CharacteristicModel {

  static defineSchema() {
    const schema = super.defineSchema();

    schema.value = new fields.StringField();

    return schema;
  }
}