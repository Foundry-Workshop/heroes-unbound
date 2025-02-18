import Utility from "./utility/Utility.mjs";
import {constants} from "./constants.mjs";
import HeroSheet from "./apps/sheets/actor/HeroSheet.mjs";
import BaseItemSheet from "./apps/sheets/item/BaseItemSheet.mjs";
import SituationSheet from "./apps/sheets/item/SituationSheet.mjs";
import {debug} from "./utility/Debug.mjs";

export default class API {
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
    })

    Utility.preloadTemplates(templates);
  }

  /**
   * Registers settings with the Foundry
   */
  #registerSettings() {
    this.modules.forEach((module) => {
      module.registerSettings();
    })
  }

  /**
   * Returns the version of the API.
   * @return {string}
   */
  version() {
    return '1.0.0';
  }
}
