document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Determine API URL from meta tag or dynamically
        const apiBaseUrl = (() => {
            const meta = document.querySelector('meta[name="api-url"]');
            if (meta && meta.content) return meta.content;
            return window.location.hostname !== 'localhost'
                ? window.location.origin.replace('://', '://api.')
                : 'http://localhost:3001';
        })();

        // Fetch ad configuration from the CMS API
        const response = await fetch(`${apiBaseUrl}/api/public/ads-config`);
        if (!response.ok) {
            return;
        }

        const adConfig = await response.json();

        // If ads are disabled globally, simply return
        if (!adConfig.adsEnabled) {
            return;
        }

        const clientId = adConfig.adsenseClientId;
        const adSlots = adConfig.adSlots || {};
        let scriptsAdded = false;

        // Find all ad slot containers on the page
        const adElements = document.querySelectorAll('.ad-slot[data-slot-id]');

        adElements.forEach((el) => {
            const slotId = el.getAttribute('data-slot-id');
            const slotConfig = adSlots[slotId];
            const container = el.closest('.ad-slot-container') || el;

            // Check if slot is enabled (even if AdSense IDs aren't configured yet)
            if (slotConfig && slotConfig.enabled) {
                // Show the container (it's hidden by default in the template)
                container.style.display = 'flex';
                container.setAttribute('role', 'complementary');
                container.setAttribute('aria-label', 'Publicidade');

                // If we have both client ID and slot ID, inject real ad
                if (clientId && slotConfig.slotId) {
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
                        // AdSense initialization failed silently
                    }

                    scriptsAdded = true;
                }
                // If slot is enabled but missing AdSense IDs, show placeholder (default template content)
            }
            // If slot is disabled, container stays hidden (default state)
        });

        // If at least one ad was injected, load the AdSense external script
        if (scriptsAdded && clientId) {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
        }

    } catch (error) {
        // Ads integrator error - fail silently
    }
});
