document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Determine API URL based on environment
        const isProduction = window.location.hostname !== 'localhost';
        const apiBaseUrl = isProduction
            ? 'https://api.jornalinvestigador.pt'
            : 'http://localhost:3001';

        // Fetch ad configuration from the CMS API
        const response = await fetch(`${apiBaseUrl}/api/public/ads-config`);
        if (!response.ok) {
            console.error('Failed to fetch ad configuration:', response.status);
            return;
        }

        const adConfig = await response.json();

        // If ads are disabled globally, simply return
        if (!adConfig.adsEnabled) {
            console.log('Ads are globally disabled.');
            return;
        }

        const clientId = adConfig.adsenseClientId;
        if (!clientId) {
            console.warn('AdSense Client ID is missing. Cannot render ads.');
            return;
        }

        const adSlots = adConfig.adSlots || {};
        let scriptsAdded = false;

        // Find all ad slot containers on the page
        const adElements = document.querySelectorAll('.ad-slot[data-slot-id]');

        adElements.forEach((el) => {
            const slotId = el.getAttribute('data-slot-id');
            const slotConfig = adSlots[slotId];
            const container = el.closest('.ad-slot-container') || el;

            // Only inject the ad if the specific slot is enabled and has a valid slot ID
            if (slotConfig && slotConfig.enabled && slotConfig.slotId) {
                // Show the container (it's hidden by default in the template)
                container.style.display = 'flex';

                // Remove the mock pattern and texts
                el.innerHTML = '';

                // Keep the structural classes but remove the static styling if needed
                el.classList.remove('bg-neutral-100', 'border', 'border-neutral-200');

                // Create the AdSense ins tag
                const ins = document.createElement('ins');
                ins.className = 'adsbygoogle';
                ins.style.display = 'block';

                ins.setAttribute('data-ad-client', clientId);
                ins.setAttribute('data-ad-slot', slotConfig.slotId);
                ins.setAttribute('data-ad-format', 'auto');
                ins.setAttribute('data-full-width-responsive', 'true');

                el.appendChild(ins);

                // Initialize this specific ad
                try {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                } catch (e) {
                    console.error('Error initializing AdSense slot', e);
                }

                scriptsAdded = true;
            }
            // If slot is disabled, container stays hidden (default state)
        });

        // If at least one ad was injected, load the AdSense external script
        if (scriptsAdded) {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
        }

    } catch (error) {
        console.error('Error in ads integrator:', error);
    }
});
