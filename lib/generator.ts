import { load } from "cheerio";
import { join, relative } from "path";

import { minify } from "html-minifier";

import * as fs from 'fs'
import { isFileExists } from "./helpers";

class PageDetail {
  route: string;
  outputDir: string;
  html: string;
  outputPath: string;
  constructor(
    route: string,
    outputDir: string,
    html: string,
    outputPath: string
  ) {
    this.route = route;
    this.outputDir = outputDir;
    this.html = html;
    this.outputPath = outputPath;
  }
}

class DocumentNode {
  tagName: string;
  attributeList: string[];
  constructor(tagName: string, attributeList: string[]) {
    this.tagName = tagName;
    this.attributeList = attributeList;
  }
}

class SpaStaticPagesOptions {
  routes: string[];
  distDir: string;
  tagsToTransform: DocumentNode[];
  minify: boolean;
  entryFileName: string;
  constructor(
    routes: string[],
    distDir: string,
    tagsToTransform: DocumentNode[],
    minify: boolean,
    entryFileName: string = "index.html"
  ) {
    this.routes = routes;
    this.distDir = distDir;
    this.tagsToTransform = tagsToTransform;
    this.minify = minify;
    this.entryFileName = entryFileName;
  }
}

function removeElement(array: string[], elem: string) {
  var index = array.indexOf(elem);
  if (index > -1) {
    array.splice(index, 1);
  }
}

class SpaStaticPages {
  options: SpaStaticPagesOptions;
  pageList: PageDetail[];
  constructor(options: SpaStaticPagesOptions) {
    this.options = options;
    //TODO: Validation of options
    removeElement(this.options.routes, "/");
    //TODO: Check if '/' was the only route
  }

  // Calculate outputPath
  async setupDirectory() {
    this.pageList = new Array();
    for (let i = 0; i < this.options.routes.length; ++i) {
      const route = this.options.routes[i];
      const outputDir = join(this.options.distDir, route);
      try {
        const relativeFilePath = relative(this.options.distDir, join(outputDir, this.options.entryFileName));
        this.pageList.push(
          new PageDetail(
            route,
            outputDir,
            null,
            relativeFilePath
          )
        );
      } catch (err) {
        if (typeof err === "string") {
          throw `Unable to create directory ${outputDir} for route ${route}. \n ${err}`;
        }
        throw err;
      }
    }
  }

  modifyHtml(data: Buffer | string) {
    const dataAsString = data.toString();
    const $ = load(dataAsString);
    this.pageList.forEach((page) => {
      this.options.tagsToTransform.forEach((node) => {
        $(node.tagName).each((_index, element) => {
          node.attributeList.forEach((attribute) => {
            const assetLocation = join(
              this.options.distDir,
              $(element).attr(attribute)
            );
            const assetFileName = assetLocation
              .split("\\")
              .pop()
              .split("/")
              .pop();
            const newAssetLocation = join(
              relative(page.outputDir, this.options.distDir),
              assetFileName
            );
            if (newAssetLocation != "")
              $(element).attr(attribute, newAssetLocation);
          });
        });
      });
      page.html = $.html();
    });
  }

  minifyPages() {
    if (this.options.minify) {
      //Minify content if specified
      console.log("Minification is enabled. Minifying it");
      this.pageList.forEach((page) => {
        page.html = minify(page.html);
      });
      console.log("Minification complete for all pages");
    }
  }

  async createPagesFor(entryFileSource: string | Buffer = null) {
    await this.setupDirectory();

    if (!entryFileSource) {
      const indexHtmlPath = join(
        this.options.distDir,
        this.options.entryFileName
      );
      if (!isFileExists(indexHtmlPath))
        throw `'No ${this.options.entryFileName} found at ${this.options.distDir} directory.`;

      console.log(
        `Picking up ${this.options.entryFileName} from ${this.options.distDir}`
      );
      const fileContents = fs.readFileSync(indexHtmlPath);
      this.modifyHtml(fileContents);
    } else this.modifyHtml(entryFileSource);

    this.minifyPages();
    // await this.copyRouteFilesToDestination();
    console.log(JSON.stringify(this.pageList));
    return this.pageList;
  }
}

export { SpaStaticPages, SpaStaticPagesOptions, DocumentNode, PageDetail };
