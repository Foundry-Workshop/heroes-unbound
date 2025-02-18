import Utility from "../../../utility/Utility.mjs";
import BaseItemSheet from "./BaseItemSheet.mjs";
import {debug} from "../../../utility/Debug.mjs";

export default class SituationSheet extends BaseItemSheet {

  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["situation"]
  };

  static templates = {
    situation: 'sheets/item/situation.hbs',
  }

  static PARTS = {
    header: {template: Utility.getTemplate(BaseItemSheet.templates.header), classes: ["sheet-header"]},
    situation: {template: Utility.getTemplate(SituationSheet.templates.situation)},
  }

  async _handleEnrichment() {
    const enrichment = {};

    enrichment["system.description"] = await TextEditor.enrichHTML(this.item.system.description, {});

    debug("[BaseItemSheet] _handleEnrichment", {sheet: this, enrichment});
    return foundry.utils.expandObject(enrichment);
  }

}
