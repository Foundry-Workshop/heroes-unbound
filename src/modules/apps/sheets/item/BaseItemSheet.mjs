import BaseSheetMixin from "../BaseSheet.mjs";
import {debug} from "../../../utility/Debug.mjs";

const {ItemSheetV2} = foundry.applications.sheets;

/**
 * @extends ItemSheetV2
 * @mixes BaseSheetMixin
 */
export default class BaseItemSheet extends BaseSheetMixin(ItemSheetV2) {

  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["item"],
    position: {
      height: 400,
      width: 350
    },
  };

  static templates = {
    header: 'sheets/item/header.hbs',
  }

  static PARTS = {}

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.item = this.item;

    debug("[BaseItemSheet] _prepareContext", {sheet: this, context, options});
    return context;
  }

  async _handleEnrichment() {
    const enrichment = {};

    return foundry.utils.expandObject(enrichment);
  }

  async _preClose(options) {
    const description = this.element.querySelector(".editor-content").innerHTML;
    await this.submit({updateData: {"system.description": description}});
    await super._preClose(options);
  }
}
