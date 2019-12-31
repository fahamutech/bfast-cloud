export interface ResourcesAdapter {
    getComposeFile(projectType: 'bfast' | 'ssm'): string;
}
