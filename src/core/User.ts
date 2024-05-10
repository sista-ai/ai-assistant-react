// src/core/User.ts

interface EndUserDetails {
    endUserAgent: string;
    generatedEndUserId: string;
    providedEndUserId: string | null;
}

class User {
    private providedUserId: string | null;
    private generatedUserId: string;

    constructor(providedUserId: string | null) {
        this.providedUserId = providedUserId;
        this.generatedUserId = this._generateEndUserId();
    }

    public getEndUserDetails(): EndUserDetails {
        return {
            endUserAgent: navigator.userAgent,
            generatedEndUserId: this.generatedUserId,
            providedEndUserId: this.providedUserId,
        };
    }

    private _generateEndUserId(): string {
        const key = 'SS_DK_AG_EU_ID'; // Sista SDK Auto Generated End User ID
        let endUserId = localStorage.getItem(key);
        if (!endUserId) {
            const timestamp = new Date().getTime();
            const randomPart = Math.random().toString(36).substring(2);
            endUserId = `Sista:UID:${timestamp}:${randomPart}`;
            localStorage.setItem(key, endUserId);
        }

        return endUserId;
    }
}
export default User;
