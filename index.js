const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


//const docRef = db.collection('users')
const collRef = db.collection('assined')
//const initRef = db.collection('initialvalue').doc('discord')


const Discord = require('discord.js')
const client = new Discord.Client({partials: ["MESSAGE", "USER", "REACTION"]});
const prefix = '!';
const fs = require('fs')

const channelId = '825389647471443978'
const guildId = '826834993857822783'
const assineId = '824965510441205811'


client.once("ready", () => {
    console.log('bot is working hard')
    client.channels.fetch(channelId).then(chanel => {
            reactionMsg(chanel)


        }
    )

})


client.on("message", async (messssage) => {


    if (messssage.channel.id === channelId) {
        if (!messssage.author.bot) {
            messssage.delete({timeout: 1})
            return;
        }
    }

})

async function reactionMsg(channel) {



    async function clear() {

        const fetched = await channel.messages.fetch({limit: 99}).then(feched => {
            //console.log('eiowh8owefy8ef')
            channel.bulkDelete(feched)

        });

    }

    await clear();


    const supportMessage = await channel.send("Press '?' emoji to open a Support page !");
    const banMessage = await channel.send("Press '!' emoji to open a Ban-appeal page");


    try {
        await supportMessage.react("❓");
        await banMessage.react("❗");
    } catch (err) {
        channel.send("Error sending emojis!");
        throw err;
    }


}


