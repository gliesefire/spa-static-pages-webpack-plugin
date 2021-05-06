import {
  SpaStaticPages,
  SpaStaticPagesOptions,
  DocumentNode,
} from "./lib/generator";
import { join } from "path";
import { Compiler } from "webpack";
import "@babel/register"

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
    const plugin = {
      name: pluginName,
    };
    compiler.hooks.emit.tapPromise(plugin, (compilation) => {
      const asset = compilation.getAsset('index.html');
      const content = asset?.source?.buffer() || asset?.source?.source();
      if (content) 
      {
        console.log('Recieved html content from webpack hook.');
        return this.Generator.createPagesFor(content);
      }
      else{
        console.error('No index.html found under assets');
      }
      return this.Generator.createPagesFor();
    });
  }
}

export default SpaStaticPagesWebpackPlugin;
