import { findByProps, findByStoreName } from "@vendetta/metro";

const TAG = "[custom-avatars]";
const TARGET_ID = "376407743776686094";
const OVERRIDE_URL = "https://cdn.donmai.us/sample/a5/f2/__furina_genshin_impact_drawn_by_overlord_overlord80000__sample-a5f2de3aa9623900360f7c867f42519c.jpg";

let patches = [];

export function onLoad(): void {
    console.log(`${TAG} loaded`);
    console.log(`${TAG} Target ID: ${TARGET_ID}`);
    console.log(`${TAG} Override URL: ${OVERRIDE_URL}`);

    const UserStore = findByStoreName("UserStore");
    if (!UserStore) {
        console.log(`${TAG} UserStore not found`);
        return;
    }

    const targetUser = UserStore.getUser(TARGET_ID);
    console.log(`${TAG} Target user:`, targetUser?.username, targetUser?.id);

    const avatarModule = findByProps("getUserAvatarURL");
    if (!avatarModule) {
        console.log(`${TAG} Avatar module not found`);
        return;
    }

    console.log(`${TAG} Found functions:`, Object.keys(avatarModule).filter(k => k.includes('Avatar')));

    // Patch getUserAvatarURL
    const originalGetUserAvatarURL = avatarModule.getUserAvatarURL;
    avatarModule.getUserAvatarURL = function (...args) {
        const user = args[0];
        console.log(`${TAG} [getUserAvatarURL] called for:`, user?.username, user?.id);

        if (user?.id === TARGET_ID) {
            console.log(`${TAG} ✅ MATCH in getUserAvatarURL! Returning custom URL`);
            return OVERRIDE_URL;
        }

        return originalGetUserAvatarURL.apply(this, args);
    };
    patches.push(() => { avatarModule.getUserAvatarURL = originalGetUserAvatarURL; });

    // Patch getUserAvatarSource (this is likely what mobile uses!)
    if (avatarModule.getUserAvatarSource) {
        const originalGetUserAvatarSource = avatarModule.getUserAvatarSource;
        avatarModule.getUserAvatarSource = function (...args) {
            const user = args[0];
            console.log(`${TAG} [getUserAvatarSource] called for:`, user?.username, user?.id);

            if (user?.id === TARGET_ID) {
                console.log(`${TAG} ✅ MATCH in getUserAvatarSource! Returning custom source`);
                return { uri: OVERRIDE_URL };
            }

            return originalGetUserAvatarSource.apply(this, args);
        };
        patches.push(() => { avatarModule.getUserAvatarSource = originalGetUserAvatarSource; });
        console.log(`${TAG} Patched getUserAvatarSource`);
    }

    // Patch getGuildMemberAvatarSource too (for guild contexts)
    if (avatarModule.getGuildMemberAvatarSource) {
        const originalGetGuildMemberAvatarSource = avatarModule.getGuildMemberAvatarSource;
        avatarModule.getGuildMemberAvatarSource = function (...args) {
            const [guildId, userId] = args;
            console.log(`${TAG} [getGuildMemberAvatarSource] called for userId:`, userId);

            if (userId === TARGET_ID) {
                console.log(`${TAG} ✅ MATCH in getGuildMemberAvatarSource! Returning custom source`);
                return { uri: OVERRIDE_URL };
            }

            return originalGetGuildMemberAvatarSource.apply(this, args);
        };
        patches.push(() => { avatarModule.getGuildMemberAvatarSource = originalGetGuildMemberAvatarSource; });
        console.log(`${TAG} Patched getGuildMemberAvatarSource`);
    }

    // Also try patching the user object itself
    const originalGetUser = UserStore.getUser;
    UserStore.getUser = function (userId) {
        const user = originalGetUser.call(this, userId);

        if (userId === TARGET_ID && user) {
            console.log(`${TAG} [UserStore.getUser] Intercepted target user, modifying avatar`);
            // Create a proxy to override avatar property
            return new Proxy(user, {
                get(target, prop) {
                    if (prop === 'avatar') {
                        console.log(`${TAG} Returning modified avatar hash`);
                        return 'custom_override_hash';
                    }
                    return target[prop];
                }
            });
        }

        return user;
    };
    patches.push(() => { UserStore.getUser = originalGetUser; });

    console.log(`${TAG} All patches applied!`);

    // Try to force a refresh
    setTimeout(() => {
        console.log(`${TAG} Testing if patches work...`);
        const testUrl = avatarModule.getUserAvatarURL(targetUser, false, 128);
        console.log(`${TAG} Test URL result:`, testUrl);

        if (avatarModule.getUserAvatarSource) {
            const testSource = avatarModule.getUserAvatarSource(targetUser, false, 128);
            console.log(`${TAG} Test source result:`, testSource);
        }
    }, 1000);
}

export function onUnload(): void {
    console.log(`${TAG} unloading...`);

    // Restore all patches
    patches.forEach(unpatch => unpatch());
    patches = [];

    console.log(`${TAG} unloaded`);
}