"use strict";
const { SpecReporter } = require('jasmine-spec-reporter');
jasmine.getEnv().clearReporters(); // remove default reporter logs
jasmine.getEnv().addReporter(new SpecReporter({
    spec: {
        displayPending: true
    }
}));
//# sourceMappingURL=reporter.js.map