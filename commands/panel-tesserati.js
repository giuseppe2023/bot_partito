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
            .setTitle('**TESSERAMENTO - INSIEME PER ROMA**')
            .setDescription(`Cari concittadini, tesserarsi a Insieme per Roma significa scegliere di esserci davvero. Non solo sostenere un’idea di città, ma contribuire in prima persona a costruirla, portando valore, partecipazione e visione. Con le sfide che ci attendono, ogni adesione conta: entra anche tu e diventa parte del cambiamento.

__Istruzioni per il Tesseramento:__

*Per completare il tesseramento è sufficiente premere il pulsante sottostante e compilare tutti i campi richiesti con attenzione.* Una volta inviata la richiesta, il nostro staff provvederà a verificarla: riceverete l’esito entro 24 ore.
__Vi invitiamo a inserire informazioni corrette per evitare ritardi nella procedura.__

**Entra anche tu a far parte di Insieme per Roma.**`)
            .setFooter({ text: 'Il tesseramento è gratuito e aperto a tutti!' })
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
