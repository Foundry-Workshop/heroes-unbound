export default function BaseHeroesDocument(BaseApplication) {
  /**
   * @extends Document
   */
  class BaseChampionsDocument extends BaseApplication {
    get canPostToChat() {
      return this.system?.canPostToChat;
    }

    async toChat({scene, actor, token, alias}){
      const data = this.system.chatData;
      const speaker = ChatMessage.getSpeaker({scene, actor, token, alias})

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