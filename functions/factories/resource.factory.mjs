import * as path from "path";
import * as fs from "fs";

export class ResourceFactory {

    /**
     *
     * @param projectType {"bfast" | "ssm"}
     * @return {string}
     */
    getComposeFile(projectType) {
        return path.join(__dirname, `./compose-files/${projectType}-compose.yml`);
    }

    /**
     *
     * @param name {string} template name
     * @return {string}
     */
    getHTML(name) {
        const file = path.join(__dirname, `./ui/${name}.html`);
        return fs.readFileSync(file).toString();
    }
}
