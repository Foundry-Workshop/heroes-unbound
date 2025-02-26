/**
 * License: https://github.com/Foundry-Workshop/heroes-unbound/blob/master/LICENSE
 *
 * Author: Wojciech "Forien" Szulc <mr.forien@gmail.com>
 */
const LINKS = {
  discord: 'https://discord.gg/XkTFv8DRDc',
  patreon: 'https://patreon.com/foundryworkshop/',
  email: 'mr.forien@gmail.com',
};

const constants = {
  systemPath: 'systems/heroes-unbound',
  systemId: 'heroes-unbound',
  systemLabel: 'Heroes Unbound',
  loopLimit: 100
};

const settings = {
  initialized: 'initialized',
  colourHeaders: 'colourHeaders',
};

const defaults = {
  initialized: "0.0.0",
  colourHeaders: true
};

const hooks = {
  init: 'ChampionsNow:init',
  setup: 'ChampionsNow:setup',
  i18nInit: 'ChampionsNow:i18nInit',
  ready: 'ChampionsNow:ready',
};

class Debug {
  static #debugSetting = 'debug';

  static get setting() {
    return Debug.#debugSetting;
  }

  /**
   * Prints current module's settings to console for reference
   */
  static logSettings() {
    Debug.debug('Current game settings:', Debug.summarizeSettings);
  }

  /**
   * Prints out the debug message along with additional data (if provided)
   *
   * @param {String} msg   Debug message
   * @param {any} data     Additional data to output next to the message
   */
  static debug(msg, data = '') {
    if (Debug.enabled)
      Utility.notify(msg, {type: 'debug', consoleOnly: true, data: data});
  }

  /**
   * Registers the setting with the Foundry to allow users to enable Debug mode
   */
  static registerSetting() {
    game.settings.register(constants.systemId, Debug.setting, {
      name: 'Champions.Settings.Debug.Enable',
      hint: 'Champions.Settings.Debug.EnableHint',
      scope: 'client',
      config: true,
      default: false,
      type: Boolean
    });
  }

  /**
   * Returns value of the "Debug mode enable" setting
   *
   * @return {boolean}
   */
  static get enabled() {
    return game.settings.get(constants.systemId, Debug.#debugSetting);
  }

  /**
   * Returns object of a quick settings summary
   *
   * @return {{}}
   */
  static get summarizeSettings() {
    const systemSettings = {};
    for (let [_key, setting] of game.settings.settings.entries()) {
      if (setting.namespace !== constants.systemId) continue;

      const name = setting.name ? game.i18n.localize(setting.name) : setting.key;
      systemSettings[name] = game.settings.get(constants.systemId, setting.key);
    }

    return systemSettings;
  }
}

/**
 * Facade for the Debug.debug() function
 *
 * @param {String} msg   Debug message
 * @param {any} data     Additional data to output next to the message
 */
function debug(msg, data = '') {
  Debug.debug(msg, data);
}

class Utility {

  /**
   * Provides a single point of entry to handle all Module's notifications in a consistent manner
   *
   * @param {string} notification                       Text of the notification
   * @param {'error'|'warning'|'info'|'debug'} type     type of the notification
   * @param {boolean} permanent                         should the notification stay until closed?
   * @param {boolean} consoleOnly                       should the notification be suppressed and only shown in console?
   * @param {*} data                                    additional data to output in the console
   * @param {boolean} trace                             whether to use `console.trace()` instead of `console.log()`
   *
   * @return {false}
   */
  static notify(notification, {type = 'info', permanent = false, consoleOnly = false, data = '', trace = false} = {}) {
    // brand colour: '#3e1395' is too dark for dark mode console;
    const purple = 'purple';
    let colour;

    switch (type) {
      case 'error':
        colour = '#aa2222';
        trace = true;
        break;
      case 'warning':
        colour = '#aaaa22';
        trace = true;
        break;
      case 'debug':
        colour = '#5555ff';
        break;
      case 'info':
      default:
        colour = '#22aa22';
    }

    if (trace)
      console.trace(`🦊 %c${constants.systemLabel}: %c${notification}`, `color: ${purple}`, `color: ${colour}`, data);
    else
      console.log(`🦊 %c${constants.systemLabel}: %c${notification}`, `color: ${purple}`, `color: ${colour}`, data);

    if (!consoleOnly)
      ui?.notifications?.notify(notification, type, {permanent: permanent, console: false});

    return false;
  }

