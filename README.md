# Lockdown bot

## How to run

Make a [new application](https://discord.com/developers/applications) and make a bot account for it.

Invite the bot to your server. Make sure the OAuth2 URL has `bot` and `application.command` scopes, and the bot has `Manage Roles`, `Send Message`, and `Connect` roles (The bot can only modify permissions that it has been granted)

Make a file in the repo directory called `config.json` with the following fields:
```json
{
    "token": "your bot client token"
}
```

`npm install` to install all the dependencies

`node bot.js -update` when you first run the bot to send slash command data to discord (or to update slash commands)

`node bot.js` to run the bot normally afterwards

## Design

The bot is built for nodejs v16, because that's the lowest version the discord.js v13 library will support. 

The bot uses a require-based slash command system. Each command is defined by a file in the `cmd` directory.

A command file is structured like so:

```js
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
.setName("command name")
.setDescription("command description")

const func = async function(bot, interaction) {
    // command code
}

// optional
const perms = [
    // command permissions
]

module.exports = {
    data,
    func,
    perms // optional
}
```

Each command file must export a `data` and `func` object, and optionally may export a `perms` object.

`data` is a [SlashCommandBuilder](https://discord.js.org/#/docs/builders/stable/class/SlashCommandBuilder) object used to describe the structure of the slash command. You will at minimum need to set the command name, and ideally a short description of the command. If you want any options or sub-commands, this is where you will define their layout. See the [guide](https://discordjs.guide/interactions/registering-slash-commands.html#options) for some examples, and the [documentation](https://discord.js.org/#/docs/builders) for advanced usage.

`func` is the function executed when the bot receives a command interaction. It is an `async function` meaning you can perform [asynchronous tasks synchronously](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await). It is passed two arguments when it is called: `bot`, the [Discord Client object](https://discord.js.org/#/docs/main/stable/class/Client) of the bot (personally I use it to store globals and other bot-wide settings); `interaction`, the [Slash Command Interaction object](https://discord.js.org/#/docs/main/stable/class/CommandInteraction) which gives you any arguments the user has passed to the command.

`perms` is an optional list of permission objects that describe what roles or users have access to the command. See the [guide](https://discordjs.guide/interactions/slash-command-permissions.html#user-permissions) on how this object is structured. By default, all users have access to every command, unless in the `data` object you have `setDefaultPermission(false)`, so it's usually not neccessary to set this for every command. Unfortunately, even if a user does not have permission to use a command, they can still see it in the list of slash commands in the GUI. This is a limitation of the current bot API, and there's no way to get around it.

The bot also comes with a small logging function I wrote. It prints the current time and severity before the log message, and also the file, line, and column number for debug logs.

## Development

If you edit any of the command js files, you can use the slash command `/reload-commands` to invalidate the require cache and make nodejs re-require the commands. **Warning**: I haven't implemented recursively invalidating the cache for any local module changes, so if you have any local util modules (like `util/log.js`) `/reload-commands` won't update it, you will have to restart the bot manually.

The `/reload-commands` will update all command permissions (for all connected servers) by default. Be careful because there is a limit of 200 slash command permission updates per 24 hours (per server). If you haven't changed any permissions, you can just use `/reload-commands code-only: true` to only invalidate the require cache.

Oh, and `/reload-commands` has disabled all permissions by default. You probably want to set your own user id so you can actually use it (see `cmd/reloadCommands.js`).

## License

The code in this repository is licensed under MIT. The various libraries used each have their own licences.