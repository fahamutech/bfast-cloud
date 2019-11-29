export interface EmailAdapter {
    sendEmail(to: string, from: string, message: string): Promise<any>
}
