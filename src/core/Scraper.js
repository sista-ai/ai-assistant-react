// src/core/Scraper.js
import Logger from './Logger';
class Scraper {
    constructor() {}

    getText = () => {
        let groupedTexts = {
            buttons: new Set(),
            links: new Set(),
            paragraphs: new Set(),
            headers: new Set(),
            others: new Set(), // To capture any other text elements
        };

        const walkDOM = (node) => {
            if (node) {
                node = node.firstChild;
                while (node != null) {
                    switch (node.nodeType) {
                        case 3: // Text node
                            const text = node.nodeValue.trim();
                            if (text) {
                                // Append text to others if it is not an obvious part of structured data
                                if (
                                    node.parentNode &&
                                    [
                                        'P',
                                        'H1',
                                        'H2',
                                        'H3',
                                        'H4',
                                        'H5',
                                        'H6',
                                        'BUTTON',
                                        'A',
                                    ].includes(node.parentNode.tagName)
                                ) {
                                    // Already handled by parent elements
                                } else {
                                    // Ensuring separation by checking sibling nodes
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
                        case 1: // Element node
                            if (
                                !['SCRIPT', 'STYLE'].includes(
                                    node.tagName.toUpperCase(),
                                )
                            ) {
                                const trimmedText = node.textContent.trim();
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
                                                node.href ||
                                                node.role === 'button'
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
                                            // Text is handled above in text node case
                                            break;
                                    }
                                }
                                walkDOM(node); // Continue walking the DOM
                            }
                            break;
                    }
                    node = node.nextSibling;
                }
            }
        };
        walkDOM(document.body);

        // Convert sets to arrays and ensure no trailing or leading spaces
        const result = {};
        for (const [key, value] of Object.entries(groupedTexts)) {
            result[key] = Array.from(value).map((text) => text.trim());
        }

        Logger.log('--[SISTA]-- Scraped Text:', result);
        return result;
    };
}

export default Scraper;
