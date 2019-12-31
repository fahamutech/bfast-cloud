import {ResourcesAdapter} from "../adapters/resources";
import * as path from "path";

export class ResourceFactory implements ResourcesAdapter {
    getComposeFile(projectType: "bfast" | "ssm"): string {
        return path.join(__dirname, `./compose-files/${projectType}-compose.yml`);
    }
}
