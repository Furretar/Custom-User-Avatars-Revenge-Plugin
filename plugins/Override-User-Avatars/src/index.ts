import { findByProps, findByStoreName } from "@vendetta/metro";
import { before } from "@vendetta/patcher";

const TAG = "[custom-avatars]";
const TARGET_ID = "376407743776686094";
// Using a publicly accessible image URL that won't give 403 errors
const OVERRIDE_URL = "https://i.imgur.com/5uUZQVv.png";

let unpatch;
let functionPatch;

export function onLoad(): void {
    console.log(`${TAG} loaded`);
    console.log(`${TAG} Target ID: ${TARGET_ID}`);
    console.log(`${TAG} Override URL: ${OVERRIDE_URL}`);

    const UserStore = findByStoreName("UserStore");
    if (!UserStore) {
        console.log(`${TAG} UserStore not found`);
        return;
    }

    // Test if we can get the target user
    const targetUser = UserStore.getUser(TARGET_ID);
    console.log(`${TAG} Target user from store:`, targetUser);

    // Find the module that contains getUserAvatarURL
    const avatarModule = findByProps("getUserAvatarURL");
    if (!avatarModule) {
        console.log(`${TAG} Avatar module not found`);
        return;
    }

    console.log(`${TAG} Found avatar module:`, Object.keys(avatarModule));
    console.log(`${TAG} getUserAvatarURL type:`, typeof avatarModule.getUserAvatarURL);

    // Store the original function
    const originalGetUserAvatarURL = avatarModule.getUserAvatarURL;

    // Replace the function entirely
    avatarModule.getUserAvatarURL = function (user, animated, size) {
        // Log every call to see what's happening
        const userId = user?.id;
        const username = user?.username;

        if (userId === TARGET_ID) {
            console.log(`${TAG} ✅ MATCH! Returning custom avatar for ${username} (${userId})`);
            console.log(`${TAG} Arguments - animated: ${animated}, size: ${size}`);
            console.log(`${TAG} Returning URL: ${OVERRIDE_URL}`);
            return OVERRIDE_URL;
        }

        // For debugging, log occasional other calls
        if (Math.random() < 0.01) { // Log ~1% of other calls
            console.log(`${TAG} Other user: ${username} (${userId})`);
        }

        return originalGetUserAvatarURL(user, animated, size);
    };

    // Also try patching with before() as a backup
    unpatch = before("getUserAvatarURL", avatarModule, (args) => {
        const [user] = args;
        if (user?.id === TARGET_ID) {
            console.log(`${TAG} [before patch] Intercepted for target user`);
        }
    });

    console.log(`${TAG} Successfully patched getUserAvatarURL`);

    // Force a re-render by trying to invalidate cache
    try {
        if (UserStore.getUser) {
            console.log(`${TAG} Attempting to trigger user update...`);
            UserStore.getUser(TARGET_ID);
        }
    } catch (e) {
        console.log(`${TAG} Error triggering update:`, e);
    }
}

export function onUnload(): void {
    console.log(`${TAG} unloaded`);

    // Clean up patches
    if (unpatch) {
        unpatch();
        console.log(`${TAG} Removed before patch`);
    }

    // Try to restore original function
    const avatarModule = findByProps("getUserAvatarURL");
    if (avatarModule && functionPatch) {
        console.log(`${TAG} Attempting to restore original function`);
    }
}