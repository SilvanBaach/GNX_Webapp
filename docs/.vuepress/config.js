import {defaultTheme} from '@vuepress/theme-default'

module.exports = {
    base: "/GNX_Webapp/",
    public: "res/",
    lang: 'en-US',
    title: "GNX Webapp",
    description: "The one and only GNX Webapp",
    theme: defaultTheme({
        logo: "/logo/logo_white.png",
        editLink: true,
        lastUpdated: true,
        contributors: true,
        themePlugins: { // * disable or enable plugins
            externalLinkIcon: true, // ! do not disable because it breaks deployment on netlify
            backToTop: true,
        },
        sidebar: [
            {
                text: 'Use',
                collapsible: true,
                children: [
                    {
                        text: "Privacy Notice",
                        link: "/data-collection-and-privacy-notice/",
                        children: [],
                    },
                    {
                        text: "Use Case",
                        link: "/use-cases/",
                    }
                ],
            },
        ],
        navbar: [
            {
                text: "Privacy Notice",
                link: "/data-collection-and-privacy-notice/",
            },
        ],
    }),


    plugins: [],
}
