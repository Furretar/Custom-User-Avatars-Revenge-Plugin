import { findByProps, findByStoreName } from "@vendetta/metro";
import { before } from "@vendetta/patcher";

const TAG = "[custom-avatars]";
const TARGET_ID = "376407743776686094";
const OVERRIDE_URL = "https://cdn.donmai.us/sample/a5/f2/__furina_genshin_impact_drawn_by_overlord_overlord80000__sample-a5f2de3aa9623900360f7c867f42519c.jpg";

let unpatch;

export function onLoad(): void {
    console.log(`${TAG} loaded`);

    const UserStore = findByStoreName("UserStore");
    if (!UserStore) {
        console.log(`${TAG} UserStore not found`);
        return;
    }

    // Find the module that contains getUserAvatarURL
    const avatarModule = findByProps("getUserAvatarURL");
    if (!avatarModule) {
        console.log(`${TAG} Avatar module not found`);
        return;
    }

    console.log(`${TAG} Found avatar module, patching...`);

    // Patch the getUserAvatarURL function
    unpatch = before("getUserAvatarURL", avatarModule, (args) => {
        const [user, animated, size] = args;

        // Check if this is the target user
        if (user && user.id === TARGET_ID) {
            console.log(`${TAG} Intercepted avatar request for target user`);

            // Override by modifying the user object's avatar property
            // This will cause Discord to use our custom URL
            return [
                {
                    ...user,
                    avatar: null // Set to null so we can fully control the URL
                },
                animated,
                size
            ];
        }
    });

    // Alternative approach: Directly replace the function
    const originalGetUserAvatarURL = avatarModule.getUserAvatarURL;
    avatarModule.getUserAvatarURL = function (user, animated, size) {
        if (user && user.id === TARGET_ID) {
            console.log(`${TAG} Returning custom avatar for target user`);
            return OVERRIDE_URL;
        }
        return originalGetUserAvatarURL(user, animated, size);
    };

    console.log(`${TAG} Successfully patched getUserAvatarURL`);
}

export function onUnload(): void {
    console.log(`${TAG} unloaded`);

    // Clean up patches
    if (unpatch) {
        unpatch();
    }
}