import {
  SpaStaticPages,
  SpaStaticPagesOptions,
  DocumentNode,
  PageDetail,
} from "./lib/generator";
import { join } from "path";
import { Compiler } from "webpack";
import "@babel/register";

const pluginName = "spa-static-pages";

class SpaStaticPagesWebpackPlugin {
  Generator: SpaStaticPages;
  static defaultOptions() {
    return new SpaStaticPagesOptions(
      ["/"],
      join(__dirname, "../../dist"),
      [new DocumentNode("script", ["src"]), new DocumentNode("link", ["href"])],
      true
    );
  }

  // Any options should be passed in the constructor of your plugin,
  // (this is a public API of your plugin).
  constructor(options: SpaStaticPagesWebpackPlugin) {
    //TODO Validate options provided
    this.Generator = new SpaStaticPages({
      ...SpaStaticPagesWebpackPlugin.defaultOptions(),
      ...options,
    });
  }

  apply(compiler: Compiler) {
    // webpack module instance can be accessed from the compiler object,
    // this ensures that correct version of the module is used
    // (do not require/import the webpack or any symbols from it directly).
    const { webpack } = compiler;

    // Compilation object gives us reference to some useful constants.
    const { Compilation } = webpack;

    // RawSource is one of the "sources" classes that should be used
    // to represent asset sources in compilation.
    const { RawSource } = webpack.sources;

    const plugin = {
      name: pluginName,
    };
    compiler.hooks.thisCompilation.tap(plugin, (compilation) => {
      // Tapping to the assets processing pipeline on a specific stage.
      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,

          // Using one of the later asset processing stages to ensure
          // that all assets were already added to the compilation by other plugins.
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        (assets) => {
          // "assets" is an object that contains all assets
          // in the compilation, the keys of the object are pathnames of the assets
          // and the values are file sources.

          // Iterating over all the assets and
          // generating content for our Markdown file.
          return new Promise((resolve, reject) => {
            const asset = compilation.getAsset("index.html");
            const content = asset?.source?.buffer() || asset?.source?.source();

            function emitAssets(pageList: PageDetail[]) {
              pageList.forEach((page) => {
                compilation.emitAsset(
                  page.outputPath,
                  new RawSource(page.html)
                );
              });
            }
            if (content) {
              console.log("Recieved html content from webpack hook.");
              this.Generator.createPagesFor(content).then((pageList) => {
                // emitAssets(pageList);
                resolve();
              });
            } else {
              console.error("No index.html found under assets");
              this.Generator.createPagesFor().then((pageList) => {
                // emitAssets(pageList);
                resolve();
              });
            }
          });
        }
      );
    });
  }
}

export default SpaStaticPagesWebpackPlugin;
