// src/core/ErrorReporter.ts

import * as Sentry from '@sentry/react';
import config from './config';

class ErrorReporter {
    constructor() {
        Sentry.init({
            dsn: config.sentryDNS,
            integrations: [
                Sentry.browserTracingIntegration(),
                Sentry.replayIntegration(),
            ],
            tracePropagationTargets: [
                'localhost',
                new RegExp(`^${config.apiUrl}`),
            ],
            // TODO: reduce from 0.5 to 0.1 after Sep 2024
            tracesSampleRate: 0.5, // 50% of traces will be captured. Be cautious with a high number in production
            replaysSessionSampleRate: 0.5, // 50% of sessions will be replayed
            replaysOnErrorSampleRate: 1.0, // 100% of errors will be replayed
        });
    }

    captureException(error: unknown) {
        if (error instanceof Error) {
            Sentry.captureException(error);
        } else {
            Sentry.captureMessage(
                `Non-error exception captured: ${String(error)}`,
            );
        }
    }

    captureMessage(message: string) {
        Sentry.captureMessage(message);
    }
}

const errorReporter = new ErrorReporter();
export default errorReporter;
