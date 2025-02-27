import BaseActorSheet from "./BaseActorSheet.mjs";
import Utility, {getLuma} from "../../../utility/Utility.mjs";
import EffectRoll from "../../../features/EffectRoll.mjs";
import ProseDialog from "../../ProseDialog.mjs";
import {debug} from "../../../utility/Debug.mjs";
import {settings} from "../../../constants.mjs";

/**
 * @extends BaseActorSheet
 */
export default class HeroSheet extends BaseActorSheet {
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
    enrichment["system.combat.defense.ordinary"] = await TextEditor.enrichHTML(this.actor.system.combat.defense.ordinary.notes, {});
    enrichment["system.combat.defense.resistant"] = await TextEditor.enrichHTML(this.actor.system.combat.defense.resistant.notes, {});
    enrichment["system.combat.defense.total"] = await TextEditor.enrichHTML(this.actor.system.combat.defense.total.notes, {});
    enrichment["system.combat.levels"] = await TextEditor.enrichHTML(this.actor.system.combat.levels, {});

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
