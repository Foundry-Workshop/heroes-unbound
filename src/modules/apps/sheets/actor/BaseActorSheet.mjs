import BaseSheetMixin from "../BaseSheet.mjs";
import {debug} from "../../../utility/Debug.mjs";

const {ActorSheetV2} = foundry.applications.sheets;

/**
 * @extends ActorSheetV2
 * @mixes BaseSheetMixin
 */
export default class BaseActorSheet extends BaseSheetMixin(ActorSheetV2) {

  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    actions: {
      createItem: this._onCreateItem,
      editItem: this._onEditItem,
      postItem: this._onPostItem,
    },
    classes: ["actor"],
    position: {
      height: 650,
      width: 560
    }
  };

  static PARTS = {};

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.actor = this.actor;
    context.items = foundry.utils.deepClone(this.actor.itemTypes);
    Object.keys(context.items).forEach(type => {
      context.items[type] = context.items[type].sort((a, b) => a.sort > b.sort ? 1 : -1);
    });

    for (const item of this.actor.items) {
      if (!item.system.enrichable) continue;

      await item.system.enrich();
    }

    debug("[BaseActorSheet] _prepareContext", {sheet: this, context, options});
    return context;
  }

  static async _onCreateItem(event) {
    const type = await this._getType(event);
    const data = {
      name: game.i18n.format("DOCUMENT.New", {type: game.i18n.localize(CONFIG.Item.typeLabels[type])}),
      type
    };

    const items = await this.actor.createEmbeddedDocuments("Item", [data]);
    await items[0]?.sheet?.render(true);
    debug("[BaseActorSheet] Item Created", {sheet: this, type, data, item: items[0]});
  }

  static async _onEditItem(event) {
    const document = await this._getDocumentAsync(event);

    if (document)
      document.sheet.render(true);

    debug("[BaseActorSheet] Item Edit", {sheet: this, item: document});
  }

  static async _onPostItem(event) {
    const document = await this._getDocumentAsync(event);

    if (document?.canPostToChat)
      document.toChat({actor: this.actor});

    debug("[BaseActorSheet] Item Posted to Chat", {sheet: this, item: document});
  }

  _getContentMenuOptions() {
    return [
      {
        name: "Edit",
        icon: '<i class="fas fa-edit"></i>',
        condition: li => this.isEditable && (!!li.data("uuid") || !!li.parents("[data-uuid]")),
        callback: async li => {
          const uuid = li.data("uuid") || li.parents("[data-uuid]").data("uuid");
          const document = await fromUuid(uuid);
          document.sheet.render(true);
          debug("[BaseActorSheet] Item Edit from Context Menu", {sheet: this, item: document});
        }
      },
      {
        name: "Post to Chat",
        icon: '<i class="fas fa-comment"></i>',
        condition: li => (!!li.data("chat") && !!li.data("uuid")) || (!!li.parents("[data-uuid]") && !!li.parents("[data-chat]")),
        callback: async li => {
          const uuid = li.data("uuid") || li.parents("[data-uuid]").data("uuid");
          const document = await fromUuid(uuid);

          if (document.canPostToChat) {
            document.toChat({actor: this.actor});
            debug("[BaseActorSheet] Item Posted to Chat from Context Menu", {sheet: this, item: document});
          }
        }
      },
      {
        name: "Remove",
        icon: '<i class="fas fa-times"></i>',
        condition: li => this.isEditable && (!!li.data("uuid") || !!li.parents("[data-uuid]")),
        callback: async li => {
          const uuid = li.data("uuid") || li.parents("[data-uuid]").data("uuid");
          const document = await fromUuid(uuid);
          document.delete();
          debug("[BaseActorSheet] Item Deleted from Context Menu", {sheet: this, item: document});
        }
      }
    ];
  }
}
