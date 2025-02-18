import Utility from "../../../utility/Utility.mjs";
import BaseItemSheet from "./BaseItemSheet.mjs";
import {debug} from "../../../utility/Debug.mjs";

export default class PowerSheet extends BaseItemSheet {

  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["power"]
  };

  static templates = {
    power: 'sheets/item/power.hbs',
  }

  static PARTS = {
    header: {template: Utility.getTemplate(BaseItemSheet.templates.header), classes: ["sheet-header"]},
    power: {template: Utility.getTemplate(PowerSheet.templates.power)},
  }

  async _handleEnrichment() {
    const enrichment = {};

    enrichment["system.description"] = await TextEditor.enrichHTML(this.item.system.description, {});

    debug("[BaseItemSheet] _handleEnrichment", {sheet: this, enrichment});
    return foundry.utils.expandObject(enrichment);
  }

}
