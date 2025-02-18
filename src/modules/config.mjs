import {SituationDataModel} from "./models/item/SituationDataModel.mjs";
import {SkillDataModel} from "./models/item/SkillDataModel.mjs";
import {PowerDataModel} from "./models/item/PowerDataModel.mjs";
import {ManeuverDataModel} from "./models/item/ManeuverDataModel.mjs";
import {HeroDataModel} from "./models/actor/HeroDataModel.mjs";
import ChampionsActor from "./documents/ChampionsActor.mjs";
import ChampionsItem from "./documents/ChampionsItem.mjs";
import EffectRoll from "./features/EffectRoll.mjs";
import HeroSheet from "./apps/sheets/actor/HeroSheet.mjs";
import SituationSheet from "./apps/sheets/item/SituationSheet.mjs";
import SkillSheet from "./apps/sheets/item/SkillSheet.mjs";
import PowerSheet from "./apps/sheets/item/PowerSheet.mjs";
import ManeuverSheet from "./apps/sheets/item/ManeuverSheet.mjs";
import Utility from "./utility/Utility.mjs";
import {settings} from "./constants.mjs";
import {initializeFonts} from "./features/Initialization.mjs";
import {debug} from "./utility/Debug.mjs";

export function setDocumentClasses() {
  CONFIG.Actor.documentClass = ChampionsActor;
  CONFIG.Item.documentClass = ChampionsItem;

  CONFIG.Dice.rolls.push(EffectRoll);
}

export  function registerSheets() {
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("champions-now", HeroSheet, {types: ["hero"], makeDefault: true});

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("champions-now", SituationSheet, {types: ["situation"], makeDefault: true});
  Items.registerSheet("champions-now", SkillSheet, {types: ["skill"], makeDefault: true});
  Items.registerSheet("champions-now", PowerSheet, {types: ["power"], makeDefault: true});
  Items.registerSheet("champions-now", ManeuverSheet, {types: ["maneuver"], makeDefault: true});

}

export function registerDataModels() {
  CONFIG.Actor.dataModels["hero"] = HeroDataModel;

  CONFIG.Item.dataModels["situation"] = SituationDataModel;
  CONFIG.Item.dataModels["skill"] = SkillDataModel;
  CONFIG.Item.dataModels["power"] = PowerDataModel;
  CONFIG.Item.dataModels["maneuver"] = ManeuverDataModel;
}

export function initialConfig() {
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
    Utility.error("Error when initializing system. Check Console for more details.")
    throw error;
  })

  if (!force)
    Utility.setSetting(settings.initialized, game.system.version);
}