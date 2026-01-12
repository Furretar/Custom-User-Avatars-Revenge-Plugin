(function (e, o, n) {
    "use strict";

    const { FormText: t } = n.Forms;

    function l() {
        return React.createElement(t, null, "Hello, world!");
    }

    var r = {
        onLoad: function () {
            o.logger.log("Hello world!");
        },
        onUnload: function () {
            o.logger.log("Goodbye, world.");
        },
        settings: l
    };

    e.default = r;
    Object.defineProperty(e, "__esModule", { value: true });
    return e;

})({}, vendetta, vendetta.ui.components);
