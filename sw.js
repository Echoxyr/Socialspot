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

// Network-first resources (always
