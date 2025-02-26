import FixedContextMenu from "../../ui/FixedContextMenu.mjs";
import {debug} from "../../utility/Debug.mjs";

const {HandlebarsApplicationMixin} = foundry.applications.api;

export default function BaseSheetMixin(BaseApplication) {
  /**
   * @extends DocumentSheetV2
   * @extends HandlebarsApplication
   * @mixes HandlebarsApplicationMixin
   */
  class ChampionsNowBaseSheet extends HandlebarsApplicationMixin(BaseApplication) {
    #dragDrop;

    constructor(options = {}) {
      super(options);
      this.#dragDrop = this.#createDragDropHandlers();
    }

    static DEFAULT_OPTIONS = {
      classes: ["heroes-unbound"],
      actions: {
        editImage: this._onEditImage,
      },
      window: {
        resizable: true
      },
      form: {
        submitOnChange: true,
        closeOnSubmit: false
      },
      dragDrop: [{dragSelector: '[data-uuid]:not([data-nodrag])', dropSelector: null}],
    };

    static PARTS = {}

    get isLimited() {
      return this.document?.getUserLevel(game.user) === CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED;
    }

    async _prepareContext(options) {
      const context = await super._prepareContext(options);

      if (this.document) {
        context.system = this.document.system;
        context.fields = this.document.system.schema.fields;
        context.source = this.document.toObject();
      }

      context.editable = this.isEditable;
      context.limited = this.isLimited;

      context.tabs = this._prepareTabs(options);
      context.enrichment = await this._handleEnrichment();

      debug("[BaseSheet] _prepareContext", {sheet: this, context, options});
      return context;
    }

    async _handleEnrichment() {
      const enrichment = {};

      return foundry.utils.expandObject(enrichment);
    }

    /**
     * Returns an array of DragDrop instances
     * @type {DragDrop[]}
     */
    get dragDrop() {
      return this.#dragDrop;
    }

    /**
     * Create drag-and-drop workflow handlers for this Application
     * @returns {DragDrop[]}     An array of DragDrop handlers
     * @private
     */
    #createDragDropHandlers() {
      return this.options.dragDrop.map((d) => {
        d.permissions = {
          dragstart: this._canDragStart.bind(this),
          drop: this._canDragDrop.bind(this),
        };
        d.callbacks = {
          dragstart: this._onDragStart.bind(this),
          dragover: this._onDragOver.bind(this),
          drop: this._onDrop.bind(this),
        };
        return new DragDrop(d);
      });
    }

    /**
     * Define whether a user is able to begin a dragstart workflow for a given drag selector
     * @param {string} selector       The candidate HTML selector for dragging
     * @returns {boolean}             Can the current user drag this selector?
     * @protected
     */
    _canDragStart(selector) {
      // game.user fetches the current user
      return this.isEditable;
    }


    /**
     * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
     * @param {string} selector       The candidate HTML selector for the drop target
     * @returns {boolean}             Can the current user drop on this selector?
     * @protected
     */
    _canDragDrop(selector) {
      // game.user fetches the current user
      return this.isEditable;
    }


    /**
     * Callback actions which occur at the beginning of a drag start workflow.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    async _onDragStart(event) {

      const el = event.currentTarget;
      if ('link' in event.target.dataset) {
        return;
      }

      // Extract the data you need
      let dragData = null;

      if (el.dataset.uuid) {
        let document = await fromUuid(el.dataset.uuid);
        dragData = document.toDragData();
      }


      if (!dragData) {
        return;
      }

      // Set data transfer
      event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }


    /**
     * Callback actions which occur when a dragged element is over a drop target.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    _onDragOver(event) {
    }


    /**
     * Callback actions which occur when a dragged element is dropped on a target.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    async _onDrop(event) {

      const data = TextEditor.getDragEventData(event);

      if (data.type && typeof this["_onDrop" + data.type] == "function") {
        this["_onDrop" + data.type](data, event);
      } else if (data.type === "custom") {
        await this._onDropCustom(data, event);
      }
      debug("[BaseSheet] _onDrop", {sheet: this, event, data});
    }

    async _onDropCustom(data, event) {
      Hooks.call(`${game.system.id}:dropCustomData`, this, data, event);
    }

    async _preparePartContext(partId, context, options) {
      context.partId = `${this.id}-${partId}`;
      if (context.tabs) {
        context.tab = context.tabs[partId];
      }

      let fn = this[`_prepare${partId.capitalize()}Context`]?.bind(this);
      if (typeof fn == "function") {
        fn(context);
      }

      debug("[BaseSheet] _preparePartContext", {sheet: this, partId, context, options});
      return context;
    }

    _prepareTabs(options) {
      if (!this.constructor.TABS)
        return;

      let tabs = foundry.utils.deepClone(this.constructor.TABS);

      for (let t in tabs) {
        tabs[t].active = this.tabGroups[tabs[t].group] === tabs[t].id;
        tabs[t].cssClass = tabs[t].active ? "active" : "";
        tabs[t].hidden = this.isLimited;
      }

      if (!Object.values(tabs).some(t => t.active) && this.options.defaultTab) {
        tabs[this.options.defaultTab].active = true;
        tabs[this.options.defaultTab].cssClass = "active";
        tabs[this.options.defaultTab].hidden = false;
      }

      debug("[BaseSheet] _prepareTabs", {sheet: this, tabs});
      return tabs;
    }

    async _onDropItem(data, ev) {
      let document = data.uuid ? await fromUuid(data.uuid) : data.data;
      if (document.actor?.uuid === this.actor.uuid) {
        return await this._onSortItem(document, ev);
      } else {
        return await this.document.createEmbeddedDocuments(data.type, [document]);
      }
    }

    async _onDropActiveEffect(data) {
      let document = await fromUuid(data.uuid);
      return await this.document.createEmbeddedDocuments(data.type, [document]);
    }

    _onRender(_context, _options) {
      super._onRender(context, _options);
      this.#dragDrop.forEach((d) => d.bind(this.element));
      this._addEventListeners();
      this._disableInputsWithoutPermissions()
    }

    _addEventListeners() {
      if (!this._contextMenu) {
        this._contextMenu = this._setupContextMenus();
      } else {
        this._contextMenu.forEach(menu => {
          menu.element = this.element;
          menu.bind();
        });
      }
    }

    _disableInputsWithoutPermissions() {
      if (this.isEditable) return;

      this.element.querySelectorAll('input').forEach(e => e.disabled = true);
    }

    _setupContextMenus() {
      return [
        FixedContextMenu.create(this, this.element, ".list-row:not(.nocontext)", this._getContentMenuOptions()),
        FixedContextMenu.create(this, this.element, ".context-menu", this._getContentMenuOptions(), {eventName: "click"}),
        FixedContextMenu.create(this, this.element, ".context-menu-alt", this._getContentMenuOptions())
      ];
    }

    _getContentMenuOptions() {
      return [];
    }

    async _processSubmitData(event, form, submitData) {
      let diffData = foundry.utils.diffObject(this.document.toObject(false), submitData)
      await this.document.update(diffData);
    }

    async _onSortItem(document, event) {
      let target = await this._getDocument(event);
      if (target) {
        let siblings = Array.from(this._getParent(event.target, ".list-content").querySelectorAll(".list-row")).map(i => fromUuidSync(i.dataset.uuid)).filter(i => i).filter(i => document.uuid !== i.uuid);
        let sorted = SortingHelpers.performIntegerSort(document, {target, siblings});

        await this.actor.updateEmbeddedDocuments(document.documentName, sorted.map(s => {
          return foundry.utils.mergeObject({
            _id: s.target.id,
          }, s.update);
        }));

        debug("[BaseSheet] _onSortItem", {sheet: this, target, siblings, sorted});
      }
    }

    // Shared listeners between different document sheets
    _getId(ev) {
      return this._getDataAttribute(ev, "id");
    };

    _getIndex(ev) {
      return Number(this._getDataAttribute(ev, "index"));
    };

    _getKey(ev) {
      return this._getDataAttribute(ev, "key");
    };

    _getType(ev) {
      return this._getDataAttribute(ev, "type");
    };

    _getPath(ev) {
      return this._getDataAttribute(ev, "path");
    };

    _getCollection(ev) {
      return this._getDataAttribute(ev, "collection") || "items";
    };

    _getUUID(ev) {
      return this._getDataAttribute(ev, "uuid");
    };

    _getList(ev, sheetDocument = false) {
      return foundry.utils.getProperty((sheetDocument ? this.document : (this._getDocument(ev) || this.document)), this._getPath(ev));
    };

    _getDataAttribute(ev, property) {
      let value = ev.target.dataset[property];

      if (!value) {
        const parent = this._getParent(ev.target, `[data-${property}]`);

        if (parent) {
          value = parent.dataset[property];
        }
      }

      return value;
    };

    _getParent(element, selector) {
      if (element.matches(selector))
        return element;

      if (!element.parentElement)
        return null;

      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      } else {
        return this._getParent(element.parentElement, selector);
      }
    };

    _getDocument(event) {
      const id = this._getId(event);
      const collection = this._getCollection(event);
      const uuid = this._getUUID(event);

      return (uuid ? fromUuidSync(uuid) : this.document[collection]?.get(id));
    };

    _getDocumentAsync(event) {
      const id = this._getId(event);
      const collection = this._getCollection(event);
      const uuid = this._getUUID(event);

      return (uuid ? fromUuid(uuid) : this.document[collection]?.get(id));
    };

    static async _onEditImage(event) {
      if (!this.isEditable) return;

      const attr = event.target.dataset.edit;
      const current = foundry.utils.getProperty(this.document, attr);
      const fp = new FilePicker({
        current,
        type: "image",
        callback: path => {
          this.document.update({img: path});
          debug("[BaseSheet] Image Edited", {sheet: this, event, atrr, current, path});
        },
        top: this.position.top + 40,
        left: this.position.left + 10
      });

      await fp.browse();
    }

    setPosition(position) {
      const minHeight = this.options.position?.height;

      if (minHeight && position?.height < minHeight)
        position.height = minHeight;

      return super.setPosition(position);
    }
  }

  return ChampionsNowBaseSheet;
}