/*
 * sw.js - SocialNet Neural Service Worker
 * Advanced PWA features with AI-powered offline capabilities
 */

const CACHE_NAME = 'socialnet-neural-v1.0.0';
const NEURAL_CACHE_NAME = 'neural-ai-cache-v1.0.0';
const STATIC_CACHE_NAME = 'neural-static-v1.0.0';

// Essential files for offline functionality
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/components.js', 
    '/style.css',
    '/manifest.json',
    '/utils/ai.js',
    'https://unpkg.com/react@18/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// AI-generated content that can be cached
const AI_CACHEABLE_PATTERNS = [
    /\/api\/ai\/suggestions/,
    /\/api\/ai\/bio-generate/,
    /\/api\/ai\/event-template/,
    /\/neural-stories/,
    /\/ai-insights/
];

// Network-first resources (always fetch fresh when online)
const NETWORK_FIRST_PATTERNS = [
    /\/api\/events/,
    /\/api\/profiles/,
    /\/api\/notifications/,
    /supabase/
];

// Install event - Cache essential resources
self.addEventListener('install', (event) => {
    console.log('🧠 Neural Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE_NAME).then((cache) => {
                console.log('📦 Caching static neural assets...');
                return cache.addAll(STATIC_ASSETS);
            }),
            
            // Initialize AI cache
            caches.open(NEURAL_CACHE_NAME).then((cache) => {
                console.log('🧠 Initializing AI cache...');
                return cache.put('/ai/offline-mode', new Response(JSON.stringify({
                    message: 'Neural AI offline mode active',
                    capabilities: ['basic_suggestions', 'cached_bio', 'offline_tips'],
                    timestamp: Date.now()
                })));
            })
        ])
    );
    
    self.skipWaiting();
});

// Activate event - Clean old caches
self.addEventListener('activate', (event) => {
    console.log('⚡ Neural Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete old versions
                    if (cacheName !== CACHE_NAME && 
                        cacheName !== NEURAL_CACHE_NAME && 
                        cacheName !== STATIC_CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    self.clients.claim();
});

// Fetch event - Neural caching strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-HTTP requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    event.respondWith(handleFetch(request));
});

// Advanced fetch handling with AI optimization
async function handleFetch(request) {
    const url = new URL(request.url);
    
    try {
        // Network-first for real-time data
        if (isNetworkFirst(url.pathname)) {
            return await networkFirst(request);
        }
        
        // AI content caching strategy
        if (isAICacheable(url.pathname)) {
            return await aiCacheStrategy(request);
        }
        
        // Static assets - cache-first
        if (isStaticAsset(url.pathname)) {
            return await cacheFirst(request);
        }
        
        // Default: stale-while-revalidate
        return await staleWhileRevalidate(request);
        
    } catch (error) {
        console.warn('🔴 Fetch error:', error);
        return await handleFetchError(request, error);
    }
}

// Network-first strategy for real-time data
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('📱 Serving from cache:', request.url);
            return cachedResponse;
        }
        throw error;
    }
}

// AI-optimized caching for neural content
async function aiCacheStrategy(request) {
    const cache = await caches.open(NEURAL_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Check cache freshness (AI content valid for 1 hour)
    if (cachedResponse) {
        const cacheTime = cachedResponse.headers.get('sw-cache-time');
        const isExpired = cacheTime && (Date.now() - parseInt(cacheTime)) > 3600000; // 1 hour
        
        if (!isExpired) {
            console.log('🧠 Serving fresh AI content from cache');
            return cachedResponse;
        }
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Add cache timestamp
            const responseToCache = new Response(networkResponse.body, {
                status: networkResponse.status,
                statusText: networkResponse.statusText,
                headers: {
                    ...Object.fromEntries(networkResponse.headers.entries()),
                    'sw-cache-time': Date.now().toString()
                }
            });
            
            cache.put(request, responseToCache.clone());
            return networkResponse;
        }
        
        // Return cached version on network failure
        return cachedResponse || networkResponse;
        
    } catch (error) {
        if (cachedResponse) {
            console.log('🧠 Serving stale AI content due to network error');
            return cachedResponse;
        }
        throw error;
    }
}

