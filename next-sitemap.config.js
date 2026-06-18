module.exports = {
  siteUrl: "https://munsoc.opensourcenitj.com",

  generateRobotsTxt: true,

  generateIndexSitemap: false,

  changefreq: "weekly",

  priority: 0.8,

  sitemapSize: 7000,

  exclude: ["/api/*", "/admin/*"],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],

    additionalSitemaps: ["https://munsoc.opensourcenitj.com/sitemap.xml"],
  },
};
