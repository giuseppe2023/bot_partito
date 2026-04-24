require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    Collection,
    Events,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const express = require('express');
const app = express();

client.commands = new Collection();

const fs = require('fs');
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
    console.log(`✅ Bot online come ${client.user.tag}`);
});

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot online');
});

app.listen(PORT, () => {
    console.log(`🌐 Server attivo sulla porta ${PORT}`);
});

// ================= WELCOME SYSTEM =================
client.on(Events.GuildMemberAdd, async member => {

    const channelId = '1496581427993772072';
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const role1 = '1496564525250515016';
    const role2 = '1496564789239873797';

    try {
        await member.roles.add(role1);
        await member.roles.add(role2);
    } catch (err) {
        console.log('Errore assegnazione ruoli:', err);
    }

    const embed = new EmbedBuilder()
        .setAuthor({
            name: `Benvenuto nel server ${member.guild.name}!`,
            iconURL: member.user.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`*Benvenuto ${member} nel server ufficiale di **${member.guild.name}**.*

*Questo spazio nasce con l’obiettivo di riunire tutte le persone che condividono la volontà di costruire una città migliore.*

__Buona permanenza.__`)
        .setColor('Green')
        .setThumbnail("https://media.discordapp.net/attachments/1496516547517349959/1496516547970072626/image-removebg-preview_30.png")
        .setTimestamp();

    channel.send({ embeds: [embed] });
});


// ================= INTERACTION =================
client.on(Events.InteractionCreate, async interaction => {

    // SLASH COMMAND
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
        }
    }

    // ================= BUTTONS =================
    if (interaction.isButton()) {

        const staffRoleId = '1496563313528799432';
        const autoRoleId = '1496564858328453312';

        const member = interaction.member;

        // ✅ PRIMA modal (fix errore 10062)
        if (interaction.customId === 'tesseramento_btn') {

            const modal = new ModalBuilder()
                .setCustomId('tesseramento_modal')
                .setTitle('Richiesta Tesseramento');

            const nome = new TextInputBuilder()
                .setCustomId('nome')
                .setLabel('Nome RP')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const cognome = new TextInputBuilder()
                .setCustomId('cognome')
                .setLabel('Cognome RP')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const dataNascita = new TextInputBuilder()
                .setCustomId('data_nascita')
                .setLabel('Data di nascita')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const cittadinanza = new TextInputBuilder()
                .setCustomId('cittadinanza')
                .setLabel('Cittadinanza')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const conoscenza = new TextInputBuilder()
                .setCustomId('conoscenza')
                .setLabel('Come hai conosciuto il partito?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(nome),
                new ActionRowBuilder().addComponents(cognome),
                new ActionRowBuilder().addComponents(dataNascita),
                new ActionRowBuilder().addComponents(cittadinanza),
                new ActionRowBuilder().addComponents(conoscenza)
            );

            return interaction.showModal(modal);
        }

        // protezione staff
        const isStaff = member.roles.cache.has(staffRoleId);
        const isAdmin = member.permissions.has('Administrator');

        if (!isStaff && !isAdmin) {
            return interaction.reply({
                content: '❌ Non hai permessi per usare questi pulsanti',
                ephemeral: true
            });
        }

        // ACCETTA
        if (interaction.customId.startsWith('accept_')) {

            const userId = interaction.customId.split('_')[1];
            const user = await interaction.guild.members.fetch(userId).catch(() => null);

            if (!user) {
                return interaction.reply({
                    content: '❌ Utente non trovato',
                    ephemeral: true
                });
            }

            await user.roles.add(autoRoleId);

            return interaction.update({
                content: `✅ Richiesta ACCETTATA da ${interaction.user}`,
                components: []
            });
        }

        // RIFIUTA
        if (interaction.customId.startsWith('reject_')) {

            return interaction.update({
                content: `❌ Richiesta RIFIUTATA da ${interaction.user}`,
                components: []
            });
        }
    }

    // ================= MODAL =================
    if (interaction.isModalSubmit()) {

        if (interaction.customId === 'tesseramento_modal') {

            const staffChannel = interaction.guild.channels.cache.get('1496572681993326655');
            if (!staffChannel) return;

            const userId = interaction.user.id;

            const embed = new EmbedBuilder()
                .setTitle('📩 Nuova richiesta tesseramento')
                .setDescription(`**Utente: ${interaction.user}**
**Nome RP: ${interaction.fields.getTextInputValue('nome')}**
**Cognome RP: ${interaction.fields.getTextInputValue('cognome')}**
**Data di nascita: ${interaction.fields.getTextInputValue('data_nascita')}**
**Cittadinanza: ${interaction.fields.getTextInputValue('cittadinanza')}**
**Come hai conosciuto il partito: ${interaction.fields.getTextInputValue('conoscenza')}**`)
                .setColor('Green')
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`accept_${userId}`)
                    .setLabel('Accetta')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId(`reject_${userId}`)
                    .setLabel('Rifiuta')
                    .setStyle(ButtonStyle.Danger)
            );

            await staffChannel.send({
                embeds: [embed],
                components: [row]
            });

            return interaction.reply({
                content: '✅ Richiesta inviata al partito!',
                ephemeral: true
            });
        }
    }

});

// evita crash
client.on('error', console.error);
process.on('unhandledRejection', console.error);

client.login(process.env.TOKEN);