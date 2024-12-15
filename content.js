let lastSeenCampaign = '';
let debugMode = true;
let recentlySeenNumbers = new Set();

const debugLog = (...args) => {
    if (debugMode) {
        console.log('#### ', ...args);
    }
};

debugLog('Extension Loaded!');

document.addEventListener('click', (event) => {
    const clickedElement = event.target;
    const itemContainer = clickedElement.closest('.item');

    if (itemContainer) {
        const campaignElement = itemContainer.querySelector('.column-campaign');
        if (campaignElement) {
            lastSeenCampaign = campaignElement.textContent.trim();
            debugLog('Campaign clicked:', lastSeenCampaign);
        }
    }
});

const phoneNumberObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (!(node instanceof HTMLElement)) return;

            if (node.matches('#address-book-sparse')) {
                const campaignSelect = node.querySelector('#AddressBookSparse-campaigns-select');
                if (campaignSelect && lastSeenCampaign) {
                    debugLog('Selecting campaign:', lastSeenCampaign);

                    Array.from(campaignSelect.options).forEach(option => {
                        if (option.text.includes(lastSeenCampaign)) {
                            campaignSelect.value = option.value;
                            debugLog('Selected campaign value:', option.value);
                        }
                    });
                }
            }

            const numberElement = node.querySelector('.f9-modal-body .select-number-button .number');
            if (numberElement) {
                const phoneNumber = numberElement.textContent.trim();

                // Skip if we've seen this number recently
                if (recentlySeenNumbers.has(phoneNumber)) return;

                // Add to recently seen and remove after 1 second
                // this is to prevent duplicate logs
                recentlySeenNumbers.add(phoneNumber);
                setTimeout(() => {
                    recentlySeenNumbers.delete(phoneNumber);
                }, 1000);

                const itemContainer = document.querySelector('.item');
                const campaignName = itemContainer ?
                    itemContainer.querySelector('.column-campaign')?.textContent.trim() : 'Unknown Campaign';

                debugLog('Phone Number Found:', phoneNumber);
                debugLog('Associated Campaign:', campaignName);
            }
        });
    });
});

debugLog('Observers Started');

phoneNumberObserver.observe(document.body, {
    childList: true,
    subtree: true
});
