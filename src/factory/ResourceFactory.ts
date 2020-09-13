import * as path from "path";
import * as fs from "fs";
import {ResourcesAdapter} from "../adapters/resources.adapter";

export class ResourceFactory implements ResourcesAdapter {
    getComposeFile(projectType: "bfast" | "ssm"): string {
        return path.join(__dirname, `./compose-files/${projectType}-compose.yml`);
    }

    getHTML(name: string): any {
        const file = path.join(__dirname, `./ui/${name}.html`);
        return fs.readFileSync(file).toString();
    }
}
