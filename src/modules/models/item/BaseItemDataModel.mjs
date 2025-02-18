const fields = foundry.data.fields;

export class BaseItemDataModel extends foundry.abstract.TypeDataModel {
  enriched = {};

  static defineSchema() {
    return {};
  }

  get canPostToChat() {
    return false;
  }

  get chatData() {
    return '';
  }

  get enrichable() {
    return false;
  }

  async enrich() {
  }

  toEmbed(config, options) {
    return null;
  }
}