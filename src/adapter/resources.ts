export interface ResourcesAdapter {
    getComposeFile(projectType: 'bfast' | 'ssm'): string;
    getHTML(name: string): any;
}
