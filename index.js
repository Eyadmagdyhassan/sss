const express = require("express");
const app = express();

app.listen(() => console.log("I'm Ready To Work..!"));
app.get('/', (req, res) => {
  res.send(`

  <body>

  <center><h1>Apply Project<h1><p>This is Project For the staff application , made with the MODALS , Made by : Saleh</p>
  <button>
<a href= "https://discord.gg/xvsNCdS3Uu">Click here</a>
</button>

  </body>`)
});

const Discord = require("discord.js")

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS , Intents.FLAGS.GUILD_MESSAGES] })
client.setMaxListeners(0)
const prefix = "+"
const db = require("pro.db")

client.on("ready" , () => {
  console.log("I'm Ready") 
});

const { DiscordModal,ModalBuilder,ModalField } = require ('discord-modal');
DiscordModal(client)

const { MessageActionRow ,  MessageButton  } = require('discord.js')

  client.on("messageCreate" , message => {
      if(message.content.startsWith(prefix + "set-channel")) {
          let channel = message.mentions.channels.first()
          if(!channel) return message.reply(":x: **Mention a channel**")
          db.set(`channel_${message.guild.id}` , channel.id)
          message.reply("**Done added this channel to the DB ✅**")
      }
  });

  client.on("messageCreate" , message => {
    if(message.content.startsWith(prefix + "set-role")) {
      let role = message.mentions.roles.first()
if(!role) return message.reply("**:x: | Mention A Role**")
      db.set(`role_${message.guild.id}` , role.id)
      message.reply("**Done added this role to the DB ✅**")
    }
  });

  client.on("messageCreate" , message => {
    if(message.content.startsWith(prefix + "set-highrole")) {
let role = message.mentions.roles.first()
if(!role) return message.reply("**:x: | Mention A Role**")
      db.set(`rolehigh_${message.guild.id}` , role.id)
      message.reply("**Done added this role to the DB ✅**")
    }
  });

  client.on("messageCreate" , message => {
    if(message.content == prefix + "setup") {
      if(!db.has(`channel_${message.guild.id}`)) return  message.reply(`**Specify first !**\n**\`set-channel\`**`)
        if(!db.has(`role_${message.guild.id}`)) return  message.reply(`**Specify first !**\n**\`set-role\`**`)
          if(!db.has(`rolehigh_${message.guild.id}`)) return  message.reply(`**Specify first !**\n**\`set-highrole\`**`)

      let row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
      .setCustomId("apply")
      .setLabel("Click Here !")
      .setStyle("SUCCESS")
      )
      let embed = new Discord.MessageEmbed()
      .setAuthor({name:message.guild.name , iconUrl :message.guild.iconURL()})
      .setTitle("**نموذج التقديم :**")
      .setDescription("**اضغط على الزر لاظهار نموذج التقديم لك !**")
      .setColor("#18191c")
      message.delete()
      message.channel.send({components:[row] , embeds:[embed]})
    }
  });

  const cooldown = new Set()

  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'apply') {
       if(cooldown.has(interaction.member.id)) return interaction.reply({content : "Cooldown !" , ephemeral:true})
       let role = db.get(`role_${interaction.guild.id}`)
       let user = db.get(`user_${interaction.member.id}`)  
       if(user) return interaction.reply({content : "You are already in the apply list !" , ephemeral:true})
       if(interaction.member.roles.cache.some(r=>r.id == role)) return interaction.reply({content : "You are already a staff !" , ephemeral:true}) 

      const modal = new ModalBuilder()
        .setCustomId('modal')
        .setTitle('نموذج التقديم :')
              .addComponents(
            new ModalField()
        .setCustomId('name')
        .setLabel("ما اسمك ؟")
              .setRequired(true)
              .setPlaceholder("ادخل اسمك هنا ...")
        .setStyle('SHORT'),

            new ModalField()
        .setCustomId('age')
        .setLabel("كم عمرك ؟")
              .setRequired(true)
              .setPlaceholder("ادخل عمرك هنا ...")
        .setStyle('SHORT'),

              new ModalField()
        .setCustomId('dis')
              .setRequired(true)
              .setPlaceholder("ادخل مدة دخلوك لبرنامج الديسكورد هنا ...")
        .setLabel("كم لك ببرنامج الديسكورد")
        .setStyle('SHORT'),

              new ModalField()
        .setCustomId('job')
              .setRequired(true)
              .setPlaceholder("ادخل عملك هنا ...")
        .setLabel("كيف بتفيدنا بالسيرفر")
        .setStyle('PARAGRAPH')
              )

      client.modal.open(interaction , modal);
      setTimeout(() => {
      cooldown.delete(interaction.member.id)
    } , 18000000);
    }
  });

  client.on('modalSubmitInteraction', async interaction => {
      if(interaction.customId == "modal") {
       cooldown.add(interaction.member.id)
       let ch = db.get(`channel_${interaction.guild.id}`)
       let channel = interaction.guild.channels.cache.find(c => c.id == ch)
       const name = interaction.fields.getTextInputValue("name")
       const age = interaction.fields.getTextInputValue("age")
       const dis = interaction.fields.getTextInputValue("dis")
       const job = interaction.fields.getTextInputValue("job")
       let row = new MessageActionRow().addComponents(
         new Discord.MessageButton()
         .setLabel("Accept ✅")
         .setCustomId("acc")
         .setStyle("SUCCESS"),
         new Discord.MessageButton()
         .setLabel("Refuse ❌")
         .setCustomId("dec")
         .setStyle("DANGER"),
         new Discord.MessageButton()
         .setLabel("Timeout 🤐")
         .setCustomId("time")
         .setStyle("SECONDARY")
       )
       interaction.reply({content:"Done sending your application form !" , ephemeral:true})
       channel.send({content:`**تقديم جديد من : <@${interaction.member.id}>**\n**- الاسم : ${name}**\n**- العمر : ${age}**\n**- مدة الحساب في الديسكورد : ${dis}**\n**- عمله : ${job}**` , components:[row]}).then(m=> {
       db.set(`userm_${m.id}` , interaction.member.id)
       db.set(`message_${m.id}` , m.id)
       })
     }
  });

  client.on("interactionCreate" , interaction => {
    if(interaction.isButton()) {
      if(interaction.customId == "acc") {
        let high = db.get(`rolehigh_${interaction.guild.id}`)
        let role1 = db.get(`role_${interaction.guild.id}`)
        if(!interaction.member.roles.cache.some(r=>r.id == high)) return interaction.reply({content:"You Are Not A High Staff !" , ephemeral:true})
                let user = db.get(`userm_${interaction.message.id}`)
                let member = interaction.guild.members.cache.get(user)
                let role = interaction.guild.roles.cache.find(r=>r.id == role1)
                let m = interaction.channel.messages.cache.find(r=>r.id == db.get(`message_${interaction.message.id}`))
                member.roles.add([role]).catch(err=>{})
                member.send(`**لقد تم قبول تقديمك ! 🥳 **`)
                m.edit({content:`**تقديم مقبول من : ${member} ✅**` , components:[]})
                db.delete(`userm_${interaction.message.id}`)
                db.delete(`message_${interaction.message.id}`)
          }

      if(interaction.customId == "dec") {
        let high = db.get(`rolehigh_${interaction.guild.id}`)
        if(!interaction.member.roles.cache.some(r=>r.id == high)) return interaction.reply({content:"You Are Not A High Staff !" , ephemeral:true})
              let user = db.get(`userm_${interaction.message.id}`)
              let member = interaction.guild.members.cache.get(user)
              let m = interaction.channel.messages.cache.find(r=>r.id == db.get(`message_${interaction.message.id}`))
              m.edit({content:`**تقديم مرفوض من : ${member} ❌**` , components:[]})
              member.send(`**لقد تم رفض تقديمك ! 😥**`)
              db.delete(`userm_${interaction.message.id}`)
              db.delete(`message_${interaction.message.id}`)
      }
      if(interaction.customId == "time") {
        let high = db.get(`rolehigh_${interaction.guild.id}`)
        if(!interaction.member.roles.cache.some(r=>r.id == high)) return interaction.reply({content:"You Are Not A High Staff !" , ephemeral:true})
        let user = db.get(`userm_${interaction.message.id}`)
        let member = interaction.guild.members.cache.get(user)
        let m = interaction.channel.messages.cache.find(r=>r.id == db.get(`message_${interaction.message.id}`))
        m.edit({content:`**لقد تم اسكات: ${member} 🤐**` , components:[]})
        member.send(`**لقد تم اسكاتك ! 🤐**`)
        member.timeout(86400000).catch(err=>{})
        db.delete(`userm_${interaction.message.id}`)
        db.delete(`message_${interaction.message.id}`)
      }
    }
  });

client.login("MTI2MTg4MDA0NjM5ODg2NTUwOQ.GqMUbW.oxSn9M_5eNledaNxlf8YCFH0O7JUslNxJicXTI")