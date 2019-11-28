import {Configurations} from "./configurations";
import * as path from "path";

export abstract class ProjectConfigurations extends Configurations {
    // //  private _COMPOSE_FILE = path.join(__dirname, `../compose/spring-compose.yml`);
    // private _PARSE_COMPOSE_FILE = path.join(__dirname, `../compose/parse-compose.yml`);
    getParseComposePath(): String {
        return path.join(__dirname, `./compose-files/parse-compose.yml`);
    }
}
