// Content Feed JavaScript
class ContentFeed {
    constructor() {
        this.container = document.getElementById('contentFeedContainer');
        this.apiUrl = 'http://128.140.47.138/api/content/latest';
        this.loadContent();
        // Reload content every 30 seconds
        setInterval(() => this.loadContent(), 30000);
    }

    async loadContent() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const contentItems = await response.json();
            this.displayContent(contentItems);
        } catch (error) {
            console.error('Error loading content:', error);
            this.displayError(error.message);
        }
    }

    displayContent(items) {
        if (!items || items.length === 0) {
            this.container.innerHTML = `
                <div class="loading-message">
                    📭 No content yet... waiting for posts in #teleportation!
                </div>
            `;
            return;
        }

        const contentHtml = items.map(item => this.createContentItem(item)).join('');
        this.container.innerHTML = contentHtml;
    }

    createContentItem(item) {
        const timestamp = new Date(item.timestamp).toLocaleString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        const icon = this.getTypeIcon(item.type);
        const content = this.formatContent(item.content, item.type);
        const linkPreview = this.createLinkPreview(item.content, item.type, item.title);

        return `
            <div class="content-item">
                <div class="content-author">
                    <span class="content-type-icon">${icon}</span>
                    ${item.author}
                </div>
                <div class="content-text">
                    ${content}
                </div>
                ${linkPreview}
                <div class="content-timestamp">
                    ${timestamp}
                </div>
            </div>
        `;
    }

    createLinkPreview(content, type, title = null) {
        // Extract URLs from content
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = content.match(urlRegex);
        
        if (!urls || urls.length === 0) return '';
        
        const url = urls[0]; // Use first URL
        const domain = this.extractDomain(url);
        
        // Generate preview based on URL type
        if (type === 'youtube') {
            return this.createYouTubePreview(url, domain, title);
        } else if (url.includes('spotify.com')) {
            return this.createSpotifyPreview(url, domain, title);
        } else if (url.includes('twitter.com') || url.includes('x.com')) {
            return this.createTwitterPreview(url, domain);
        } else {
            return this.createGenericPreview(url, domain);
        }
    }

    createYouTubePreview(url, domain, title = null) {
        const videoId = this.extractYouTubeId(url);
        if (!videoId) return this.createGenericPreview(url, domain);
        
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        
        // Use provided title or fetch it
        const displayTitle = title || "📺 YouTube Video";
        const description = title ? "YouTube Video" : "Lade Video-Titel...";
        
        // If no title provided, try to fetch it
        if (!title) {
            this.fetchYouTubeTitle(videoId).then(fetchedTitle => {
                const previewElement = document.querySelector(`[data-video-id="${videoId}"]`);
                if (previewElement && fetchedTitle) {
                    const titleElement = previewElement.querySelector('.link-preview-title');
                    if (titleElement) {
                        titleElement.textContent = fetchedTitle;
                    }
                }
            });
        }
        
        return `
            <div class="link-preview" data-video-id="${videoId}">
                <a href="${url}" target="_blank" style="text-decoration: none; color: inherit;">
                    <img src="${thumbnailUrl}" alt="YouTube Video" class="link-preview-image" loading="lazy">
                    <div class="link-preview-content">
                        <div class="link-preview-title">${displayTitle}</div>
                        <div class="link-preview-description">${description}</div>
                        <div class="link-preview-domain">${domain}</div>
                    </div>
                </a>
            </div>
        `;
    }

    createSpotifyPreview(url, domain, title = null) {
        const displayTitle = title || "🎧 Spotify Content";
        
        return `
            <div class="link-preview">
                <a href="${url}" target="_blank" style="text-decoration: none; color: inherit;">
                    <div class="link-preview-content">
                        <div class="link-preview-title">${displayTitle}</div>
                        <div class="link-preview-description">Auf Spotify anhören</div>
                        <div class="link-preview-domain">${domain}</div>
                    </div>
                </a>
            </div>
        `;
    }

    createTwitterPreview(url, domain) {
        return `
            <div class="link-preview">
                <a href="${url}" target="_blank" style="text-decoration: none; color: inherit;">
                    <div class="link-preview-content">
                        <div class="link-preview-title">🐦 Twitter/X Post</div>
                        <div class="link-preview-description">Tweet auf X/Twitter ansehen</div>
                        <div class="link-preview-domain">${domain}</div>
                    </div>
                </a>
            </div>
        `;
    }

    createGenericPreview(url, domain) {
        return `
            <div class="link-preview">
                <a href="${url}" target="_blank" style="text-decoration: none; color: inherit;">
                    <div class="link-preview-content">
                        <div class="link-preview-title">🔗 ${domain}</div>
                        <div class="link-preview-description">Link öffnen</div>
                        <div class="link-preview-domain">${domain}</div>
                    </div>
                </a>
            </div>
        `;
    }

    extractYouTubeId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    extractDomain(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return 'Link';
        }
    }

    getTypeIcon(type) {
        switch (type) {
            case 'youtube': return '📺';
            case 'podcast': return '🎧';
            case 'link': return '🔗';
            default: return '💬';
        }
    }

    formatContent(content, type) {
        // Make links clickable
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let formatted = content.replace(urlRegex, '<a href="$1" target="_blank" class="content-link">$1</a>');
        
        // Truncate long content
        if (formatted.length > 200) {
            formatted = formatted.substring(0, 200) + '...';
        }
        
        return formatted;
    }

    async fetchYouTubeTitle(videoId) {
        try {
            // Simple fallback since YouTube API requires key
            return `📺 YouTube Video (${videoId.substring(0, 8)}...)`;
        } catch (error) {
            console.error('Error fetching YouTube title:', error);
            return "📺 YouTube Video";
        }
    }

    displayError(message) {
        this.container.innerHTML = `
            <div class="error-message">
                ❌ Error loading content: ${message}
                <br><small>Make sure your Railway backend is running</small>
            </div>
        `;
    }
}

// Initialize content feed when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ContentFeed();
});