client.on("messageReactionAdd", async (reaction, user) => {


    if (user.partial) await user.fetch();
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
    if (user.bot) return;


    if (reaction.message.channel.id === assineId) {

        const useref = db.collection("assined").doc((reaction.message.id))
        const doc = await useref.get();
        if (!doc.exists) {
            console.log('No such document!');
        }


        if (!(reaction.emoji.name === '🚫' || reaction.emoji.name === '✅')) {
            reaction.users.remove(user)
            return;

        }
        if (reaction.emoji.name === '🚫') {
            const member = reaction.message.guild.member(user)

            if (doc.get('assinedto') === user.username || member.hasPermission("ADMINISTRATOR")) {
                client.channels.fetch(doc.get('channelid')).then(channel => {
                    channel.delete();
                    reaction.message.delete();


                    useref.update({
                        closed: true
                    })
                })
            } else {
                reaction.users.remove(user)
            }


        }

        if (reaction.emoji.name === "✅") {


            //console.log('Document data:', doc.data());

            if (doc.get('assined') === undefined) {
                const d = await useref.update({
                    assinedto: user.username,
                    assined: true

                }).catch(err => console.log(err))
                client.channels.fetch(doc.get('channelid')).then(channel => {


                })
                if (doc.get("channelName") === `support-${user.username}`) {
                } else {
                }

                const collRef = db.collection('users').doc(user.username)


                const col = collRef.set({
                    channelId: doc.get("channelid"),

                })

                client.channels.fetch(doc.get("channelid")).then(channel => {

                    channel.overwritePermissions([{
                        id: user.id,
                        allow: ["VIEW_CHANNEL"]
                    }])

                })

                //console.log('first')
            } else if (doc.get("assinedto") === user.username) {


            } else {
                reaction.users.remove(user);
            }

        }

    }


    if (reaction.message.channel.id === channelId) {

        if (!(reaction.emoji.name === '❓' || reaction.emoji.name === '❗')) {
            reaction.users.remove(user)
            return;

        }

        let allClosed = true;
        if (reaction.emoji.name === "❓") {
            //console.log(user)
            reaction.users.remove(user)
            const snap = await collRef.where("channelName", '==', `support-${user.username}`).get();


            snap.forEach(doc => {

                if (!doc.get('closed')) {

                    allClosed = false;

                }


            })


            console.log(allClosed)
            if (allClosed) {
                await createChannel()
            } else if (snap.empty) {
                await createChannel()
            }


            async function createChannel() {
                reaction.message.guild.channels.create(`support-${user.username}`, {
                    permissionOverwrites: [
                        {
                            id: user.id,
                            allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                        },
                        {
                            id: reaction.message.guild.roles.everyone,
                            deny: ["VIEW_CHANNEL"]
                        }
                    ],
                    type: 'text', parent: guildId
                }).then(async channel => {
                    //(await channel.setParent('825309941962506280')).permissionOverwrites()

                    channel.send('We will get to you soon ..')

                    client.channels.fetch(assineId).then(async (modAssineChannel) => {
                            const react = await modAssineChannel.send(user.username + ' created a support page').then(async (assignMessage) => {
                                const userref = db.collection("assined").doc(assignMessage.id)
                                const init = await userref.set({
                                    messageid: assignMessage.id,
                                    appealedBy: user.username,
                                    channelid: channel.id,
                                    channelName: `support-${user.username}`,

                                    closed: false
                                })
                                assignMessage.react("✅")
                                assignMessage.react("🚫")

                                // client.on("message", messageLisner => {
                                //     if (messageLisner.channel.id === channel.id) {
                                //
                                //
                                //         console.log(messageLisner.content)
                                //
                                //     }
                                // })


                            })

                            // await react.react("✅")
                            // await react.react("🚫")

                        }
                    )
                })
            }
        } else if (reaction.emoji.name === "❗") {
            //console.log(user)
            reaction.users.remove(user)
            const snap = await collRef.where("channelName", '==', `ban_appeal-${user.username}`).get();


            snap.forEach(doc => {

                if (!doc.get('closed')) {

                    allClosed = false;

                }


            })


            console.log(allClosed)
            if (allClosed) {
                await createChannelBan()
            } else if (snap.empty) {
                await createChannelBan()
            }


            async function createChannelBan() {

                reaction.message.guild.channels.create(`ban_appeal-${user.username}`, {
                    permissionOverwrites: [
                        {
                            id: user.id,
                            allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                        },
                        {
                            id: reaction.message.guild.roles.everyone,
                            deny: ["VIEW_CHANNEL"]
                        }
                    ],
                    type: 'text', parent: guildId
                }).then(async channel => {
                    //(await channel.setParent('825309941962506280')).permissionOv.erwrites()


                    client.channels.fetch(assineId).then(async (modChannel) => {
                            const react = await modChannel.send(user.username + ' created a ban appeal').then(async (modMessage) => {
                                //console.log(modMessage.id)
                                const userref = db.collection("assined").doc(modMessage.id)
                                const init = await userref.set({
                                    messageid: modMessage.id,
                                    appealedBy: user.username,
                                    channelid: channel.id,
                                    channelName: `ban_appeal-${user.username}`,
                                    closed: false
                                })
                                modMessage.react("✅")
                                modMessage.react("🚫")
                                channel.send('Answer these questions and wait we will get back soon ..\n' +
                                    '1.What is your in game name ?\n' +
                                    '2.Why did you get banned ?\n' +
                                    '3.Why should we un-ban you ?').then(async (banChannelMessage) => {


                                    //console.log(banChannelMessage.id)
                                    const userref = db.collection("assined").doc(modMessage.id)

                                    const ini = await userref.update({
                                        channelmessid: banChannelMessage.id,
                                    })


                                    client.on("message", async (messageLisner) => {
                                        if (messageLisner.channel.id === channel.id) {
                                            const userchat = db.collection("users").doc(`ban_appeal-${user.username}`)
                                            const doc = await userchat.get();
                                            if (!doc.exists) {
                                                const a = userchat.set({

                                                    [messageLisner.id]: messageLisner.author.username+' : '+messageLisner.content

                                                })
                                                //console.log('not')
                                            } else {

                                                const a = userchat.update({

                                                    [messageLisner.id]: messageLisner.author.username+' : '+messageLisner.content

                                                })
                                                //console.log("yes")
                                            }

                                        }
                                    })


                                })

                            })


                        }
                    )
                })
            }
        }
    }
})


client.login('ODI0OTU1MjIyMTkwODUwMDc4.YF25aw.M2r0I4BzHjw331lFkrU7PxEXUck')