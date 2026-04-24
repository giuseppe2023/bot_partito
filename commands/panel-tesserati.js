const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel-tesserati')
        .setDescription('Crea il pannello tesseramenti'),

    async execute(interaction) {

        if (interaction.user.id !== '959444239622733834') {
            return interaction.reply({
                content: '❌ Non puoi usare questo comando',
                ephemeral: true
            });
        }

        const channel = interaction.guild.channels.cache.get('1496523864748982272');
        if (!channel) return interaction.reply({ content: '❌ Canale non trovato', ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('📋 Tesseramento partito')
            .setDescription('**Premi il pulsante per richiedere il tesseramento con il nostro partito**')
            .setFooter('Il tesseramento è gratuito e aperto a tutti!')
            .setThumbnail(`${interaction.guild.iconURL()}`)
            .setColor('Blue');

        const button = new ButtonBuilder()
            .setCustomId('tesseramento_btn')
            .setLabel('Richiesta tesseramento')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await channel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.reply({
            content: '✅ Panel inviato!',
            ephemeral: true
        });
    }
};