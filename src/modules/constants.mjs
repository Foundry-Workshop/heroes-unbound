const constants = {
  systemPath: 'systems/heroes-unbound',
  systemId: 'heroes-unbound',
  systemLabel: 'Heroes Unbound',
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
