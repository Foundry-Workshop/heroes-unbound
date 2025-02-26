import ValueDialog from "../apps/ValueDialog.mjs";

export default class EffectRoll extends Roll {
  #coreParts = [];
  #coreResult = [];
  #coreTotal;
  #stunParts;

  constructor(formula, data={}, options={}) {
    super(formula, data, options);

    if (data.actor)
      this.actor = data.actor;
  }

  get coreResult() {
    if (!this._evaluated)
      return undefined;

    return this.#coreResult;
  }

  get coreTotal() {
    if (!this._evaluated)
      return undefined;

    return this.#coreTotal;
  }

  get coreParts() {
    if (!this._evaluated)
      return undefined;

    return this.#coreParts;
  }

  get stunParts() {
    if (!this._evaluated)
      return undefined;

    return this.#stunParts;
  }

  get stunTotal() {
    return this.total;
  }

  get rolls() {
    return this.terms[0].results.map(r => {
      return {
        result: String(r.result),
        classes: r.result === 1 ? "min" : r.result === 6 ? "max" : ""
      };
    });
  }

  async evaluate({minimize = false, maximize = false, allowStrings = false, allowInteractive = true, ...options} = {}) {
    const roll = await super.evaluate({minimize, maximize, allowStrings, allowInteractive, ...options});

    this._evaluateCoreResult();

    return roll;
  }

  _evaluateCoreResult() {
    let result = [];
    let parts = [];
    let coreParts = [];
    let total = 0;

    for (const die of this.dice) {
      const termResult = this._getDieCoreResult(die);
      if (!termResult) continue;

      result.push(termResult);
      parts.push(termResult.parts);
      coreParts.push(termResult.coreParts);
      total += termResult.sum;
    }

    this.#coreResult = result;
    this.#coreTotal = total;
    this.#coreParts = coreParts;
    this.#stunParts = parts;
  }

  _getDieCoreResult(die) {
    if (die._faces !== 6)
      return null;

    let coreParts = [];
    let parts = [];
    let sum = 0;

    for (const result of die.results) {
      if (!result.active) continue;

      let value;
      switch (result.result) {
        case 1:
          value = 0;
          break;
        case 6:
          value = 2;
          break;
        default:
          value = 1;
      }

      sum += value;
      coreParts.push(value);
      parts.push(result.result); 
    }

    return {parts, coreParts, sum};
  }

  async toMessage(messageData={}, {rollMode, create=true}={}) {
    messageData = await super.toMessage(messageData, {rollMode, create: false});

    const content = await renderTemplate("systems/heroes-unbound/templates/sheets/rolls/effect-roll.hbs", this);

    messageData = foundry.utils.mergeObject(messageData, {
      flavor: game.i18n.localize("Champions.Rolls.Effect"),
      speaker: ChatMessage.getSpeaker({actor: this.actor}),
      content
    });

    const cls = getDocumentClass("ChatMessage");
    const msg = new cls(messageData);

    if (create)
      return await cls.create(msg, {rollMode});

    return msg.toObject();
  }

  static fromData(data) {
    const roll = super.fromData(data);

    roll._evaluateCoreResult();

    return roll;
  }

  static async prompt(data = {}) {
    let count = await ValueDialog.create({
      title: "Champions.Dialogs.EffectRoll.Title",
      text: "Champions.Dialogs.EffectRoll.Text",
      defaultValue: 3,
      type: Number
    });

    count = Math.max(count, 1);

    const formula = `${count}d6`;
    const roll = new EffectRoll(formula, data);
    const message = await roll.toMessage();

    return {roll, message, formula};
  }

  render(){}
}