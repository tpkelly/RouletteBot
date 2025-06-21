# Roulette Bot

A Discord bot to help organise roleplay for FFXIV Roleplaying communities. Configurable for different styles, this bot helps by mixing together any participants and pairing them up, inviting them to talk between themselves and arrange to roleplay one-on-one. The how, where and when is left up to the roleplayers, but provides a handy automation tool to help them get started.

![image](https://github.com/user-attachments/assets/d70b2a77-eeb8-479e-b8a0-4be3c8a1b9bd)

# Commands
- `/setup`: Configure the bot for your server, picking where and when to start roulettes, how often, and what style of roulette you would like. Only members with "Manage Server" permissions can configure for the server.
- `/info`: Display basic information about when and how the next roleplay roulette will take place, as well as checking the bot permissions are configured correctly for a quick and easy roulette.
- `/generate`: Rather than waiting for the roulette to start, members with "Manage Server" permissions can instead manually begin a roulette with all current signed-up roleplayers.
- `/rpdice`: Roleplayers getting stuck for ideas? Roll the roleplay dice for some quick suggestions on open-world locations and themes to roleplay. Feel free to pick and choose which suggestions appeal to you, or roll the dice again for a different suggestion

![image](https://github.com/user-attachments/assets/a70ff596-b045-42af-8311-86ac66247aa9)

# Permissions

The bot requests the following permissions in order to run roulettes. Below are explanations for each of these:
- **View Channels**: Necessary to set up the bot and allow it to present options for where the roulettes should be organised
- **Send Messages**: Allows the bot to send notifications to begin the roulette sign-ups. In the 'Single Post Roulette' mode, this will also post all of the matched roleplayers together to notify them of their partners.
- **Send Messages in Threads**: After the bot creates a private thread for a roulette match, it posts an introduction and instructions to the participants. Only used in 'Thread Roulette' mode.
- **Create Private Threads**: Allows the bot to create private threads under the chosen roulette channel, with each participant. Only used in 'Thread Roulette' mode.
- **Manage Roles**: Allows the bot to create the `@Roulette Notification` and `@Roulette Entry` role, and assign the `@Roulette Entry` role to participants when they register. Also allows the bot to remove the `@Roulette Entry` role after matches are drawn.
- **Mention @everyone, @here and All Roles (optional)**: In the case where an existing role is chosen for notifications, this is to ensure the bot can still @mention the role to announce sign-ups. If the role is already able to be mentioned by all server members, or if the bot is instead allowed to create its own `@Roulette Notification` role, this will not be required.
- **Manage Threads (optional)**:  Future development will add features where this will be required. While this is not needed in the current features, a preview of the upcoming feature is available on [the Light Support bot](https://github.com/tpkelly/light-support/blob/master/roulette.js#L40C1-L91C1) where a "Roulette Preferences" thread is deleted once it is no longer needed.

# Data Usage

The Roulette Bot does not store any data about individual users. Instead, entries are assigned a role, and all members who have that role at the time of the Roulette start will be entered. No distinction is made between members who received the role from the bot, or were manually assigned it by another user. Likewise, members who leave the server or have the role manually removed are not included in the Roulette.

A small amount of configuration data is stored for each server to keep track of the choices made during the `/setup` and other details required to run the roulettes automatically. This configuration data covers:
- The discord server ID
- The roulette channel ID
- The role ID for Notifications
- The role ID for Entries
- How frequently should roulettes be run (Weekly/Fortnightly/Monthly)
- The chosen roulette mode (Threads/Single Post/Manual draw)
- The date of the next roulette notification
- The date of the next roulette start

![image](https://github.com/user-attachments/assets/e735be94-0ca8-44b5-80d0-5f1c0f821c98)

The details of the [Privileged intents](https://support.discord.com/hc/en-us/articles/7933951485975-Visibility-of-Bot-Data-Access) can be seen under the "Data Access" tab. The bot requests the "Guild Members" intent to see which members of the server have the `@Roulette Entry` role in order to enroll them. The bot does **not** have the "Read Messaages" or "Presences" intent.

# Contact

Comments, questions, concerns or suggestions? I'm more than happy to hear them! I'm on discord as "kazenone", and you are more than welcome to send a message or friend request
