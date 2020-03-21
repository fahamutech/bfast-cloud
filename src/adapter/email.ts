export interface EmailAdapter {
    sendEmail(to: string, from: string, subject: string, message: string): Promise<any>
}
