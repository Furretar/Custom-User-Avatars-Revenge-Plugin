import { findByProps, findByStoreName } from "@vendetta/metro";
import { FluxDispatcher } from "@vendetta/metro/common";

const TAG = "[custom-avatars]";
const TARGET_ID = "376407743776686094";
const OVERRIDE_URL = "https://cdn.discordapp.com/attachments/1239712651710435348/1462042785979826306/furina2.png?ex=696cc0f3&is=696b6f73&hm=76a27d1fd87da7033fce3f973630d8277aba24237e45eef332d3bd63400873b0";

let patches = [];

export function onLoad(): void {
    console.log(`${TAG} loaded`);

    const UserStore = findByStoreName("UserStore");
    if (!UserStore) {
        console.log(`${TAG} UserStore not found`);
        return;
    }

    const avatarModule = findByProps("getUserAvatarURL");
    if (!avatarModule) {
        console.log(`${TAG} Avatar module not found`);
        return;
    }

    // Patch getUserAvatarURL
    const originalGetUserAvatarURL = avatarModule.getUserAvatarURL;
    avatarModule.getUserAvatarURL = function (...args) {
        const user = args[0];

        // Only modify if this is the target user
        if (user?.id === TARGET_ID) {
            return OVERRIDE_URL;
        }

        // For everyone else, return the original
        return originalGetUserAvatarURL.apply(this, args);
    };
    patches.push(() => { avatarModule.getUserAvatarURL = originalGetUserAvatarURL; });

    // Patch getUserAvatarSource - THIS IS THE KEY ONE FOR MOBILE
    if (avatarModule.getUserAvatarSource) {
        const originalGetUserAvatarSource = avatarModule.getUserAvatarSource;
        avatarModule.getUserAvatarSource = function (...args) {
            const user = args[0];

            // Only modify if this is the target user
            if (user?.id === TARGET_ID) {
                // Get the original source first
                const original = originalGetUserAvatarSource.apply(this, args);

                // Only modify if we got a valid original (to avoid breaking others)
                if (original) {
                    return {
                        ...original,
                        uri: OVERRIDE_URL
                    };
                }
            }

            // For everyone else, return the original
            return originalGetUserAvatarSource.apply(this, args);
        };
        patches.push(() => { avatarModule.getUserAvatarSource = originalGetUserAvatarSource; });
    }

    // Patch getGuildMemberAvatarSource for guild contexts
    if (avatarModule.getGuildMemberAvatarSource) {
        const originalGetGuildMemberAvatarSource = avatarModule.getGuildMemberAvatarSource;
        avatarModule.getGuildMemberAvatarSource = function (...args) {
            // Try to get the original first to avoid breaking anything
            const original = originalGetGuildMemberAvatarSource.apply(this, args);

            // Try different argument patterns since we don't know the exact signature
            const guildId = args[0];
            const userId = args[1];
            const user = args[0]; // might be user object instead

            // Check if the userId matches (could be in different positions)
            const isTarget = userId === TARGET_ID || user?.id === TARGET_ID;

            if (isTarget && original) {
                return {
                    ...original,
                    uri: OVERRIDE_URL
                };
            }

            // Return original for everyone else
            return original;
        };
        patches.push(() => { avatarModule.getGuildMemberAvatarSource = originalGetGuildMemberAvatarSource; });
    }

    console.log(`${TAG} Patches applied!`);

    // Force a UI refresh to apply changes immediately
    try {
        FluxDispatcher.dispatch({
            type: "USER_UPDATE",
            user: UserStore.getUser(TARGET_ID)
        });
        console.log(`${TAG} Triggered UI refresh`);
    } catch (e) {
        console.log(`${TAG} Could not trigger refresh:`, e.message);
    }
}

export function onUnload(): void {
    console.log(`${TAG} unloading...`);

    // Restore all patches
    patches.forEach(unpatch => unpatch());
    patches = [];

    console.log(`${TAG} unloaded`);
}