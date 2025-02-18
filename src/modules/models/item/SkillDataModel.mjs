import {BaseItemDataModel} from "./BaseItemDataModel.mjs";

const fields = foundry.data.fields;

export class SkillDataModel extends BaseItemDataModel  {
  static defineSchema() {
    const schema = super.defineSchema();

    schema.description = new fields.HTMLField()

    return schema;
  }

  get canPostToChat() {
    return true;
  }

  get chatData() {
    let content = super.chatData;

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