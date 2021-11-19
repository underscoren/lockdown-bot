const { SlashCommandBuilder } = require("@discordjs/builders");
const { Client, CommandInteraction } = require("discord.js"); // eslint-disable-line no-unused-vars

const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Checks the latency of the Discord API");

/**
 * Basic ping command to test how interaction works
 * @param {Client} bot
 * @param {CommandInteraction} interaction
 */
const func = async function(bot, interaction) {
    interaction.reply(`Latency: ${bot.ws.ping}ms`);
};

module.exports = {
    data,
    func
};