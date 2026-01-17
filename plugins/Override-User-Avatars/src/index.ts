import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";

const TAG = "[custom-avatars]";
const TARGET_ID = "376407743776686094";
const OVERRIDE_URL =
    "https://cdn.donmai.us/sample/a5/f2/__furina_genshin_impact_drawn_by_overlord_overlord80000__sample-a5f2de3aa9623900360f7c867f42519c.jpg";

let interval: NodeJS.Timer | undefined;

export function onLoad(): void {
    console.log(`${TAG} loaded`);

    interval = setInterval(() => {
        const UserUtils = findByProps("getAvatarURL");
        if (!UserUtils) return;

        console.log(`${TAG} UserUtils found, patching avatar...`);

        before("getAvatarURL", UserUtils, (args) => {
            const [user] = args;
            if (!user) return;
            if (user.id === TARGET_ID) return OVERRIDE_URL;
        });

        console.log(`${TAG} patch applied`);

        if (interval) {
            clearInterval(interval);
            interval = undefined;
        }
    }, 500); // try every 500ms until found
}

export function onUnload(): void {
    console.log(`${TAG} unloaded`);
    if (interval) {
        clearInterval(interval);
        interval = undefined;
    }
}
