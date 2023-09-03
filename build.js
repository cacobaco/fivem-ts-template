const esbuild = require("esbuild");

const production =
    process.argv.findIndex((argItem) => argItem === "--mode=production") >= 0;

const plugins = (context) => [
    {
        name: "watch-plugin",
        setup(build) {
            build.onEnd((res) => {
                if (res.errors.length > 0) {
                    return console.error(
                        `[${context}]: Rebuild failed`,
                        res.errors
                    );
                }

                console.log(
                    `[${context}]: Rebuild succeeded, warnings:`,
                    res.warnings
                );
            });
        },
    },
];

const server = {
    platform: "node",
    target: ["node16"],
    format: "cjs",
};

const client = {
    platform: "browser",
    target: ["chrome93"],
    format: "iife",
};

const build = async (context) => {
    try {
        let ctx = await esbuild.context({
            bundle: true,
            entryPoints: [`src/${context}/${context}.ts`],
            outfile: `build/${context}.js`,
            minify: production,
            ...(context === "client" ? client : server),
            plugins: plugins(context),
        });

        if (production) {
            ctx.rebuild();
            console.log(`[${context}]: Built successfully!`);
            process.exit(0);
        } else {
            ctx.watch();
        }
    } catch {
        process.exit(1);
    }
};

for (const context of ["client", "server"]) {
    build(context);
}
