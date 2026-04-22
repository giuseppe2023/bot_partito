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
        GatewayIntentBits.GuildMembers // 👈 OBBLIGATORIO per benvenuto
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
        .setTitle('🎉 Benvenuto nel Partito RP!')
        .setDescription(
            `👋 Ciao ${member}, benvenuto nel server!\n\n` +
            `Sei appena entrato nel nostro server ${member.guild.name}.\n`
        )
        .setColor('Green')
        .setThumbnail(member.user.displayAvatarURL())
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

        const isStaff = member.roles.cache.has(staffRoleId);
        const isAdmin = member.permissions.has('Administrator');

        // bottone panel → modal
        if (interaction.customId === 'tesseramento_btn') {

            const modal = new ModalBuilder()
                .setCustomId('tesseramento_modal')
                .setTitle('Richiesta Tesseramento');

            const motivo = new TextInputBuilder()
                .setCustomId('motivo')
                .setLabel('Motivo Tesseramento')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const row = new ActionRowBuilder().addComponents(motivo);
            modal.addComponents(row);

            return interaction.showModal(modal);
        }

        // protezione staff
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

            const motivo = interaction.fields.getTextInputValue('motivo');

            const staffChannel = interaction.guild.channels.cache.get('1496572681993326655');
            if (!staffChannel) return;

            const userId = interaction.user.id;

            const embed = new EmbedBuilder()
                .setTitle('📩 Nuova richiesta tesseramento')
                .addFields(
                    { name: '👤 Utente', value: `<@${userId}> (${userId})` },
                    { name: '📝 Motivo', value: motivo }
                )
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

client.login(process.env.TOKEN);