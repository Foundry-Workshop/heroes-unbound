const constants = {
  systemPath: 'systems/champions-now',
  systemId: 'champions-now',
  systemLabel: 'Champions Now',
  loopLimit: 100
};

const dataTypes = {
}

const flags = {
  log: 'auditLog'
}

const settings = {
  initialized: 'initialized',
  colourHeaders: 'colourHeaders',
}

const defaults = {
  initialized: "0.0.0",
  colourHeaders: true
}

const hooks = {
  init: 'ChampionsNow:init',
  setup: 'ChampionsNow:setup',
  i18nInit: 'ChampionsNow:i18nInit',
  ready: 'ChampionsNow:ready',
}

export {constants, dataTypes, defaults, flags, settings, hooks};
