import * as path from "path";
import {Options} from "./Options";

export abstract class ProjectConfigurations{
    protected constructor(private readonly options: Options) {
    }

    getComposeFile(filename: string): string {
        return path.join(__dirname, `./compose-files/${filename}-compose.yml`);
    }

    /**
     * @deprecated since v0.4.0-alpha and will be remove in v0.4.0
     * use this#getComposeFile(filename:string):string instead
     */
    getParseComposePath(): String {
        return path.join(__dirname, `./compose-files/parse-compose.yml`);
    }
}
