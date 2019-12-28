import * as path from "path";
import {DatabaseConfigurations} from "./database";
import {Options} from "./Options";

export abstract class ProjectConfigurations extends DatabaseConfigurations {
    protected constructor(options: Options) {
        super(options);
    }

    getComposeFile(filename: string): string {
        return path.join(__dirname, `./compose-files/${filename}`);
    }

    /**
     * @deprecated since v0.4.0-alpha and will be remove in v0.4.0
     * use this#getComposeFile(filename:string):string instead
     */
    getParseComposePath(): String {
        return path.join(__dirname, `./compose-files/parse-compose.yml`);
    }
}
