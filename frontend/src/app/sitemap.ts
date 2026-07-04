import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ultfmt.com'

  const routes = [
    '',
    '/docs',
    '/mcp-studio',
    '/mcp-config-validator',
    '/token-estimator',
    '/prompt-diff',
    '/context-window-checker',
    '/dataset-health',
    '/feature-intelligence',
    '/learning-curve-plotter',
    '/rag-playground',
    '/ai-cost-calculator',
    '/privacy-policy',
    '/terms-of-service',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))
}
