import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";
import { findByStoreName } from "@vendetta/metro";

const TAG = "[custom-avatars]";
const TARGET_ID = "376407743776686094";
const OVERRIDE_URL = "https://cdn.donmai.us/sample/a5/f2/__furina_genshin_impact_drawn_by_overlord_overlord80000__sample-a5f2de3aa9623900360f7c867f42519c.jpg";

export function onLoad(): void {
    console.log(`${TAG} loaded`);


    const UserStore = findByStoreName("UserStore");
    if (!UserStore) {
        console.log(`${TAG} UserStore not found`);
        return;
    } else {
        console.log(`${TAG} UserStore`);
    }

    before("getUserAvatarURL", UserStore, (args) => {
        const [user, animated, size] = args;
        if (!user) return;

        if (user.id === TARGET_ID) {
            // return the override URL directly
            return OVERRIDE_URL;
        }
    });
}

export function onUnload(): void {
    console.log(`${TAG} unloaded`);
}