  /**
   * Provides a single point of entry to handle all Module's errors in a consistent manner
   *
   * @param {string} notification         Text of the notification
   * @param {Error} error                 original error object
   * @param {boolean} permanent           should the notification stay until closed?
   * @param {*} data                      additional data to output in the console
   *
   * @return {false}
   */
  static error(notification, {permanent = false, data = {}, error = null} = {}) {
    Utility.notify(notification, {type: 'error', consoleOnly: false, permanent, data});

    if (error)
      console.error(error);

    return false;
  }

  /**
   * Returns full module path for the template based on relative path/name only
   *
   * @param {string} template relative path / template's name
   *
   * @return {string}
   */
  static getTemplate(template) {
    if (typeof template !== 'string')
      return undefined;

    return `systems/${constants.systemId}/templates/${template}`;
  }

  /**
   * Preloads provided templates
   *
   * @param {{}} templates
   */
  static preloadTemplates(templates = {}) {
    debug("Preloading Templates.", {templates});
    templates = foundry.utils.flattenObject(templates);

    for (let [key, template] of Object.entries(templates)) {
      templates[key] = Utility.getTemplate(template);
      if (templates[key] === undefined) delete templates[key];
    }

    loadTemplates(templates).then((result) => {
      debug("Templates preloaded.", {templates, result});
    });
  }

  /**
   * Returns System's setting
   *
   * @param {string} setting name of the setting to retrieve
   *
   * @return {*}
   */
  static getSetting(setting) {
    return game.settings.get(constants.systemId, setting);
  }

  /**
   * Saves a System's setting
   *
   * @param {string} setting name of the setting to retrieve
   * @param {*}      value   value to save
   *
   * @return {*}
   */
  static async setSetting(setting, value) {
    return await game.settings.set(constants.systemId, setting, value);
  }

  static getHook(hook) {
    return `${constants.systemId}.${hook}`;
  }

  static isGmActive() {
    return game.users.some(user => user.isGM && user.active);
  }

  static get helpers() {
    return game.system.api.helpers;
  }

  static slugify(string) {
    return String(string)
      .normalize('NFKD') // split accented characters into their base characters and diacritical marks
      .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
      .trim() // trim leading or trailing whitespace
      .toLowerCase() // convert to lowercase
      .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/-+/g, '-'); // remove consecutive hyphens
  }
}

const getLuma = (hex) => {
  const c = hex.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >>  8) & 0xff;
  const b = (rgb >>  0) & 0xff;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

class FixedContextMenu extends ContextMenu {

  static create(app, html, selector, menuItems, {hookName = "EntryContext", ...options} = {}) {
    app._callHooks?.(className => `get${className}${hookName}`, menuItems);
    return new this(html, selector, menuItems, options);
  }

  /**
   * Set the position of the context menu, taking into consideration whether the menu should expand upward or downward
   * @param {jQuery} html                   The context menu element.
   * @param {jQuery} target                 The element that the context menu was spawned on.
   * @param {object} [options]
   * @param {PointerEvent} [options.event]  The event that triggered the context menu opening.
   * @protected
   */
  _setPosition(html, target, {event} = {}) {
    // Append to target and get the context bounds
    html.css("visibility", "hidden");
    html.css("top", event.clientY);
    html.css("left", event.clientX);
    html.addClass("heroes-unbound");

    $(document.body).append(html);
    // Display the menu
    html.toggleClass("expand-down");
    html.css("visibility", "");
    target.addClass("context");
  }

  render(target, options) {
    if (options.event.target.classList.contains("prevent-context") || ui.context.menu.length !== 0)
      return;

    super.render(target, options);
  }
}

const {HandlebarsApplicationMixin} = foundry.applications.api;

