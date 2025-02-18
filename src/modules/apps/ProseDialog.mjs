const {DialogV2} = foundry.applications.api;

export default class ProseDialog extends DialogV2 {
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
