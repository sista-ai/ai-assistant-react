// src/core/User.ts

interface EndUserIds {
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

    getEndUserIds(): EndUserIds {
        return {
            generatedEndUserId: this.generatedUserId,
            providedEndUserId: this.providedUserId,
        };
    }

    private _generateEndUserId(): string {
        const timestamp = Date.now();
        const randomChars = this._generateRandomString(36);
        const localStorageKey = `SISTA-GID`;
        let endUserId = localStorage.getItem(localStorageKey);
        if (!endUserId) {
            endUserId = `GID-${randomChars}-${timestamp}`;
            localStorage.setItem(localStorageKey, endUserId);
        }

        return endUserId;
    }

    private _generateRandomString(length: number): string {
        let result = '';
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ-abcdefghijklmnopqrstuvwxyz-0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * characters.length),
            );
        }
        return result;
    }
}
export default User;
