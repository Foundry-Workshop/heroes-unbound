# FoundryVTT - Champions Now
![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/Foundry-Workshop/champions-now?style=for-the-badge)
![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FFFoundry-Workshop%2Fchampions-now%2Fmaster%2Fdist%2Fsystem.json&label=Foundry%20Min%20Version&query=$.compatibility.minimum&colorB=orange&style=for-the-badge)
![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FFFoundry-Workshop%2Fchampions-now%2Fmaster%2Fdist%2Fsystem.json&label=Foundry%20Verified&query=$.compatibility.verified&colorB=orange&style=for-the-badge)  
![License](https://img.shields.io/github/license/Foundry-Workshop/champions-now?style=for-the-badge) ![GitHub Releases](https://img.shields.io/github/downloads/Foundry-Workshop/champions-now/latest/module.zip?style=for-the-badge)
![GitHub All Releases](https://img.shields.io/github/downloads/Foundry-Workshop/champions-now/module.zip?style=for-the-badge&label=Downloads+total)  
[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white&link=https%3A%2F%2Fdiscord.gg%2FXkTFv8DRDc)](https://discord.gg/XkTFv8DRDc)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://www.patreon.com/foundryworkshop)
[![Ko-Fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/forien)

This system is an unofficial implementation of **Champions Now** system by Hero Games for Foundry Virtual Table Top.  

*Note that this system does not contain content from copyrighted Hero Games products, only rollable character sheets.*


## Installation

### Recommended: Install via FoundryVTT Setup Screen

Use the System Browser on the Setup Screen to find the **Champions Now** System and click "install".  
FoundryVTT will automatically install the System.

Once installed, create a World using **Champions Now** game system.

### Manifest URL

1. Copy this [URL](https://github.com/Foundry-Workshop/champions-now/releases/latest/download/system.json).
2. Install Champions Now system by providing the copied URL in the Manifest Input within the Foundry Setup Screen.
3. Once installed, create a World using **Champions Now** game system.

### Manual (ZIP) — not recommended

1. Download ZIP of a [latest release](https://github.com/Foundry-Workshop/champions-now/releases/latest/download/system.zip).
2. Install Champions Now system by extracting ZIP in your `FoundryData/Data/systems` directory
3. Once installed, create a World using **Champions Now** game system.



## Contents
### Features
This system features:
- 1 **Actor** type - **Hero** - and its Sheet
- 4 **Item** types - **Maneuver**, **Power**, **Situation**, **Skill** - and their Sheets
- **Effect Roll**, which displays **Knockout** and **Core** results
  - Effect Roll can be performed either by a button on Hero Sheet, or by using `/effect X` command (where `X` is number of d6s) 

### Content
This System contains no actual content. A game manual of either **Champions Now** as well as certain level of manual input is required to play the game.

## Troubleshooting and Debug
If you want to have deeper understanding of why system behaves the way it does, **you can enable Debug in system's setting**.

This setting makes it so that the system will output a ton of information into the console whenever is performs or attempts to perform an action.

You can open the console by using `F12` keybind on most browsers.

**Tip**: Use `Champions Now` as filter in console to only see this system's messages.


## Recommended 3rd Party Modules
By default Foundry only offers 2 Attribute Bars on Tokens and system sets them as Endurance and Knockout. While you can freely change that, you are still limited to only 2 bars.

If you want to be able to display 3 Attribute Bars (Knockout, Endurance and Body), or maybe even more, you can achieve this by using [Bar Brawl](https://foundryvtt.com/packages/barbrawl) module.

To improve the immersion of the game I also highly recommend the [Dice so Nice](https://foundryvtt.com/packages/dice-so-nice/) module.

## Known issues

_None at the moment._

## Contact

If you wish to contact me for any reason, reach me out on Discord using my tag: `forien`


## Support

If you wish to support me, please consider [becoming my Patreon](https://www.patreon.com/foundryworkshop) or donating [through Paypal](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=6P2RRX7HVEMV2&source=url). Thanks!




## Acknowledgments
* Thanks to Aldo J. Regalado (A.K.A. TGIDragonfly) for commissioning this system!
* Thanks to moo-man for allowing me use some of his code from [Warhammer Library](https://github.com/moo-man/WarhammerLibrary-FVTT) for QoL functions of Foundry Applications V2!


## License

Champions Now is a system for Foundry VTT by Forien and is licensed under a [Mozilla Public License v. 2.0](https://github.com/Foundry-Workshop/champions-now/blob/master/LICENSE).

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License for Package Development from March 2, 2023](https://foundryvtt.com/article/license/).

_To the best of my knowledge, all content in this module is either made by me, publicly available under permissive license or falls under Fair Use. Please bring infractions or concerns related to this system to my attention by contacting me via email presented on my GitHub profile._ 
