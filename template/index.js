(function (e, o, n) {
    "use strict";

    const { findByProps } = vendetta.metro;
    const { before } = vendetta.patcher;

    const TAG = "[avatar-override]";
    const TARGET_USER_ID = "376407743776686094";
    const OVERRIDE_IMAGE_URL = "https://cdn.donmai.us/sample/a5/f2/__furina_genshin_impact_drawn_by_overlord_overlord80000__sample-a5f2de3aa9623900360f7c867f42519c.jpg";

    let UserUtils;
    let unpatch;

    const plugin = {
        onLoad() {
            o.logger.log(`${TAG} loading`);

            try {
                UserUtils = findByProps("getAvatarURL");
                o.logger.log(`${TAG} UserUtils found`);
            } catch (err) {
                o.logger.error(`${TAG} failed to find UserUtils`, err);
                return;
            }

            unpatch = before("getAvatarURL", UserUtils, (args) => {
                const [user] = args;

                if (!user) {
                    o.logger.log(`${TAG} getAvatarURL called with no user`);
                    return;
                }

                o.logger.log(`${TAG} avatar request for user ${user.id}`);

                if (user.id !== TARGET_USER_ID) return;

                o.logger.log(`${TAG} overriding avatar`);
                return OVERRIDE_IMAGE_URL;
            });

            o.logger.log(`${TAG} patch applied`);
        },

        onUnload() {
            o.logger.log(`${TAG} unloading`);

            if (unpatch) {
                unpatch();
                o.logger.log(`${TAG} patch removed`);
            }
        }
    };

    e.default = plugin;
    Object.defineProperty(e, "__esModule", { value: true });
    return e;

})({}, vendetta, vendetta.ui.components);
