import {CharacteristicModel} from "./CharacteristicModel.mjs";
import {DieCharacteristicModel} from "./DieCharacteristicModel.mjs";

const fields = foundry.data.fields;

export class CharacteristicsModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      strength: new fields.EmbeddedDataField(DieCharacteristicModel),
      presence: new fields.EmbeddedDataField(DieCharacteristicModel),

      body: new fields.EmbeddedDataField(CharacteristicModel),
      stunned: new fields.EmbeddedDataField(CharacteristicModel),
      recovery: new fields.EmbeddedDataField(CharacteristicModel),
      knockout: new fields.EmbeddedDataField(CharacteristicModel),
      endurance: new fields.EmbeddedDataField(CharacteristicModel),

      ordinary: new fields.EmbeddedDataField(CharacteristicModel),
      resistant: new fields.EmbeddedDataField(CharacteristicModel),
      total: new fields.EmbeddedDataField(CharacteristicModel),

      speed: new fields.EmbeddedDataField(CharacteristicModel),

      dexterity: new fields.EmbeddedDataField(CharacteristicModel),
      intelligence: new fields.EmbeddedDataField(CharacteristicModel),
      ego: new fields.EmbeddedDataField(CharacteristicModel),
    };
  }
}