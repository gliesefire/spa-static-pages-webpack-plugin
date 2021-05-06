import { load } from "cheerio";
import { join, relative } from "path";

import * as fs from "fs";
import { minify } from "html-minifier";

import { mkdirP, createFileP, isFileExists } from "./helpers";

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
  constructor(
    routes: string[],
    distDir: string,
    tagsToTransform: DocumentNode[],
    minify: boolean
  ) {
    this.routes = routes;
    this.distDir = distDir;
    this.tagsToTransform = tagsToTransform;
    this.minify = minify;
  }
}

class SpaStaticPages {
  options: SpaStaticPagesOptions;
  pageList: PageDetail[];
  constructor(options: SpaStaticPagesOptions) {
    this.options = options;
  }

  // Calculate outputPath & create it if it doesn't exist
  async setupDirectory() {
    this.pageList = new Array();
    for (let i = 0; i < this.options.routes.length; ++i) {
      const route = this.options.routes[i];
      const outputDir = join(this.options.distDir, route);
      try {
        await mkdirP(outputDir, {
          recursive: true,
        });
      } catch (err) {
        if (typeof err === "string") {
          throw `Unable to create directory ${outputDir} for route ${route}. \n ${err}`;
        }
        throw err;
      }

      this.pageList.push(
        new PageDetail(route, outputDir, null, join(outputDir, "index.html"))
      );
    }
  }

  modifyHtml(data: Buffer | string) {
    const dataAsString = data.toString();
    const $ = load(dataAsString);
    this.pageList.forEach((page) => {
      if (page.route === "/") {
        page.html = dataAsString;
        return;
      }
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

  async copyRouteFilesToDestination() {
    for (let i = 1; i < this.pageList.length; ++i) {
      try {
        const result = await createFileP(
          this.pageList[i].outputPath,
          this.pageList[i].html
        );
        if (result != this.pageList[i].outputPath) throw result;
        console.log(
          `Route static page ${this.pageList[i].route} generated successfully to ${this.pageList[i].outputPath}`
        );
      } catch (err) {
        throw `Unable to write rendered route to file "${this.pageList[i].outputPath}" \n ${err}.`;
      }
    }
  }

  minifyPages() {
    if (this.options.minify) {
      //Minify content if specified
      this.pageList.forEach((page) => {
        page.html = minify(page.html);
      });
    }
  }

  async createPagesFor(indexFile: string | Buffer = null) {
    await this.setupDirectory();

    if (!indexFile) {
      const indexHtmlPath = join(this.options.distDir, "index.html");
      if (!isFileExists(indexHtmlPath))
        throw `'No index.html found at ${this.options.distDir} directory.`;

      console.log(`Picking up index.html from ${this.options.distDir}`);
      indexFile = fs.readFileSync(indexHtmlPath);
    }

    this.modifyHtml(indexFile);
    this.minifyPages();
    return this.pageList;
  }
}

export { SpaStaticPages, SpaStaticPagesOptions, DocumentNode, PageDetail };
