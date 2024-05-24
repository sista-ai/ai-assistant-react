// src/core/Scraper.ts

import Logger from './Logger';

type GroupedTexts = {
    buttons: Set<string>;
    links: Set<string>;
    paragraphs: Set<string>;
    headers: Set<string>;
    others: Set<string>;
};

class Scraper {
    constructor() {}

    getText = (): Record<string, string[]> => {
        Logger.log('F: getText');

        let groupedTexts: GroupedTexts = {
            buttons: new Set(),
            links: new Set(),
            paragraphs: new Set(),
            headers: new Set(),
            others: new Set(),
        };

        const walkDOM = (node: Node | null): void => {
            if (node) {
                node = node.firstChild;
                while (node !== null) {
                    switch (node.nodeType) {
                        case 3:
                            const text = node.nodeValue?.trim();
                            if (text) {
                                if (
                                    node.parentNode &&
                                    node.parentNode instanceof Element
                                ) {
                                    // Already handled by parent elements
                                } else {
                                    let textWithSpacing = text;
                                    if (
                                        node.previousSibling &&
                                        node.previousSibling.nodeType !== 1
                                    ) {
                                        textWithSpacing = ' ' + text;
                                    }
                                    if (
                                        node.nextSibling &&
                                        node.nextSibling.nodeType !== 1
                                    ) {
                                        textWithSpacing += ' ';
                                    }
                                    groupedTexts.others.add(textWithSpacing);
                                }
                            }
                            break;
                        case 1:
                            if (
                                node instanceof Element &&
                                !['SCRIPT', 'STYLE'].includes(
                                    node.tagName.toUpperCase(),
                                )
                            ) {
                                const trimmedText = node.textContent?.trim();
                                if (trimmedText) {
                                    switch (node.tagName.toUpperCase()) {
                                        case 'P':
                                            groupedTexts.paragraphs.add(
                                                trimmedText,
                                            );
                                            break;
                                        case 'BUTTON':
                                            groupedTexts.buttons.add(
                                                trimmedText,
                                            );
                                            break;
                                        case 'A':
                                            if (
                                                node instanceof
                                                    HTMLAnchorElement &&
                                                (node.href ||
                                                    node.role === 'button')
                                            ) {
                                                groupedTexts.links.add(
                                                    trimmedText,
                                                );
                                            }
                                            break;
                                        case 'H1':
                                        case 'H2':
                                        case 'H3':
                                        case 'H4':
                                        case 'H5':
                                        case 'H6':
                                            groupedTexts.headers.add(
                                                trimmedText,
                                            );
                                            break;
                                        default:
                                            break;
                                    }
                                }
                                walkDOM(node);
                            }
                            break;
                    }
                    node = node.nextSibling;
                }
            }
        };

        walkDOM(document.body);

        const result: Record<string, string[]> = {};
        for (const [key, value] of Object.entries(groupedTexts)) {
            result[key] = Array.from(value).map((text) => text.trim());
        }

        Logger.log('Scraped Page Content:', result);
        return result;
    };
}

export default Scraper;
