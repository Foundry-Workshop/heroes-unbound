import Utility from "../../../utility/Utility.mjs";
import BaseItemSheet from "./BaseItemSheet.mjs";
import {debug} from "../../../utility/Debug.mjs";

export default class SkillSheet extends BaseItemSheet {

  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["skill"]
  };

  static templates = {
    situation: 'sheets/item/skill.hbs',
  }

  static PARTS = {
    header: {template: Utility.getTemplate(BaseItemSheet.templates.header), classes: ["sheet-header"]},
    situation: {template: Utility.getTemplate(SkillSheet.templates.situation)},
  }

  async _handleEnrichment() {
    const enrichment = {};

    enrichment["system.description"] = await TextEditor.enrichHTML(this.item.system.description, {});

    debug("[BaseItemSheet] _handleEnrichment", {sheet: this, enrichment});
    return foundry.utils.expandObject(enrichment);
  }

}
