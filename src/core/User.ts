// src/core/User.ts

interface EndUserDetails {
    endUserAgent: string;
    generatedEndUserId: string;
    providedEndUserId: string | null;
}

class User {
    private providedUserId: string | null;

    constructor(providedUserId: string | null) {
        this.providedUserId = providedUserId;
    }

    public getEndUserDetails(): EndUserDetails {
        return {
            endUserAgent: navigator.userAgent,
            generatedEndUserId: this._generateEndUserId(),
            providedEndUserId: this.providedUserId,
        };
    }

    private _generateEndUserId(): string {
        let endUserId = localStorage.getItem('generatedEndUserId');
        if (!endUserId) {
            const timestamp = new Date().getTime();
            const randomPart = Math.random().toString(36).substring(2);
            endUserId = `${timestamp}-${randomPart}`;
            localStorage.setItem('generatedEndUserId', endUserId);
        }

        return endUserId;
    }
}

export default User;
