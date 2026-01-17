import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";

const TAG = "[custom-avatars]";
const target_id = "376407743776686094";
const OVERRIDE_URL = "https://cdn.donmai.us/sample/a5/f2/__furina_genshin_impact_drawn_by_overlord_overlord80000__sample-a5f2de3aa9623900360f7c867f42519c.jpg";

export function onLoad(): void {
    console.log(`${TAG} loaded`);

    const UserUtils = findByProps("getAvatarURL");

    if (!UserUtils) {
        console.log(`${TAG} UserUtils not found`);
        return;
    } else {
        console.log(`${TAG} UserUtils`);

    }
}

export function onUnload(): void {
    console.log(`${TAG} unloaded`);
}
