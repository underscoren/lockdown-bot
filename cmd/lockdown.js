const { SlashCommandBuilder, roleMention } = require("@discordjs/builders");
const { Client, CommandInteraction, Permissions } = require("discord.js"); // eslint-disable-line no-unused-vars
const { log, error } = require("../util/log");
const Duration = require("duration-js");
const humanizeDuration = require("humanize-duration");

const data = new SlashCommandBuilder()
    .setName("lockdown")
    .setDescription("Lock down the server for a specific group")
    .setDefaultPermission(false)
    .addStringOption(option =>
        option
            .setName("duration")
            .setDescription("A duration formatted like 2h30m")
            .setRequired(true)
    )
    .addRoleOption(option => 
        option
            .setName("role")
            .setDescription("Student role to lock down")
            .setRequired(true)
    );

/**
 * Command to lock down the server to specific roles
 * @param {Client} bot
 * @param {CommandInteraction} interaction
 */
const func = async function(bot, interaction) {
    const durationInput = interaction.options.getString("duration");
    const roleInput = interaction.options.getRole("role");

    let duration;
    try {
        duration = new Duration(durationInput);
    } catch (err) {
        error("Unable to parse duration string",durationInput);
        console.error(err);
        interaction.reply({content: "Unable to parse duration string", ephemeral: true});
    }

    // remove permissions from the role
    let rolePerms = new Permissions(roleInput.permissions);
    rolePerms.remove([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.CONNECT]);

    roleInput
        .setPermissions(rolePerms, `Lockdown for ${durationInput}`)
        .then(() => {
            // remove lockdown after time has elapsed
            setTimeout(() => {
                removeLockdown(bot, roleInput);
            }, duration.milliseconds());

            log(`Setting lockdown for role ${roleInput.name} (${roleInput.id})`);
            bot.inLockdown = true; // could be useful in other commands (e.g. a remove-lockdown command)

            interaction.reply({content: `Lockdown in effect for ${roleMention(roleInput.id)} (${humanizeDuration(duration.milliseconds(), {largest: 2})})`});
        })
        .catch(err => {
            error(`Unable to set permissions for role ${roleInput.name} (${roleInput.id})`);
            console.error(err);
            interaction.reply({content: `Unable to set permissions for ${roleMention(roleInput.id)} (${roleInput.id})`, ephemeral: true});
        });
};

/**
 * Function to remove the lockdown from a specific role
 * @param {Client} bot
 * @param {Role} role
 */
function removeLockdown(bot, role) {
    // add permissions back to the role
    let rolePerms = new Permissions(role.permissions);
    rolePerms.add([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.CONNECT]);

    role
        .setPermissions(rolePerms, "Removing lockdown")
        .then(() => {
            log(`Lockdown removed for role ${role.name} (${role.id})`);

            bot.inLockdown = false;
        })
        .catch(err => {
            error(`Unable to set permissions for role ${roleMention(role.id)} (${role.id})`);
            console.error(err);
        });
}

// only allow admins permission to use this command
const perms = [
    {
        id: "911355438224793651", // you probably want to change this
        type: "ROLE",
        permission: true
    }
];

module.exports = {
    data,
    func,
    perms,
    removeLockdown // for other commands
};