// Cache-first for static assets
async function cacheFirst(request) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Fetch in background
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => cachedResponse);
    
    // Return cached immediately if available, otherwise wait for network
    return cachedResponse || await fetchPromise;
}

// Error handling with offline fallbacks
async function handleFetchError(request, error) {
    const url = new URL(request.url);
    
    // Serve offline page for navigation requests
    if (request.mode === 'navigate') {
        const cache = await caches.open(STATIC_CACHE_NAME);
        const offlinePage = await cache.match('/');
        if (offlinePage) {
            return offlinePage;
        }
    }
    
    // AI offline suggestions
    if (url.pathname.includes('/ai/') || url.pathname.includes('/neural/')) {
        return new Response(JSON.stringify({
            error: 'Neural AI offline',
            message: 'AI features limited in offline mode',
            offlineCapabilities: [
                'View cached events',
                'Access saved profiles', 
                'Use basic features'
            ],
            suggestion: 'Connect to internet for full Neural AI experience'
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503
        });
    }
    
    // Generic offline response
    return new Response('Neural network temporarily unavailable', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

// Helper functions
function isNetworkFirst(pathname) {
    return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(pathname));
}

function isAICacheable(pathname) {
    return AI_CACHEABLE_PATTERNS.some(pattern => pattern.test(pathname));
}

function isStaticAsset(pathname) {
    return pathname.endsWith('.css') || 
           pathname.endsWith('.js') || 
           pathname.endsWith('.png') || 
           pathname.endsWith('.jpg') || 
           pathname.endsWith('.svg') ||
           pathname === '/manifest.json';
}

// Push notification handling with AI personalization
self.addEventListener('push', (event) => {
    console.log('🔔 Neural push notification received');
    
    let notificationData = {
        title: 'SocialNet Neural',
        body: 'New neural activity detected!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'neural-notification',
        requireInteraction: false,
        actions: [
            {
                action: 'view',
                title: 'View Neural',
                icon: '/icons/action-view.png'
            },
            {
                action: 'dismiss',
                title: 'Later',
                icon: '/icons/action-dismiss.png'
            }
        ],
        data: {
            url: '/',
            timestamp: Date.now()
        }
    };
    
    // Parse push data if available
    if (event.data) {
        try {
            const pushData = event.data.json();
            notificationData = { ...notificationData, ...pushData };
            
            // AI-enhanced notification content
            if (pushData.type === 'event_match') {
                notificationData.title = '🧠 Perfect Neural Match!';
                notificationData.body = `AI found an event with ${pushData.compatibility}% compatibility`;
                notificationData.tag = 'ai-match';
            } else if (pushData.type === 'avatar_message') {
                notificationData.title = '👤 Your Neural Avatar';
                notificationData.body = `Your AI responded to ${pushData.sender}`;
                notificationData.tag = 'avatar-activity';
            } else if (pushData.type === 'weekly_story') {
                notificationData.title = '📖 Neural Story';
                notificationData.body = 'Your weekly community story is ready!';
                notificationData.tag = 'weekly-story';
            }
            
        } catch (error) {
            console.warn('🔴 Error parsing push data:', error);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Neural notification clicked:', event.action);
    
    event.notification.close();
    
    let targetUrl = '/';
    
    // Handle different actions
    if (event.action === 'view') {
        targetUrl = event.notification.data?.url || '/';
    } else if (event.action === 'dismiss') {
        return; // Just close notification
    } else {
        // Default click - open app
        targetUrl = event.notification.data?.url || '/';
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Focus existing window if available
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin)) {
                        return client.focus();
                    }
                }
                
                // Open new window
                return clients.openWindow(targetUrl);
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('🔄 Neural background sync:', event.tag);
    
    if (event.tag === 'neural-sync') {
        event.waitUntil(syncNeuralData());
    } else if (event.tag === 'event-creation') {
        event.waitUntil(syncPendingEvents());
    } else if (event.tag === 'ai-interactions') {
        event.waitUntil(syncAIInteractions());
    }
});

// Sync neural data when back online
async function syncNeuralData() {
    try {
        console.log('🧠 Syncing neural data...');
        
        // Sync cached user actions
        const cache = await caches.open(NEURAL_CACHE_NAME);
        const pendingActions = await cache.match('/neural/pending-actions');
        
        if (pendingActions) {
            const actions = await pendingActions.json();
            
            for (const action of actions) {
                try {
                    await fetch('/api/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(action)
                    });
                } catch (error) {
                    console.warn('🔴 Failed to sync action:', action, error);
                }
            }
            
            // Clear synced actions
            await cache.delete('/neural/pending-actions');
        }
        
        console.log('✅ Neural sync completed');
    } catch (error) {
        console.error('🔴 Neural sync failed:', error);
    }
}

// Sync pending event creations
async function syncPendingEvents() {
    try {
        console.log('📅 Syncing pending events...');
        // Implementation for syncing events created offline
    } catch (error) {
        console.error('🔴 Event sync failed:', error);
    }
}

// Sync AI interactions
async function syncAIInteractions() {
    try {
        console.log('🤖 Syncing AI interactions...');
        // Implementation for syncing AI avatar interactions
    } catch (error) {
        console.error('🔴 AI sync failed:', error);
    }
}

// Periodic background updates
self.addEventListener('periodicsync', (event) => {
    console.log('⏰ Neural periodic sync:', event.tag);
    
    if (event.tag === 'neural-update') {
        event.waitUntil(updateNeuralCache());
    }
});

// Update neural cache periodically
async function updateNeuralCache() {
    try {
        console.log('🔄 Updating neural cache...');
        
        // Refresh AI suggestions
        const cache = await caches.open(NEURAL_CACHE_NAME);
        
        // Update weekly stories
        try {
            const response = await fetch('/api/weekly-story');
            if (response.ok) {
                await cache.put('/neural/weekly-story', response.clone());
            }
        } catch (error) {
            console.warn('Could not update weekly story cache');
        }
        
        console.log('✅ Neural cache updated');
    } catch (error) {
        console.error('🔴 Neural cache update failed:', error);
    }
}

// Message handling for client communication
self.addEventListener('message', (event) => {
    console.log('💬 Neural SW message:', event.data);
    
    if (event.data.type === 'CACHE_AI_CONTENT') {
        cacheAIContent(event.data.content);
    } else if (event.data.type === 'CLEAR_NEURAL_CACHE') {
        clearNeuralCache();
    } else if (event.data.type === 'GET_CACHE_STATUS') {
        getCacheStatus().then(status => {
            event.ports[0].postMessage(status);
        });
    }
});

// Cache AI-generated content
async function cacheAIContent(content) {
    try {
        const cache = await caches.open(NEURAL_CACHE_NAME);
        await cache.put(
            `/neural/ai-content/${content.id}`, 
            new Response(JSON.stringify(content))
        );
        console.log('🧠 AI content cached:', content.id);
    } catch (error) {
        console.error('🔴 Failed to cache AI content:', error);
    }
}

// Clear neural cache
async function clearNeuralCache() {
    try {
        await caches.delete(NEURAL_CACHE_NAME);
        console.log('🗑️ Neural cache cleared');
    } catch (error) {
        console.error('🔴 Failed to clear neural cache:', error);
    }
}

// Get cache status
async function getCacheStatus() {
    try {
        const cacheNames = await caches.keys();
        const status = {
            hasStatic: cacheNames.includes(STATIC_CACHE_NAME),
            hasNeural: cacheNames.includes(NEURAL_CACHE_NAME),
            hasMain: cacheNames.includes(CACHE_NAME),
            timestamp: Date.now()
        };
        
        if (status.hasNeural) {
            const neuralCache = await caches.open(NEURAL_CACHE_NAME);
            const neuralKeys = await neuralCache.keys();
            status.neuralItemsCount = neuralKeys.length;
        }
        
        return status;
    } catch (error) {
        console.error('🔴 Failed to get cache status:', error);
        return { error: error.message };
    }
}

console.log('🧠 SocialNet Neural Service Worker v1.0.0 loaded successfully!');
