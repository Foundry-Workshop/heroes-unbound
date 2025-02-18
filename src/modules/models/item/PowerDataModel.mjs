import {BaseItemDataModel} from "./BaseItemDataModel.mjs";

const fields = foundry.data.fields;

export class PowerDataModel extends BaseItemDataModel  {
  static defineSchema() {
    const schema = super.defineSchema();

    schema.description = new fields.HTMLField();
    schema.end = new fields.NumberField();

    return schema;
  }

  get canPostToChat() {
    return true;
  }

  get chatData() {
    let content = super.chatData;

    content += `<div style="display: flex; flex-direction: row; justify-content: space-evenly;">
                    <p><strong>${game.i18n.localize("Champions.Item.END")}:</strong> ${this.end}</p>
                </div>`;
    content += `<div>${this.description}</div>`;

    return content;
  }

  get enrichable() {
    return true;
  }

  async enrich() {
    await super.enrich();

    this.enriched.description = await TextEditor.enrichHTML(this.description);
  }
}