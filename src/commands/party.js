const { SlashCommandBuilder } = require('discord.js');
const partyService = require('../services/partyService');
const { buildPartyEmbed } = require('../ui/partyEmbed');
const { buildPartyRows } = require('../ui/partyComponents');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createparty')
    .setDescription('Buat panel party baru')
    .addStringOption((opt) =>
      opt.setName('title').setDescription('Judul party (contoh: GDN HC)').setRequired(true)
    ),

  async execute(interaction) {
    const title = interaction.options.getString('title');

    const run = partyService.createRun({
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      hostId: interaction.user.id,
      title,
    });

    const requirements = partyService.getRequirements(run.id);
    const members = partyService.getActiveMembers(run.id);
    const embed = buildPartyEmbed(run, requirements, members);
    const components = buildPartyRows(run, requirements, members);

    // Otomatis ping @here begitu party dibuat, isinya title-nya.
    const message = await interaction.reply({
      content: `@here ${title}`,
      embeds: [embed],
      components,
      allowedMentions: { parse: ['everyone'] },
      fetchReply: true,
    });
    partyService.setPanelMessageId(run.id, message.id);
  },
};