function BaseSheetMixin(BaseApplication) {
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
      this._disableInputsWithoutPermissions();
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
      let diffData = foundry.utils.diffObject(this.document.toObject(false), submitData);
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

const {ActorSheetV2} = foundry.applications.sheets;

/**
 * @extends ActorSheetV2
 * @mixes BaseSheetMixin
 */
class BaseActorSheet extends BaseSheetMixin(ActorSheetV2) {

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

const {DialogV2: DialogV2$1} = foundry.applications.api;

class ValueDialog extends DialogV2$1 {
  static create({text, title, defaultValue = "", type = String}) {
    text = game.i18n.localize(text);
    title = game.i18n.localize(title);

    const content = `
      <div class="value-dialog">
          <p>${text || "Enter Value"}</p>
          <input class="value" type="text" value="${defaultValue}">
      </div>
    `;

    return Dialog.wait({
      title: title || "Value Dialog",
      content: content,
      buttons: {
        submit: {
          label: game.i18n.localize("Submit"),
          callback: (html) => {
            return type(html.find(".value")[0]?.value);
          }
        }
      },
      default: "submit",
      close: () => {
        return null;
      }
    });
  }
}

class EffectRoll extends Roll {
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

const {DialogV2} = foundry.applications.api;

class ProseDialog extends DialogV2 {
  #title;

  static DEFAULT_OPTIONS = {
    position: {
      width: 500
    }
  };

  constructor(options) {
    super(options);

    this.#title = options.title || "Prose Dialog";
  }

  get title() {
    return game.i18n.localize(this.#title);
  }

  static async create({title = "", value = "", enrichedValue = null}) {
    title = game.i18n.localize(title);
    enrichedValue ??= await TextEditor.enrichHTML(value, {});

    const content = `
      <prose-mirror 
        name="system.description"  
        value="${value}"
        compact="true">
          ${enrichedValue}
      </prose-mirror>
    `;

    return ProseDialog.wait({
      content: content,
      title,
      buttons: [
        {
          action: 'submit',
          label: 'Submit',
          icon: '',
          class: '',
          isDefault: true,
          callback: (event, target, html) => {
            const value = html.querySelector("textarea")?.value;

            return value ?? html.querySelector(".editor-content").innerHTML;
          }
        }
      ],
      close: () => {
        return null;
      },
      rejectClose: false
    });
  }
}

window.testing = {prose: ProseDialog};

/**
 * @extends BaseActorSheet
 */
class HeroSheet extends BaseActorSheet {
  player = null;

  constructor(options = {}) {
    super(options);

    this.player = game.users.find(u => u.character === this.actor) ?? null;
  }

  static DEFAULT_OPTIONS = {
    actions: {
      roll3d6: this._onRoll3d6,
      rollEffect: this._onRollEffect,
      characteristicDetails: this._onCharacteristicDetailsClick,
      combatStat: this._onCombatStatClick,
      phaseToggle: this._onPhaseToggle,
    },
    classes: ["hero"],
    defaultTab: 'title'
  };

  static templates = {
    header: 'sheets/actor/hero/header.hbs',
    tabs: 'sheets/actor/hero/tabs.hbs',
    title: 'sheets/actor/hero/title.hbs',
    situations: 'sheets/actor/hero/situations.hbs',
    characteristics: 'sheets/actor/hero/characteristics.hbs',
    characteristic: 'sheets/actor/hero/partials/characteristic.hbs',
    skills: 'sheets/actor/hero/skills.hbs',
    powers: 'sheets/actor/hero/powers.hbs',
    combat: 'sheets/actor/hero/combat.hbs',
  }

  static PARTS = {
    header: {
      scrollable: [""],
      template: Utility.getTemplate(HeroSheet.templates.header),
      classes: ["sheet-header"]
    },
    tabs: {scrollable: [""], template: Utility.getTemplate(HeroSheet.templates.tabs)},
    title: {scrollable: [""], template: Utility.getTemplate(HeroSheet.templates.title)},
    situations: {scrollable: [""], template: Utility.getTemplate(HeroSheet.templates.situations)},
    characteristics: {scrollable: [""], template: Utility.getTemplate(HeroSheet.templates.characteristics)},
    skills: {scrollable: [""], template: Utility.getTemplate(HeroSheet.templates.skills)},
    powers: {scrollable: [""], template: Utility.getTemplate(HeroSheet.templates.powers)},
    combat: {scrollable: [""], template: Utility.getTemplate(HeroSheet.templates.combat)},
  }

  static TABS = {
    title: {
      id: "title",
      group: "primary",
      label: "Title",
    },
    situations: {
      id: "situations",
      group: "primary",
      label: "Situations",
    },
    characteristics: {
      id: "characteristics",
      group: "primary",
      label: "Characteristics",
    },
    skills: {
      id: "skills",
      group: "primary",
      label: "Skills",
    },
    powers: {
      id: "powers",
      group: "primary",
      label: "Powers",
    },
    combat: {
      id: "combat",
      group: "primary",
      label: "Combat"
    }
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.characteristics = {};
    
    for (const [key, model] of Object.entries(this.actor.system.characteristics)) {
      context.characteristics[key] = await model.getPartialData(key, 'system.characteristics');
    }

    debug("[HeroSheet] _prepareContext", {sheet: this, context, options});
    return context;
  }

  async _handleEnrichment() {
    const enrichment = await super._handleEnrichment();

    enrichment["system.notes"] = await TextEditor.enrichHTML(this.actor.system.notes, {});
    enrichment["system.combat.initiative"] = await TextEditor.enrichHTML(this.actor.system.combat.initiative, {});
    enrichment["system.combat.combatValue"] = await TextEditor.enrichHTML(this.actor.system.combat.combatValue, {});
    enrichment["system.combat.defense"] = await TextEditor.enrichHTML(this.actor.system.combat.defense, {});

    debug("[HeroSheet] _handleEnrichment", {sheet: this, enrichment});
    return foundry.utils.expandObject(enrichment);
  }

  static async _onRoll3d6(event) {
    event.preventDefault();
    event.stopPropagation();

    const roll = new Roll("3d6");
    await roll.evaluate();
    await roll.toMessage({
      flavor: game.i18n.localize("Champions.Rolls.Simple3d6"),
      speaker: ChatMessage.getSpeaker({actor: this.actor}),
    });
    debug("[HeroSheet] _onRoll3d6", {sheet: this, roll});
  }

  static async _onRollEffect(event) {
    event.preventDefault();
    event.stopPropagation();

    const {roll, message} = await EffectRoll.prompt({actor: this.actor});
    debug("[HeroSheet] _onRollEffect", {sheet: this, roll, message, formula});
  }

  /**
   *
   * @this HeroSheet
   * @returns {Promise<void>}
   * @private
   */
  static async _onCharacteristicDetailsClick(event) {
    if (event.target.tagName === "A") return;
    if (event.target.parentElement?.tagName === "A") return;

    const details = this._getDataAttribute(event, 'details');
    const label = this._getDataAttribute(event, 'label');
    const key = this._getDataAttribute(event, 'key');

    const value = await ProseDialog.create({
      title: label,
      value: details
    });

    if (!value) return;

    await this.actor.update({
      [`system.characteristics.${key}.details`]: value
    });
    debug("[HeroSheet] Characteristic Details Edited", {sheet: this, key, value});
  }

  /**
   *
   * @this HeroSheet
   * @returns {Promise<void>}
   * @private
   */
  static async _onCombatStatClick(event) {
    if (event.target.tagName === "A") return;
    if (event.target.parentElement?.tagName === "A") return;

    const stat = this._getDataAttribute(event, 'stat');
    const label = this._getDataAttribute(event, 'label');
    const key = this._getDataAttribute(event, 'key');

    const value = await ProseDialog.create({
      title: label,
      value: stat
    });

    if (!value) return;

    await this.actor.update({
      [`system.combat.${key}`]: value
    });
    debug("[HeroSheet] Combat Statistic Edited", {sheet: this, key, value});
  }

  /**
   *
   * @this HeroSheet
   * @returns {Promise<void>}
   * @private
   */
  static async _onPhaseToggle(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const checkboxes = event.target.closest(".phases").querySelectorAll('[name="phases"]');
    const values = Array.from(checkboxes).map(i => i.checked);

    await this.actor.system.combat.savePhases(values);
    debug("[HeroSheet] Phases Edited", {sheet: this, values});
  }

  _onRender(_context, _options) {
    super._onRender(_context, _options);

    if (this.player && Utility.getSetting(settings.colourHeaders)) {
      this.window.header.style.backgroundColor = this.player.color.css;
      const luma = getLuma(this.player.color.css);
      debug(`[HeroSheet] Header's Luma ${luma}`, {sheet: this, player: this.player, actor: this.actor});
      if (luma > 120) {
        this.window.header.classList.add("invert");
      }
    }
  }
}

const {ItemSheetV2} = foundry.applications.sheets;

/**
 * @extends ItemSheetV2
 * @mixes BaseSheetMixin
 */
class BaseItemSheet extends BaseSheetMixin(ItemSheetV2) {

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

class SituationSheet extends BaseItemSheet {

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

class API {
  /**
   * List of Modules to be initialized and added to API
   */
  #modules = [];

  apps = {}

  /**
   * Actually initialized modules
   */
  modules = new Map();

  /**
   * @type {SocketlibSocket}
   * @public
   */
  #socket;

  /**
   * @type {{}}
   * @public
   */
  helpers;

  constructor() {
    this.#initializeModules();
    this.#bindHooks();
    this.#preloadTemplates();
    this.#registerSettings();

    debug("API initialized!", {api: this});
  }

  /**
   * Initializes API modules
   */
  #initializeModules() {
    for (let module of this.#modules) {
      const Module = new module();
      this.modules.set(Module.camelName, Module);
    }
  }

  /**
   * Binds hooks
   */
  #bindHooks() {
    this.modules.forEach(module => module.bindHooks());

    debug("Module Hooks registered.", {api: this, modules: this.modules});
  }

  /**
   * Preloads templates used by the modules.
   */
  #preloadTemplates() {
    const templates = {
      [constants.systemId]: {
        heroSheet: HeroSheet.templates,
        itemSheet: BaseItemSheet.templates,
        situationSheet: SituationSheet.templates,
      }
    };

    this.modules.forEach((module, name) => {
      templates[constants.systemId][name] = module.getTemplates();
    });

    Utility.preloadTemplates(templates);
  }

  /**
   * Registers settings with the Foundry
   */
  #registerSettings() {
    this.modules.forEach((module) => {
      module.registerSettings();
    });
  }

  /**
   * Returns the version of the API.
   * @return {string}
   */
  version() {
    return '1.0.0';
  }
}

function registerHandlebarsHelpers() {
  Handlebars.registerHelper('list_number', function (number, options) {
    if (typeof (number) === 'undefined' || number === null)
      return null;

    return number + 1;
  });
}

foundry.data.fields;

class BaseItemDataModel extends foundry.abstract.TypeDataModel {
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

const fields$8 = foundry.data.fields;

class SituationDataModel extends BaseItemDataModel  {
  static defineSchema() {
    const schema = super.defineSchema();

    schema.description = new fields$8.HTMLField();

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

const fields$7 = foundry.data.fields;

class SkillDataModel extends BaseItemDataModel  {
  static defineSchema() {
    const schema = super.defineSchema();

    schema.description = new fields$7.HTMLField();

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

const fields$6 = foundry.data.fields;

class PowerDataModel extends BaseItemDataModel  {
  static defineSchema() {
    const schema = super.defineSchema();

    schema.description = new fields$6.HTMLField();
    schema.end = new fields$6.NumberField();

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

const fields$5 = foundry.data.fields;

class ManeuverDataModel extends BaseItemDataModel  {
  static defineSchema() {
    const schema = super.defineSchema();

    schema.description = new fields$5.HTMLField();
    schema.off = new fields$5.NumberField();
    schema.def = new fields$5.NumberField();

    return schema;
  }

  get canPostToChat() {
    return true;
  }

  get chatData() {
    let content = super.chatData;

    content += `<div style="display: flex; flex-direction: row; justify-content: space-evenly;">
                    <p><strong>${game.i18n.localize("Champions.Item.Off")}:</strong> ${this.off}</p>
                    <p><strong>${game.i18n.localize("Champions.Item.Def")}:</strong> ${this.def}</p>
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

foundry.data.fields;

class BaseActorDataModel extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const schema = {};

    return schema;
  }

  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    let preCreateData = {};
    let defaultToken = game.settings.get("core", "defaultToken");

    defaultToken = foundry.utils.mergeObject({
      "prototypeToken.bar1": {"attribute": "combat.endurance"},
      "prototypeToken.bar2": {"attribute": "combat.knockout"},
      "prototypeToken.displayName": defaultToken?.displayName || CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      "prototypeToken.displayBars": defaultToken?.displayBars || CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      "prototypeToken.disposition": defaultToken?.disposition || CONST.TOKEN_DISPOSITIONS.NEUTRAL,
      "prototypeToken.name": data.name,
    }, defaultToken);

    // Set wounds, advantage, and display name visibility
    if (!data.prototypeToken) {
      foundry.utils.mergeObject(preCreateData, defaultToken);
    }

    this.parent.updateSource(preCreateData);
  }


  toEmbed(config, options) {
    return null;
  }
}

const fields$4 = foundry.data.fields;

class CharacteristicModel extends foundry.abstract.DataModel {

  static defineSchema() {
    return {
      value: new fields$4.NumberField(),
      details: new fields$4.HTMLField()
    };
  }

  async getPartialData(key, path) {
    return {
      label: game.i18n.localize(`Champions.Models.Actor.Characteristics.${key}`),
      name: `${path}.${key}.value`,
      key,
      value: this.value,
      details: this.details,
      enriched: await TextEditor.enrichHTML(this.details, {})
    }
  }

  getRollData() {
    return this.value;
  }
}

const fields$3 = foundry.data.fields;

class DieCharacteristicModel extends CharacteristicModel {

  static defineSchema() {
    const schema = super.defineSchema();

    schema.value = new fields$3.StringField();

    return schema;
  }
}

const fields$2 = foundry.data.fields;

class CharacteristicsModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      strength: new fields$2.EmbeddedDataField(DieCharacteristicModel),
      presence: new fields$2.EmbeddedDataField(DieCharacteristicModel),

      body: new fields$2.EmbeddedDataField(CharacteristicModel),
      stunned: new fields$2.EmbeddedDataField(CharacteristicModel),
      recovery: new fields$2.EmbeddedDataField(CharacteristicModel),
      knockout: new fields$2.EmbeddedDataField(CharacteristicModel),
      endurance: new fields$2.EmbeddedDataField(CharacteristicModel),

      ordinary: new fields$2.EmbeddedDataField(CharacteristicModel),
      resistant: new fields$2.EmbeddedDataField(CharacteristicModel),
      total: new fields$2.EmbeddedDataField(CharacteristicModel),

      speed: new fields$2.EmbeddedDataField(CharacteristicModel),

      dexterity: new fields$2.EmbeddedDataField(CharacteristicModel),
      intelligence: new fields$2.EmbeddedDataField(CharacteristicModel),
      ego: new fields$2.EmbeddedDataField(CharacteristicModel),
    };
  }
}

const fields$1 = foundry.data.fields;

class CombatModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      phases: new fields$1.NumberField({initial: 4}),

      initiative: new fields$1.StringField({nullable: true}),
      combatValue: new fields$1.StringField({nullable: true}),

      defense: new fields$1.StringField({nullable: true}),

      stunned: new fields$1.NumberField({nullable: true, min: 0}),
      recovery: new fields$1.NumberField({nullable: true, min: 0}),

      body: new fields$1.SchemaField({
        value: new fields$1.NumberField({nullable: true, min: 0}),
        max: new fields$1.NumberField({nullable: true, min: 0}),
      }),

      knockout: new fields$1.SchemaField({
        value: new fields$1.NumberField({nullable: true, min: 0}),
        max: new fields$1.NumberField({nullable: true, min: 0}),
      }),

      endurance: new fields$1.SchemaField({
        value: new fields$1.NumberField({nullable: true, min: 0}),
        max: new fields$1.NumberField({nullable: true, min: 0}),
      }),
    };
  }

  async savePhases(value) {
    if (Array.isArray(value)) {
      let phaseValue = 0;
      let i = 6;

      for (let phase of value) {
        i--;

        if (!!phase)
          phaseValue += 1 << i;
      }

      value = phaseValue;
    }

    await this.parent.parent.update({[this.schema.fieldPath + ".phases"]: value});
  }

  get Phases() {
    return [
      this.phases & 32,
      this.phases & 16,
      this.phases & 8,
      this.phases & 4,
      this.phases & 2,
      this.phases & 1
    ].map(v => !!v);
  }
}

const fields = foundry.data.fields;

class HeroDataModel extends BaseActorDataModel {

  static defineSchema() {
    const schema = super.defineSchema();

    schema.realName = new fields.StringField();

    schema.xp = new fields.SchemaField({
      earned: new fields.NumberField({initial: 0, min: 0, integer: false, positive: false}),
      used: new fields.NumberField({initial: 0, min: 0, integer: false, positive: false})
    });

    schema.title = new fields.StringField();

    schema.statements = new fields.SchemaField({
      first: new fields.StringField(),
      second: new fields.StringField(),
    });

    schema.notes = new fields.HTMLField();

    schema.characteristics = new fields.EmbeddedDataField(CharacteristicsModel);

    schema.combat = new fields.EmbeddedDataField(CombatModel);

    return schema;
  }

  prepareDerivedData() {
    if (this.combat.body.max === null)
      this.combat.body.max = this.characteristics.body.value;

    if (this.combat.knockout.max === null)
      this.combat.knockout.max = this.characteristics.knockout.value;

    if (this.combat.endurance.max === null)
      this.combat.endurance.max = this.characteristics.endurance.value;


    if (this.combat.stunned === null)
      this.combat.stunned = this.characteristics.stunned.value;

    if (this.combat.recovery === null)
      this.combat.recovery = this.characteristics.recovery.value;


    if (this.combat.body.value === null)
      this.combat.body.value = this.combat.body.max;

    if (this.combat.knockout.value === null)
      this.combat.knockout.value = this.combat.knockout.max;

    if (this.combat.endurance.value === null)
      this.combat.endurance.value = this.combat.endurance.max;

    this.xp.left = this.xp.earned - this.xp.used;
  }

  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    let preCreateData = {};

    if (!data.system?.characteristics) {
      foundry.utils.mergeObject(preCreateData, {
        "system.characteristics.strength.value": "2d6",
        "system.characteristics.presence.value": "2d6",

        "system.characteristics.body.value": 10,
        "system.characteristics.recovery.value": 10,
        "system.characteristics.stunned.value": 10,
        "system.characteristics.knockout.value": 20,
        "system.characteristics.endurance.value": 30,

        "system.characteristics.ordinary.value": 10,
        "system.characteristics.resistant.value": 10,
        "system.characteristics.total.value": 10,

        "system.characteristics.speed.value": 1,

        "system.characteristics.dexterity.value": 11,
        "system.characteristics.intelligence.value": 11,
        "system.characteristics.ego.value": 11,
      });
    }

    this.parent.updateSource(preCreateData);
  }
}

function BaseHeroesDocument(BaseApplication) {
  /**
   * @extends Document
   */
  class BaseChampionsDocument extends BaseApplication {
    get canPostToChat() {
      return this.system?.canPostToChat;
    }

    async toChat({scene, actor, token, alias}){
      const data = this.system.chatData;
      const speaker = ChatMessage.getSpeaker({scene, actor, token, alias});

      return await ChatMessage.create({
        speaker,
        flavor: game.i18n.localize(CONFIG[this.documentName].typeLabels[this.type]),
        content: `
        <h3>${this.name}</h3>
        ${data}
        `
      });
    }
  }

  return BaseChampionsDocument;
}

class HeroesActor extends BaseHeroesDocument(Actor) {
  getRollData() {
    return this._parseModelForRollData(this.system);
  }

  _parseModelForRollData(model) {
    let rollData = {};

    if (model instanceof foundry.abstract.DataModel) {
      if (model.getRollData instanceof Function)
        return model.getRollData();

      for (const field in model)
        rollData[field] = this._parseModelForRollData(model[field]);
    } else {
      return model;
    }

    return rollData;
  }
}

class HeroesItem extends BaseHeroesDocument(Item) {
  
}

class SkillSheet extends BaseItemSheet {

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

class PowerSheet extends BaseItemSheet {

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

class ManeuverSheet extends BaseItemSheet {

  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["maneuver"]
  };

  static templates = {
    maneuver: 'sheets/item/maneuver.hbs',
  }

  static PARTS = {
    header: {template: Utility.getTemplate(BaseItemSheet.templates.header), classes: ["sheet-header"]},
    maneuver: {template: Utility.getTemplate(ManeuverSheet.templates.maneuver)},
  }

  async _handleEnrichment() {
    const enrichment = {};

    enrichment["system.description"] = await TextEditor.enrichHTML(this.item.system.description, {});

    debug("[BaseItemSheet] _handleEnrichment", {sheet: this, enrichment});
    return foundry.utils.expandObject(enrichment);
  }

}

async function initializeFonts() {
  await game.settings.set("core", "fonts", {
    "Bangers": {
      editor: true,
      fonts: [
        {
          urls: [
            "systems/heroes-unbound/fonts/Bangers/Bangers-Regular.ttf"
          ],
          weight: 400,
          style: "normal"
        }
      ]
    },
    "Comic Neue": {
      editor: true,
      fonts: [
        {
          urls: [
            "systems/heroes-unbound/fonts/Comic_Neue/ComicNeue-Regular.ttf"
          ],
          weight: 400,
          style: "normal"
        },
        {
          urls: [
            "systems/heroes-unbound/fonts/Comic_Neue/ComicNeue-Bold.ttf"
          ],
          weight: 700,
          style: "normal"
        },
        {
          urls: [
            "systems/heroes-unbound/fonts/Comic_Neue/ComicNeue-BoldItalic.ttf"
          ],
          weight: 700,
          style: "italic"
        },
        {
          urls: [
            "systems/heroes-unbound/fonts/Comic_Neue/ComicNeue-Italic.ttf"
          ],
          weight: 400,
          style: "italic"
        },
        {
          urls: [
            "systems/heroes-unbound/fonts/Comic_Neue/ComicNeue-Light.ttf"
          ],
          weight: 300,
          style: "normal"
        },
        {
          urls: [
            "systems/heroes-unbound/fonts/Comic_Neue/ComicNeue-LightItalic.ttf"
          ],
          weight: 300,
          style: "italic"
        }
      ]
    },
    "Comic Helvetic": {
      editor: true,
      fonts: [
        {
          urls: [
            "systems/heroes-unbound/fonts/ComicHelvetic/ComicHelvetic_Medium.otf"
          ],
          weight: 400,
          style: "normal"
        },
        {
          urls: [
            "systems/heroes-unbound/fonts/ComicHelvetic/ComicHelvetic_Light.otf"
          ],
          weight: 300,
          style: "normal"
        },
        {
          urls: [
            "systems/heroes-unbound/fonts/ComicHelvetic/ComicHelvetic_Heavy.otf"
          ],
          weight: 700,
          style: "normal"
        }
      ]
    }
  });

  debug(`System Fonts initialized.`);
}

function setDocumentClasses() {
  CONFIG.Actor.documentClass = HeroesActor;
  CONFIG.Item.documentClass = HeroesItem;

  CONFIG.Dice.rolls.push(EffectRoll);
}

function registerSheets() {
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("heroes-unbound", HeroSheet, {types: ["hero"], makeDefault: true});

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("heroes-unbound", SituationSheet, {types: ["situation"], makeDefault: true});
  Items.registerSheet("heroes-unbound", SkillSheet, {types: ["skill"], makeDefault: true});
  Items.registerSheet("heroes-unbound", PowerSheet, {types: ["power"], makeDefault: true});
  Items.registerSheet("heroes-unbound", ManeuverSheet, {types: ["maneuver"], makeDefault: true});

}

function registerDataModels() {
  CONFIG.Actor.dataModels["hero"] = HeroDataModel;

  CONFIG.Item.dataModels["situation"] = SituationDataModel;
  CONFIG.Item.dataModels["skill"] = SkillDataModel;
  CONFIG.Item.dataModels["power"] = PowerDataModel;
  CONFIG.Item.dataModels["maneuver"] = ManeuverDataModel;
}

function initialConfig() {
  const version = game.system.version;
  const force = window.location.search.includes("forceInit");

  if (!force && version === "<<autoreplaced>>") return;
  if (!force && !foundry.utils.isNewerVersion(version, Utility.getSetting(settings.initialized))) return;

  const initializers = Promise.all(
    [
      initializeFonts()
    ]
  );

  initializers.then(() => {
    debug(`Config for system version ${game.system.version} initialized.`);
  }).catch((error) => {
    Utility.error("Error when initializing system. Check Console for more details.");
    throw error;
  });

  if (!force)
    Utility.setSetting(settings.initialized, game.system.version);
}

/**
 * Registers settings with the Foundry
 */
function registerSettings() {
  game.settings.register(constants.systemId, settings.initialized, {
    scope: 'world',
    config: false,
    default: defaults.initialized,
    type: String
  });

  game.settings.register(constants.systemId, settings.colourHeaders, {
    name: "Champions.Settings.ColourHeaders.Name",
    hint: "Champions.Settings.ColourHeaders.Hint",
    scope: 'user',
    config: true,
    default: defaults.colourHeaders,
    type: Boolean,
    onChange: () => {
      foundry.applications.instances.forEach(async (app) => {
        if (app instanceof HeroSheet)
          await app.render(true);
      });
    }
  });
}

Hooks.once("init", () => {
  game.system.links = LINKS;

  setDocumentClasses();
  registerSheets();
  registerDataModels();

  registerHandlebarsHelpers();

  registerSettings();
  Debug.registerSetting();

  game.system.api = new API();

  Hooks.callAll(hooks.init);
  debug("System initialized.");
});

Hooks.once("setup", () => {

  Hooks.callAll(hooks.setup);
  debug("System setup.");
});

Hooks.once("i18nInit", () => {
  Hooks.callAll(hooks.i18nInit);
  debug("System i18nInit.");
});

Hooks.once("ready", () => {
  Debug.logSettings();
  initialConfig();
  Hooks.callAll(hooks.ready);
  Utility.notify("System ready.", {consoleOnly: true});
});

Hooks.once("renderChatLog", (app, html, _options) => {
  html.addClass("heroes-unbound");
});

Hooks.on("chatMessage", (html, content, msg) => {
  const rollMode = game.settings.get("core", "rollMode");

  if (["gmroll", "blindroll"].includes(rollMode))
    msg["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);

  if (rollMode === "blindroll")
    msg["blind"] = true;

  const regExp = /(\S+)/g;
  const commands = content.match(regExp);
  const command = commands[0];

  if (command === "/effect") {
    const amount = Number(commands[1]) ?? 3;
    const roll = new EffectRoll(`${amount}d6`);
    roll.toMessage();

    return false;
  }
});
