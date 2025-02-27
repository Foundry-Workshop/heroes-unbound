import {BaseActorDataModel} from "./BaseActorDataModel.mjs";
import {CharacteristicsModel} from "./parts/CharacteristicsModel.mjs";
import {CombatModel} from "./parts/CombatModel.js";

const fields = foundry.data.fields;

export class HeroDataModel extends BaseActorDataModel {

  static defineSchema() {
    const schema = super.defineSchema();

    schema.realName = new fields.StringField();

    schema.xp = new fields.SchemaField({
      earned: new fields.NumberField({initial: 0, min: 0, integer: false, positive: false}),
      used: new fields.NumberField({initial: 0, min: 0, integer: false, positive: false})
    });

    schema.title = new fields.StringField();

    schema.statements = new fields.SchemaField({
      first: new fields.StringField(),
      second: new fields.StringField(),
    })

    schema.notes = new fields.HTMLField();

    schema.characteristics = new fields.EmbeddedDataField(CharacteristicsModel);

    schema.combat = new fields.EmbeddedDataField(CombatModel);

    return schema;
  }

  prepareDerivedData() {
    if (this.combat.initiative?.physical === null)
      this.combat.initiative.physical = this.characteristics.dexterity.value;
    if (this.combat.combatValue?.physical === null)
      this.combat.combatValue.physical = this.characteristics.dexterity.value;

    if (this.combat.initiative?.mental === null)
      this.combat.initiative.mental = this.characteristics.ego.value;
    if (this.combat.combatValue?.mental === null)
      this.combat.combatValue.mental = this.characteristics.ego.value;


    if (this.combat.stunned === null)
      this.combat.stunned = this.characteristics.stunned.value;
    if (this.combat.recovery === null)
      this.combat.recovery = this.characteristics.recovery.value;


    if (this.combat.body.max === null)
      this.combat.body.max = this.characteristics.body.value;
    if (this.combat.knockout.max === null)
      this.combat.knockout.max = this.characteristics.knockout.value;
    if (this.combat.endurance.max === null)
      this.combat.endurance.max = this.characteristics.endurance.value;

    if (this.combat.body.value === null)
      this.combat.body.value = this.combat.body.max;
    if (this.combat.knockout.value === null)
      this.combat.knockout.value = this.combat.knockout.max;
    if (this.combat.endurance.value === null)
      this.combat.endurance.value = this.combat.endurance.max;


    if (this.combat.defense?.ordinary?.value === null)
      this.combat.defense.ordinary.value = this.characteristics.ordinary.value;
    if (this.combat.defense?.resistant?.value === null)
      this.combat.defense.resistant.value = this.characteristics.resistant.value;
    if (this.combat.defense?.total?.value === null)
      this.combat.defense.total.value = this.characteristics.total.value;

    this.xp.left = this.xp.earned - this.xp.used;
  }

  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    let preCreateData = {};

    if (!data.system?.characteristics) {
      foundry.utils.mergeObject(preCreateData, {
        "system.characteristics.strength.value": "2d6",
        "system.characteristics.presence.value": "2d6",

        "system.characteristics.body.value": 10,
        "system.characteristics.recovery.value": 10,
        "system.characteristics.stunned.value": 10,
        "system.characteristics.knockout.value": 20,
        "system.characteristics.endurance.value": 30,

        "system.characteristics.ordinary.value": 10,
        "system.characteristics.resistant.value": 10,
        "system.characteristics.total.value": 10,

        "system.characteristics.speed.value": 1,

        "system.characteristics.dexterity.value": 11,
        "system.characteristics.intelligence.value": 11,
        "system.characteristics.ego.value": 11,
      });
    }

    this.parent.updateSource(preCreateData);
  }
}