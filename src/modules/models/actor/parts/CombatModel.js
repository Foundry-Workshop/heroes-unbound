const fields = foundry.data.fields;

export class CombatModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      phases: new fields.NumberField({initial: 4}),

      initiative: new fields.SchemaField({
        physical: new fields.NumberField({nullable: true, min: 0}),
        mental: new fields.NumberField({nullable: true, min: 0}),
      }),

      combatValue: new fields.SchemaField({
        physical: new fields.NumberField({nullable: true, min: 0}),
        mental: new fields.NumberField({nullable: true, min: 0}),
      }),

      levels: new fields.StringField({nullable: false, blank: false, initial: "<p></p>"}),

      defense: new fields.SchemaField({
        ordinary: new fields.SchemaField({
          value: new fields.NumberField({nullable: true, min: 0}),
          notes: new fields.StringField({nullable: false, blank: false, initial: "<p></p>"}),
        }),
        resistant: new fields.SchemaField({
          value: new fields.NumberField({nullable: true, min: 0}),
          notes: new fields.StringField({nullable: false, blank: false, initial: "<p></p>"}),
        }),
        total: new fields.SchemaField({
          value: new fields.NumberField({nullable: true, min: 0}),
          notes: new fields.StringField({nullable: false, blank: false, initial: "<p></p>"}),
        }),
      }),

      stunned: new fields.NumberField({nullable: true, min: 0}),
      recovery: new fields.NumberField({nullable: true, min: 0}),

      body: new fields.SchemaField({
        value: new fields.NumberField({nullable: true, min: 0}),
        max: new fields.NumberField({nullable: true, min: 0}),
      }),

      knockout: new fields.SchemaField({
        value: new fields.NumberField({nullable: true, min: 0}),
        max: new fields.NumberField({nullable: true, min: 0}),
      }),

      endurance: new fields.SchemaField({
        value: new fields.NumberField({nullable: true, min: 0}),
        max: new fields.NumberField({nullable: true, min: 0}),
      }),
    };
  }

  get value() {
    return this.combatValue;
  }

  async savePhases(value) {
    if (Array.isArray(value)) {
      let phaseValue = 0;
      let i = 6;

      for (let phase of value) {
        i--;

        if (!!phase)
          phaseValue += 1 << i;
      }

      value = phaseValue;
    }

    await this.parent.parent.update({[this.schema.fieldPath + ".phases"]: value});
  }

  get Phases() {
    return [
      this.phases & 32,
      this.phases & 16,
      this.phases & 8,
      this.phases & 4,
      this.phases & 2,
      this.phases & 1
    ].map(v => !!v);
  }
}