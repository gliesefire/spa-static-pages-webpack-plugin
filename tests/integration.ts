import { SpaStaticPages, DocumentNode } from "../lib/generator";
import { join } from "path";
const routes = ["/", "/Dashboards/Overview", "/Audience/ViewAllAudiences"];
const generator = new SpaStaticPages({
  routes: routes,
  //Technically, '../../' would be proper, but since this would be compiled and outputted to 'built', directory, '..' makes sense
  distDir: join(__dirname, "../dist"),
  tagsToTransform: [
    new DocumentNode("script", ["src"]),
    new DocumentNode("link", ["href"]),
  ],
  minify: true,
});

(async function () {
  try {
    await generator.createPagesFor();
  } catch (err) {
    console.error(err);
  }
})();
