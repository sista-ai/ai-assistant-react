// src/core/User.ts
import { v4 as uuidv4 } from 'uuid';

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
        const localStorageKey = `SISTA-GID`;
        let endUserId = localStorage.getItem(localStorageKey);
        if (!endUserId) {
            endUserId = `GID-${uuidv4()}`;
            localStorage.setItem(localStorageKey, endUserId);
        }

        return endUserId;
    }
}
export default User;
